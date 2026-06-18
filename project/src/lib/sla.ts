import type { FreightTriageItem, Priority, TriageState } from "@/types/models";
import { SLA_TARGET_HOURS } from "@/types/models";

export type SlaState = "On track" | "Due soon" | "Breached" | "Resolved";
export type AgeingBucket = "0–24h" | "24–48h" | "48h+";

const HOUR = 1000 * 60 * 60;

export function hoursBetween(fromIso: string, toIso: string): number {
  return (new Date(toIso).getTime() - new Date(fromIso).getTime()) / HOUR;
}

export function ageHours(item: FreightTriageItem, now = new Date()): number {
  return (now.getTime() - new Date(item.firstEmailAt).getTime()) / HOUR;
}

export function ageingBucket(item: FreightTriageItem, now = new Date()): AgeingBucket {
  const h = ageHours(item, now);
  if (h < 24) return "0–24h";
  if (h < 48) return "24–48h";
  return "48h+";
}

export function slaState(item: FreightTriageItem, now = new Date()): SlaState {
  if (item.state === "Resolved") return "Resolved";
  const due = new Date(item.slaDueAt).getTime();
  if (now.getTime() > due) return "Breached";
  const remainingH = (due - now.getTime()) / HOUR;
  // "Due soon" = within 25% of the target window.
  const target = SLA_TARGET_HOURS[item.priority];
  if (remainingH <= target * 0.25) return "Due soon";
  return "On track";
}

export function resolvedWithinSla(item: FreightTriageItem): boolean | undefined {
  if (item.state !== "Resolved" || !item.resolvedAt) return undefined;
  return new Date(item.resolvedAt).getTime() <= new Date(item.slaDueAt).getTime();
}

export function slaDueFrom(firstEmailIso: string, priority: Priority): string {
  return new Date(new Date(firstEmailIso).getTime() + SLA_TARGET_HOURS[priority] * HOUR).toISOString();
}

/** Human-friendly "3h 12m left" / "2h 5m over". */
export function slaCountdown(item: FreightTriageItem, now = new Date()): string {
  if (item.state === "Resolved") return "Resolved";
  const diffMin = Math.round((new Date(item.slaDueAt).getTime() - now.getTime()) / (1000 * 60));
  const over = diffMin < 0;
  const mins = Math.abs(diffMin);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m ${over ? "over" : "left"}`;
}

export const STATE_ORDER: TriageState[] = ["Queue", "Assigned", "Resolved"];
