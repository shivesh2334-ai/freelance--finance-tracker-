interface StatCardProps {
  label: string;
  val: string;
  color: string;
  icon: string;
}

export default function StatCard({ label, val, color, icon }: StatCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: "0 2px 8px rgba(15,76,92,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        borderTop: `3px solid ${color}`,
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          fontWeight: 700,
          color,
        }}
      >
        {val}
      </div>
      <div
        style={{
          color: "#7A9A9A",
          fontSize: 12,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
    </div>
  );
}
