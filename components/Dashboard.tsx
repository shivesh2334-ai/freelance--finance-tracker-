"use client";

import StatCard from "@/components/common/StatCard";
import { calc, fmt, computeStats } from "@/lib/calculations";
import type { ConsultationRecord } from "@/types";

interface DashboardProps {
  records: ConsultationRecord[];
  onViewRecord: (rec: ConsultationRecord) => void;
}

export default function Dashboard({ records, onViewRecord }: DashboardProps) {
  const stats = computeStats(records);

  const statCards = [
    { label: "Total Billed",   val: fmt(stats.totalBilled),  color: "#0F4C5C", icon: "📋" },
    { label: "My Share Total", val: fmt(stats.totalMyShare), color: "#1A7A5E", icon: "💰" },
    { label: "Tax Deducted",   val: fmt(stats.totalTax),     color: "#C0392B", icon: "📊" },
    { label: "Net Receivable", val: fmt(stats.totalNet),     color: "#7D3C98", icon: "🏦" },
    { label: "Received",       val: fmt(stats.received),     color: "#1A7A5E", icon: "✅" },
    { label: "Pending",        val: fmt(stats.pending),      color: "#D4A853", icon: "⏳" },
  ];

  return (
    <div id="print-area">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {statCards.map((s) => (
          <StatCard key={s.label} label={s.label} val={s.val} color={s.color} icon={s.icon} />
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "20px 24px",
          boxShadow: "0 2px 8px rgba(15,76,92,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 17,
              color: "#0F2A2A",
              fontWeight: 700,
            }}
          >
            Recent Consultations
          </span>
          <span
            style={{
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 600,
              background: "#E8F4F4",
              color: "#0F4C5C",
            }}
          >
            {records.length} total
          </span>
        </div>

        {records.slice(0, 5).map((r) => {
          const d = calc(Number(r.billAmount), Number(r.sharePct), Number(r.taxPct));
          const isReceived = r.status === "Received";
          return (
            <div
              key={r.id}
              className="rec-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 10px",
                borderBottom: "1px solid #F0F7F7",
                cursor: "pointer",
                borderRadius: 8,
                transition: "background 0.15s",
              }}
              onClick={() => onViewRecord(r)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#E8F4F4",
                    color: "#0F4C5C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {r.ptName[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "#1A2A2A", fontSize: 14 }}>
                    {r.ptName}
                  </div>
                  <div style={{ color: "#8AACAC", fontSize: 12, marginTop: 2 }}>
                    ID: {r.ptId} · {r.billDate}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 4,
                }}
              >
                <div style={{ fontWeight: 700, color: "#0F4C5C", fontSize: 15 }}>
                  {fmt(d.net)}
                </div>
                <span
                  style={{
                    borderRadius: 20,
                    padding: "3px 9px",
                    fontSize: 11,
                    fontWeight: 600,
                    background: isReceived ? "#E8F5F0" : "#FEF8EC",
                    color: isReceived ? "#1A7A5E" : "#D4A853",
                  }}
                >
                  {r.status}
                </span>
              </div>
            </div>
          );
        })}

        {records.length === 0 && (
          <div
            style={{
              color: "#AACACA",
              textAlign: "center",
              padding: "32px 0",
              fontSize: 14,
            }}
          >
            No records yet. Add your first consultation ↗
          </div>
        )}
      </div>
    </div>
  );
}
