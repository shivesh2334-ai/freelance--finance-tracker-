import type { ToastMessage } from "@/types";

interface ToastProps {
  toast: ToastMessage;
}

const BG: Record<ToastMessage["type"], string> = {
  error: "#C0392B",
  info: "#2980b9",
  success: "#1A7A5E",
};

export default function Toast({ toast }: ToastProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        color: "#fff",
        borderRadius: 10,
        padding: "13px 22px",
        fontSize: 14,
        fontWeight: 600,
        boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
        zIndex: 1000,
        background: BG[toast.type],
      }}
    >
      {toast.msg}
    </div>
  );
}
