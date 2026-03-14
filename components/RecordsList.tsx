"use client";

import ActionBtn from "@/components/common/ActionBtn";
import { calc, fmt } from "@/lib/calculations";
import type { ConsultationRecord, ToastMessage } from "@/types";

interface RecordsListProps {
  records: ConsultationRecord[];
  search: string;
  setSearch: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  onView: (rec: ConsultationRecord) => void;
  onEdit: (rec: ConsultationRecord) => void;
  onDelete: (id: string) => void;
  showToast: (msg: string, type?: ToastMessage["type"]) => void;
}

const STATUS_FILTERS = ["All", "Pending", "Received", "Partial"];

const TABLE_HEADERS = [
  "Pt Name", "Pt ID", "Bill Date", "Bill Amt", "My Share",
  "Tax", "Net Receivable", "Mode", "Status", "Actions",
];

export default function RecordsList({
  records,
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  onView,
  onEdit,
  onDelete,
  showToast,
}: RecordsListProps) {
  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.ptName.toLowerCase().includes(q) ||
      r.ptId.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const shareRecord = async (rec: ConsultationRecord) => {
    const d = calc(Number(rec.billAmount), Number(rec.sharePct), Number(rec.taxPct));
    const text = `Dr. Consultation Record\nPatient: ${rec.ptName} (${rec.ptId})\nBill Date: ${rec.billDate}\nBill Amount: ${fmt(rec.billAmount)}\nMy Share (${rec.sharePct}%): ${fmt(d.myShare)}\nTax (${rec.taxPct}%): ${fmt(d.taxAmt)}\nNet Receivable: ${fmt(d.net)}\nPayment: ${rec.paymentMode} | ${rec.status}`;
    if (navigator.share) {
      await navigator.share({ title: "Consultation Record", text });
    } else {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 14,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          style={{
            flex: 1,
            minWidth: 200,
            border: "1.5px solid #D0E4E4",
            borderRadius: 9,
            padding: "10px 16px",
            fontSize: 14,
            color: "#1A2A2A",
            outline: "none",
            background: "#fff",
            fontFamily: "'DM Sans', sans-serif",
          }}
          placeholder="🔍  Search by name or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="btn-hover"
              style={{
                background: filterStatus === s ? "#0F4C5C" : "#F0F7F7",
                color: filterStatus === s ? "#fff" : "#5A7A7A",
                border: filterStatus === s ? "1px solid #0F4C5C" : "1px solid #D0E4E4",
                borderRadius: 8,
                padding: "8px 15px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                transition: "all 0.15s",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div id="print-area">
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(15,76,92,0.06)",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#EEF5F5" }}>
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 14px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#5A8A8A",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const d = calc(Number(r.billAmount), Number(r.sharePct), Number(r.taxPct));
                const statusStyle =
                  r.status === "Received"
                    ? { background: "#E8F5F0", color: "#1A7A5E" }
                    : r.status === "Partial"
                    ? { background: "#EBF3FE", color: "#2980b9" }
                    : { background: "#FEF8EC", color: "#D4A853" };
                return (
                  <tr
                    key={r.id}
                    className="rec-row"
                    style={{
                      borderBottom: "1px solid #F0F7F7",
                      transition: "background 0.12s",
                    }}
                  >
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#2A3A3A", whiteSpace: "nowrap" }}>
                      <b>{r.ptName}</b>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#2A3A3A", whiteSpace: "nowrap" }}>{r.ptId}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#2A3A3A", whiteSpace: "nowrap" }}>{r.billDate}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#2A3A3A", whiteSpace: "nowrap" }}>{fmt(r.billAmount)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#2A3A3A", whiteSpace: "nowrap" }}>{fmt(d.myShare)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#C0392B", whiteSpace: "nowrap" }}>−{fmt(d.taxAmt)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#0F4C5C", whiteSpace: "nowrap" }}>{fmt(d.net)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#2A3A3A", whiteSpace: "nowrap" }}>{r.paymentMode}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#2A3A3A", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          borderRadius: 20,
                          padding: "3px 9px",
                          fontSize: 11,
                          fontWeight: 600,
                          ...statusStyle,
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#2A3A3A", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <ActionBtn icon="👁" onClick={() => onView(r)} title="View" />
                        <ActionBtn icon="✏️" onClick={() => onEdit(r)} title="Edit" />
                        <ActionBtn icon="📤" onClick={() => shareRecord(r)} title="Share" />
                        <ActionBtn icon="🗑" onClick={() => onDelete(r.id)} title="Delete" red />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      color: "#AACACA",
                      textAlign: "center",
                      padding: "32px 0",
                      fontSize: 14,
                    }}
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
