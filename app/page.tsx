"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import AddForm from "@/components/AddForm";
import RecordsList from "@/components/RecordsList";
import InvoiceView from "@/components/InvoiceView";
import Toast from "@/components/common/Toast";
import { loadRecords, saveRecords } from "@/lib/storage";
import { uid } from "@/lib/calculations";
import { EMPTY_FORM } from "@/lib/constants";
import type { ConsultationRecord, ToastMessage, ViewType } from "@/types";

export default function HomePage() {
  const [records, setRecords] = useState<ConsultationRecord[]>([]);
  const [view, setView] = useState<ViewType>("dashboard");
  const [form, setForm] = useState<Omit<ConsultationRecord, "id" | "createdAt">>({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState<ConsultationRecord | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRecords(loadRecords());
    setLoading(false);
  }, []);

  const showToast = (msg: string, type: ToastMessage["type"] = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const persist = (updated: ConsultationRecord[]) => {
    setRecords(updated);
    saveRecords(updated);
  };

  const handleSubmit = () => {
    if (!form.ptName || !form.billDate || !form.billAmount) {
      showToast("Please fill Patient Name, Bill Date & Amount", "error");
      return;
    }
    if (editId) {
      const updated = records.map((r) =>
        r.id === editId ? { ...r, ...form } : r
      );
      persist(updated);
      showToast("Record updated successfully");
    } else {
      const newRec: ConsultationRecord = {
        ...form,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      persist([newRec, ...records]);
      showToast("Record saved successfully");
    }
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setView("list");
  };

  const handleEdit = (rec: ConsultationRecord) => {
    setForm({ ...rec });
    setEditId(rec.id);
    setView("add");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this record?")) return;
    persist(records.filter((r) => r.id !== id));
    showToast("Record deleted", "info");
  };

  const handleNavigate = (newView: ViewType) => {
    setView(newView);
    setEditId(null);
    setForm({ ...EMPTY_FORM });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#EEF3F3",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #D0E4E4",
            borderTop: "3px solid #0F4C5C",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p
          style={{
            color: "#5C8A8A",
            marginTop: 16,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Loading records…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar
        view={view}
        onNavigate={handleNavigate}
        records={records}
      />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header view={view} editId={editId} onNewEntry={() => handleNavigate("add")} />

        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {view === "dashboard" && (
            <Dashboard
              records={records}
              onViewRecord={(rec) => {
                setSelectedRecord(rec);
                setView("invoice");
              }}
            />
          )}

          {view === "add" && (
            <AddForm
              form={form}
              setForm={setForm}
              editId={editId}
              onSubmit={handleSubmit}
              onCancel={() => {
                setForm({ ...EMPTY_FORM });
                setEditId(null);
                setView("list");
              }}
            />
          )}

          {view === "list" && (
            <RecordsList
              records={records}
              search={search}
              setSearch={setSearch}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onView={(rec) => {
                setSelectedRecord(rec);
                setView("invoice");
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showToast={showToast}
            />
          )}

          {view === "invoice" && selectedRecord && (
            <InvoiceView
              record={selectedRecord}
              onBack={() => setView("list")}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {toast && <Toast toast={toast} />}
    </div>
  );
}
