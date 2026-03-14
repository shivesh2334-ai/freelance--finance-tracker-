interface InvoiceRowProps {
  label: string;
  val: string;
  highlight?: boolean;
}

export default function InvoiceRow({ label, val, highlight }: InvoiceRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid #EEF3F3",
      }}
    >
      <span style={{ color: "#7A9A9A", fontSize: 13 }}>{label}</span>
      <span
        style={{
          fontWeight: 600,
          color: highlight ? "#1A7A5E" : "#1A2A2A",
          fontSize: 14,
        }}
      >
        {val}
      </span>
    </div>
  );
}
