const styles: Record<string, React.CSSProperties> = {
  fieldWrap: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#5A7A7A",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    border: "1.5px solid #D0E4E4",
    borderRadius: 9,
    padding: "10px 13px",
    fontSize: 14,
    color: "#1A2A2A",
    outline: "none",
    background: "#FAFEFE",
    transition: "border-color 0.15s",
  },
};

interface Option {
  label: string;
  value: string;
}

interface FieldSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export default function FieldSelect({
  label,
  value,
  onChange,
  options,
}: FieldSelectProps) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <select
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
