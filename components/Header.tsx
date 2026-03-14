"use client";

import type { ViewType } from "@/types";

interface HeaderProps {
  view: ViewType;
  editId: string | null;
  onNewEntry: () => void;
}

const PAGE_TITLES: Record<ViewType, string> = {
  dashboard: "Dashboard",
  list: "All Records",
  invoice: "Invoice",
  add: "",
};

export default function Header({ view, editId, onNewEntry }: HeaderProps) {
  const title =
    view === "add" ? (editId ? "Edit Record" : "New Consultation") : PAGE_TITLES[view];

  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid #E0EBEB",
        padding: "18px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            color: "#0F2A2A",
            fontWeight: 700,
          }}
        >
          {title}
        </h1>
        <p style={{ color: "#7A9A9A", fontSize: 12, marginTop: 3 }}>
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn-hover"
          style={{
            background: "#F0F7F7",
            border: "1px solid #CCDEDE",
            borderRadius: 9,
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            color: "#0F4C5C",
            transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onClick={() => window.print()}
        >
          🖨 Print
        </button>
        <button
          className="btn-hover"
          style={{
            background: "#0F4C5C",
            color: "#fff",
            border: "1px solid #0F4C5C",
            borderRadius: 9,
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}
          onClick={onNewEntry}
        >
          ＋ New Entry
        </button>
      </div>
    </header>
  );
}
