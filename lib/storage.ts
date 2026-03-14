import { STORAGE_KEY } from "@/lib/constants";
import type { ConsultationRecord } from "@/types";

export function loadRecords(): ConsultationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as ConsultationRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: ConsultationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage unavailable — fail silently
  }
}
