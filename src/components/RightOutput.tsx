import { Card, Typography, Timeline, Row, Col, Statistic, Divider } from "antd";
import type { ParseResult, ParsedEvent } from "../types/ical";
import { Tag } from "antd";

const { Paragraph, Text } = Typography;

type Props = { result: ParseResult };

function fmtDate(iso?: string) {
  console.log("fmtDate", iso);
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    console.log("date", d.toUTCString());
    const day = d.getUTCDate();
    console.log("day", day);
    const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    const year = d.getFullYear();
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    const ss = String(d.getUTCSeconds()).padStart(2, "0");

    const ordinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // Format: 1st Dec, 2025 @ 13:45:22
    return `${ordinal(day)} ${month} ${year} @ ${hh}:${mm}:${ss}`;
  } catch {
    return iso;
  }
}

export default function RightOutput({ result }: Props) {
  const events = "events" in result ? result.events : [];
  const error = "error" in result ? result.error : undefined;

  // Map distinct created strings to a color from the palette
  const palette = ["purple", "orange", "cyan", "magenta", "volcano", "gold", "geekblue"] as const;

  const createdValues = Array.from(new Set(events.map((e) => e.created ?? "")));
  const createdToColor = new Map<string, (typeof palette)[number]>();
  createdValues.forEach((val, i) => createdToColor.set(val, palette[i % palette.length]));

  const classify = (ev: ParsedEvent) => {
    // charge event: event_type = CHARGE and amount > 0
    if (ev.event_type === "CHARGE" && typeof ev.amount === "number" && ev.amount > 0) return "green";
    // pause event: event_type = PAUSE and amount = 0
    if (ev.event_type === "PAUSE" && ev.amount === 0) return "red";
    // unpause event: event_type = CHARGE and amount = 0
    if (ev.event_type === "CHARGE" && ev.amount === 0) return "blue";
    return "gray";
  };

  return (
    <div className="right-output pane" style={{ overflow: "auto" }}>
      <Card size="small">
        {error ? (
          <Paragraph type="danger">Parse error: {error}</Paragraph>
        ) : (
          <>
            <Row gutter={16} style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Col>
                <Statistic title="Total events" value={events.length} />
              </Col>
              <Col>
                <Statistic title="Distinct dtstamps" value={new Set(events.map((e) => e.created ?? "")).size} />
              </Col>
              <Col>
                <Statistic title="Charge events" value={events.filter((ev) => ev.event_type === "CHARGE" && typeof ev.amount === "number" && ev.amount > 0).length} />
              </Col>
              <Col>
                <Statistic title="Pause events" value={events.filter((ev) => ev.event_type === "PAUSE" && ev.amount === 0).length} />
              </Col>
            </Row>
            <Divider />
            <Timeline style={{ marginTop: 12 }}>
              {events.map((ev, idx) => (
                <Timeline.Item color={classify(ev)} key={ev.uid || idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ textAlign: "left" }}>
                      <Tag color={"black"} style={{ fontWeight: "bold" }}>
                        {fmtDate(ev.start ?? "-")}
                      </Tag>
                      <div>
                        <Text type="secondary">UID: {ev.uid || "—"}</Text>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div>
                        <Tag color={classify(ev)}>
                          {ev.event_type ?? "—"} {ev.amount ?? "—"}
                        </Tag>
                      </div>
                      <div>
                        <Tag color={createdToColor.get(ev.created ?? "")}>{fmtDate(ev.created)}</Tag>
                      </div>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </>
        )}
      </Card>
    </div>
  );
}
