// Domain model for the Freight Triage Control Tower.
// Field names mirror the Dataverse build spec (te_freighttriageitem / te_freightemail)
// so the swap from the mock provider to the PAC-generated services is mechanical.

export type TriageState = "Queue" | "Assigned" | "Resolved";
export type Priority = "High" | "Medium";
export type Mode = "AIR" | "Ocean" | "Courier" | "Road" | "Rail" | "Unknown";

/** One row per email thread (conversation). All SH numbers for the thread are listed. */
export interface FreightTriageItem {
  id: string;
  /** dedupe key — Outlook conversationId or normalized subject */
  threadId: string;
  /** thread subject (primary name) */
  name: string;
  shNumbers: string[];
  carrier: string;
  mode: Mode;
  hbl?: string;
  awb?: string;
  mbl?: string;
  toList: string;
  ccList: string;
  /** first ~500 chars of the latest email */
  latestStatus: string;
  priority: Priority;
  state: TriageState;
  /** owner (assignee) — set on Assign */
  assignee?: string;
  /** sentiment / keyword HIGH flag */
  needsAttention: boolean;
  firstEmailAt: string; // ISO — ageing start
  latestEmailAt: string; // ISO
  slaDueAt: string; // ISO — firstEmailAt + SLA(priority)
  resolvedAt?: string; // ISO — set on Resolve
}

/** An email belonging to a thread (the Inbox + the per-item thread view). */
export interface FreightEmail {
  id: string;
  /** links the email to its FreightTriageItem */
  threadId: string;
  from: string;
  to: string;
  cc: string;
  subject: string;
  body: string;
  receivedAt: string; // ISO
  hasAttachment: boolean;
  /** has the Triage Upsert flow folded this email into its item */
  processed: boolean;
}

/** Configurable SLA targets (hours to resolve). */
export const SLA_TARGET_HOURS: Record<Priority, number> = {
  High: 24,
  Medium: 48,
};

export const MODES: Mode[] = ["AIR", "Ocean", "Courier", "Road", "Rail", "Unknown"];
