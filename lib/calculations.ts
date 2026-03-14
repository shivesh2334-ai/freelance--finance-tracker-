import type { DerivedValues, DashboardStats, ConsultationRecord } from "@/types";

export function calc(
  bill: number,
  sharePct: number,
  taxPct: number
): DerivedValues {
  const myShare = (bill * sharePct) / 100;
  const taxAmt = (myShare * taxPct) / 100;
  const net = myShare - taxAmt;
  return { myShare, taxAmt, net };
}

export function fmt(n: number | string): string {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function computeStats(records: ConsultationRecord[]): DashboardStats {
  return records.reduce(
    (acc, r) => {
      const d = calc(Number(r.billAmount), Number(r.sharePct), Number(r.taxPct));
      acc.totalBilled += Number(r.billAmount);
      acc.totalMyShare += d.myShare;
      acc.totalTax += d.taxAmt;
      acc.totalNet += d.net;
      if (r.status === "Received") acc.received += d.net;
      if (r.status === "Pending") acc.pending += d.net;
      return acc;
    },
    {
      totalBilled: 0,
      totalMyShare: 0,
      totalTax: 0,
      totalNet: 0,
      received: 0,
      pending: 0,
    }
  );
}
