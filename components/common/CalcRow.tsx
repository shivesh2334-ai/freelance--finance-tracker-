interface CalcRowProps {
  label: string;
  val: string;
  highlight?: boolean;
  red?: boolean;
  big?: boolean;
}

export default function CalcRow({ label, val, highlight, red, big }: CalcRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
        borderBottom: big ? "none" : "1px solid #EEF3F3",
      }}
    >
      <span
        style={{
          fontSize: big ? 15 : 13,
          fontWeight: big ? 600 : 400,
          color: "#4A6A6A",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: big ? 18 : 14,
          fontWeight: big ? 700 : 500,
          color: big ? "#0F4C5C" : red ? "#C0392B" : highlight ? "#1A7A5E" : "#333",
        }}
      >
        {val}
      </span>
    </div>
  );
}
