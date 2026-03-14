interface ActionBtnProps {
  icon: string;
  onClick: () => void;
  title: string;
  red?: boolean;
}

export default function ActionBtn({ icon, onClick, title, red }: ActionBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="btn-hover"
      style={{
        background: red ? "#FEF0F0" : "#F0F7F7",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        padding: "4px 8px",
        fontSize: 14,
        color: red ? "#C0392B" : "#0F4C5C",
        transition: "all 0.15s",
      }}
    >
      {icon}
    </button>
  );
}
