import { useEffect, useState } from "react";
import LeftEditor from "./LeftEditor";
import RightOutput from "./RightOutput";
import "./SplitView.css";
import ICAL from "ical.js";

import type { ParsedEvent, ParseResult } from "../types/ical";

function parseIcs(input: string): ParseResult {
  if (!input.trim()) return { events: [] };

  try {
    const jcal = ICAL.parse(input);
    const comp = new ICAL.Component(jcal);
    const vevents = comp.getAllSubcomponents("vevent");

    if (!vevents.length) return { events: [] };

    const isIcalTime = (o: unknown): o is { toJSDate: () => Date } => {
      return !!o && typeof (o as { toJSDate?: unknown }).toJSDate === "function";
    };

    const items: ParsedEvent[] = vevents.map((ve) => {
      const event = new ICAL.Event(ve);

      const dtstamp = ve.getFirstPropertyValue("dtstamp");
      const dtstart = ve.getFirstPropertyValue("dtstart");
      const dtend = ve.getFirstPropertyValue("dtend");
      const description = ve.getFirstPropertyValue("description");

      console.log(isIcalTime(dtstamp) ? dtstamp.toJSDate().toISOString() : String(dtstamp));

      const start = dtstart ? (isIcalTime(dtstart) ? dtstart.toJSDate().toISOString() : String(dtstart)) : undefined;
      const end = dtend ? (isIcalTime(dtend) ? dtend.toJSDate().toISOString() : String(dtend)) : undefined;
      const created = dtstamp ? (isIcalTime(dtstamp) ? dtstamp.toJSDate().toISOString() : String(dtstamp)) : undefined;

      // Safely parse description which may contain JSON. Try direct parse, then attempt to extract JSON substring.
      let descParsed: unknown = undefined;
      if (description) {
        const raw = String(description);
        try {
          descParsed = JSON.parse(raw);
        } catch {
          // attempt to find a JSON object inside the string
          const first = raw.indexOf("{");
          const last = raw.lastIndexOf("}");
          if (first !== -1 && last !== -1 && last > first) {
            const sub = raw.substring(first, last + 1);
            try {
              descParsed = JSON.parse(sub);
            } catch {
              descParsed = raw;
            }
          } else {
            descParsed = raw;
          }
        }
      }

      // Extract amount and event_type if present in parsed description
      let amount: number | undefined = undefined;
      let event_type: string | undefined = undefined;
      if (descParsed && typeof descParsed === "object") {
        const dp = descParsed as Record<string, unknown>;
        if (typeof dp.amount === "number") amount = dp.amount;
        if (typeof dp.event_type === "string") event_type = dp.event_type;
      }

      return {
        summary: (event.summary as string) || "",
        created,
        start,
        end,
        uid: (event.uid as string) || "",
        description: descParsed,
        amount,
        event_type,
      };
    });

    return { events: items };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: msg };
  }
}

export default function SplitView() {
  const [text, setText] = useState<string>("");
  const [result, setResult] = useState<ParseResult>({ events: [] });

  // Debounce parsing so it doesn't run on every keystroke
  useEffect(() => {
    const id = setTimeout(() => {
      setResult(parseIcs(text));
    }, 300);
    return () => clearTimeout(id);
  }, [text]);

  return (
    <div className="split-view">
      <LeftEditor value={text} onChange={setText} />
      <RightOutput result={result} />
    </div>
  );
}
