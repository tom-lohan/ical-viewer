import { Input } from "antd";

const { TextArea } = Input;

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function LeftEditor({ value, onChange }: Props) {
  return (
    <div className="left-editor pane">
      <TextArea value={value} onChange={(e) => onChange(e.target.value)} placeholder="Enter text here..." style={{ height: "100%", resize: "none", overflow: "auto" }} />
    </div>
  );
}
