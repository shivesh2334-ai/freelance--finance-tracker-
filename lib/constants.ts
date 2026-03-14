import type { TaxRate } from "@/types";

export const STORAGE_KEY = "medconsult-records";

export const TAX_RATES: TaxRate[] = [
  { label: "None (0%)", value: 0 },
  { label: "10%", value: 10 },
  { label: "30%", value: 30 },
  { label: "40%", value: 40 },
];

export const SHARE_PCT_OPTIONS = ["10", "20", "25", "30", "35", "40", "50"];

export const PAYMENT_MODES = ["Cheque", "UPI", "Bank Transfer", "Cash"];

export const STATUSES = ["Pending", "Received", "Partial"] as const;

export const EMPTY_FORM = {
  ptName: "",
  ptId: "",
  billDate: "",
  billAmount: "",
  sharePct: "30",
  taxPct: "0",
  paymentMode: "UPI",
  receiptDate: "",
  notes: "",
  status: "Pending" as const,
};
