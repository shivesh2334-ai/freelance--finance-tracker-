export interface ConsultationRecord {
  id: string;
  ptName: string;
  ptId: string;
  billDate: string;
  billAmount: string;
  sharePct: string;
  taxPct: string;
  paymentMode: string;
  receiptDate: string;
  notes: string;
  status: "Pending" | "Received" | "Partial";
  createdAt: string;
}

export interface DerivedValues {
  myShare: number;
  taxAmt: number;
  net: number;
}

export interface ToastMessage {
  msg: string;
  type: "success" | "error" | "info";
}

export interface DashboardStats {
  totalBilled: number;
  totalMyShare: number;
  totalTax: number;
  totalNet: number;
  received: number;
  pending: number;
}

export type ViewType = "dashboard" | "add" | "list" | "invoice";

export type StatusFilter = "All" | "Pending" | "Received" | "Partial";

export interface TaxRate {
  label: string;
  value: number;
}
