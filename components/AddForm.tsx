"use client";

import Field from "@/components/common/Field";
import FieldSelect from "@/components/common/FieldSelect";
import CalcRow from "@/components/common/CalcRow";
import { calc, fmt } from "@/lib/calculations";
import { TAX_RATES, SHARE_PCT_OPTIONS, PAYMENT_MODES, STATUSES } from "@/lib/constants";
import type { ConsultationRecord } from "@/types";

type FormState = Omit<ConsultationRecord, "id" | "createdAt">;

interface AddFormProps {
  form: FormState;
  setForm: (form: FormState) => void;
  editId: string | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function AddForm({
  form,
  setForm,
  editId,
  onSubmit,
  onCancel,
}: AddFormProps) {
  const f = form;
  const fDerived = calc(Number(f.billAmount), Number(f.sharePct), Number(f.taxPct));

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "28px 32px",
        boxShadow: "0 2px 8px rgba(15,76,92,0.06)",
        maxWidth: 820,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <Field
          label="Patient Name *"
          value={f.ptName}
          onChange={(v) => setForm({ ...f, ptName: v })}
          placeholder="e.g. Ajay Sharma"
        />
        <Field
          label="Patient ID *"
          value={f.ptId}
          onChange={(v) => setForm({ ...f, ptId: v })}
          placeholder="e.g. 0001"
        />
        <Field
          label="Bill Date *"
          type="date"
          value={f.billDate}
          onChange={(v) => setForm({ ...f, billDate: v })}
        />
        <Field
          label="Bill Amount (₹) *"
          type="number"
          value={f.billAmount}
          onChange={(v) => setForm({ ...f, billAmount: v })}
          placeholder="0.00"
        />
        <FieldSelect
          label="My Share %"
          value={f.sharePct}
          onChange={(v) => setForm({ ...f, sharePct: v })}
          options={SHARE_PCT_OPTIONS.map((x) => ({ label: `${x}%`, value: x }))}
        />
        <FieldSelect
          label="Tax Deduction"
          value={f.taxPct}
          onChange={(v) => setForm({ ...f, taxPct: v })}
          options={TAX_RATES.map((t) => ({ label: t.label, value: String(t.value) }))}
        />
        <FieldSelect
          label="Payment Mode"
          value={f.paymentMode}
          onChange={(v) => setForm({ ...f, paymentMode: v })}
          options={PAYMENT_MODES.map((x) => ({ label: x, value: x }))}
        />
        <Field
          label="Date of Receipt"
          type="date"
          value={f.receiptDate}
          onChange={(v) => setForm({ ...f, receiptDate: v })}
        />
        <FieldSelect
          label="Status"
          value={f.status}
          onChange={(v) => setForm({ ...f, status: v as ConsultationRecord["status"] })}
          options={STATUSES.map((x) => ({ label: x, value: x }))}
        />
        <Field
          label="Notes"
          value={f.notes}
          onChange={(v) => setForm({ ...f, notes: v })}
          placeholder="Optional"
        />
      </div>

      {Number(f.billAmount) > 0 && (
        <div
          style={{
            background: "#F5FAFA",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 20,
            border: "1px solid #D4EAEA",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#7AACAC",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: 14,
            }}
          >
            Live Calculation
          </div>
          <div style={{ maxWidth: 340 }}>
            <CalcRow label="Bill Amount" val={fmt(f.billAmount)} />
            <CalcRow
              label={`My Share (${f.sharePct}%)`}
              val={fmt(fDerived.myShare)}
              highlight
            />
            <CalcRow
              label={`Tax Deduction (${f.taxPct}%)`}
              val={`− ${fmt(fDerived.taxAmt)}`}
              red
            />
            <div style={{ borderBottom: "2px solid #D4EAEA", margin: "10px 0" }} />
            <CalcRow label="Final Net Receivable" val={fmt(fDerived.net)} big />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button
          className="btn-hover"
          onClick={onCancel}
          style={{
            background: "#F0F7F7",
            color: "#0F4C5C",
            border: "1.5px solid #CCDEDE",
            borderRadius: 10,
            padding: "12px 24px",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Cancel
        </button>
        <button
          className="btn-hover"
          onClick={onSubmit}
          style={{
            background: "linear-gradient(135deg, #0F4C5C, #1A7A5E)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 28px",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            transition: "all 0.2s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {editId ? "Update Record" : "Save Record"}
        </button>
      </div>
    </div>
  );
}
