"use client";

import type { ConsultationRecord, ViewType } from "@/types";

interface SidebarProps {
  view: ViewType;
  onNavigate: (view: ViewType) => void;
  records: ConsultationRecord[];
}

const NAV_ITEMS = [
  { id: "dashboard" as ViewType, icon: "◈", label: "Dashboard" },
  { id: "add" as ViewType, icon: "＋", label: "New Entry" },
  { id: "list" as ViewType, icon: "≡", label: "All Records" },
];

export default function Sidebar({ view, onNavigate, records }: SidebarProps) {
  const exportCSV = () => {
    const headers = [
      "Pt Name", "Pt ID", "Bill Date", "Bill Amount", "Share %",
      "My Share", "Tax %", "Tax Amount", "Net Receivable",
      "Payment Mode", "Receipt Date", "Status", "Notes",
    ];
    const rows = records.map((r) => {
      const myShare = (Number(r.billAmount) * Number(r.sharePct)) / 100;
      const taxAmt = (myShare * Number(r.taxPct)) / 100;
      const net = myShare - taxAmt;
      return [
        r.ptName, r.ptId, r.billDate, r.billAmount, r.sharePct,
        myShare.toFixed(2), r.taxPct, taxAmt.toFixed(2), net.toFixed(2),
        r.paymentMode, r.receiptDate, r.status, r.notes,
      ]
        .map((v) => `"${v}"`)
        .join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "MedConsult_Finance.csv";
    a.click();
  };

  return (
    <aside
      style={{
        width: 240,
        background: "linear-gradient(160deg, #0F4C5C 0%, #1A7A5E 100%)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "28px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 28,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 10,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ⚕
          </span>
          <div>
            <div
              style={{
                color: "#fff",
                fontFamily: "'Playfair Display', serif",
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              MedFinance
            </div>
            <div
              style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 }}
            >
              Consultation Tracker
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 12px" }}>
        {NAV_ITEMS.map((n) => (
          <div
            key={n.id}
            className="nav-item"
            onClick={() => onNavigate(n.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: view === n.id ? "#fff" : "rgba(255,255,255,0.7)",
              padding: "11px 14px",
              borderRadius: 10,
              cursor: "pointer",
              transition: "background 0.15s",
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 4,
              background: view === n.id ? "rgba(255,255,255,0.18)" : "transparent",
            }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
              {n.icon}
            </span>
            {n.label}
          </div>
        ))}
      </nav>

      {/* Export */}
      <div style={{ padding: "20px" }}>
        <button
          className="btn-hover"
          onClick={exportCSV}
          style={{
            width: "100%",
            background: "rgba(212,168,83,0.9)",
            color: "#1A1A1A",
            border: "none",
            borderRadius: 10,
            padding: "11px 0",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
            transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ↓ Export to Google Sheets
        </button>
      </div>
    </aside>
  );
}
