import type { DataProvider } from "./types";
import type { FreightEmail, FreightTriageItem } from "@/types/models";
import { OWNERS, seed } from "./mock-data";

// In-memory store backed by localStorage so Assign/Resolve survive a reload
// during a demo. Only the triage items mutate; emails are read-only.
const ITEMS_KEY = "te_fct_items_v1";
const EMAILS_KEY = "te_fct_emails_v1";

function load(): { items: FreightTriageItem[]; emails: FreightEmail[] } {
  let items: FreightTriageItem[] | null = null;
  let emails: FreightEmail[] | null = null;
  try {
    const ri = localStorage.getItem(ITEMS_KEY);
    if (ri) items = JSON.parse(ri);
    const re = localStorage.getItem(EMAILS_KEY);
    if (re) emails = JSON.parse(re);
  } catch {
    /* ignore corrupt cache */
  }
  if (!items) items = seed.buildItems();
  if (!emails) emails = seed.buildEmails();
  return { items, emails };
}

let { items, emails } = load();

function persist() {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    localStorage.setItem(EMAILS_KEY, JSON.stringify(emails));
  } catch {
    /* storage may be unavailable — fine for a demo */
  }
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function mutateItem(id: string, fn: (i: FreightTriageItem) => void): FreightTriageItem {
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error(`Triage item not found: ${id}`);
  fn(items[idx]);
  persist();
  return clone(items[idx]);
}

export const mockProvider: DataProvider = {
  async listItems() {
    await delay();
    return clone(items);
  },
  async getItem(id) {
    await delay(60);
    return clone(items.find((i) => i.id === id));
  },
  async listEmails() {
    await delay();
    return clone(emails);
  },
  async emailsForThread(threadId) {
    await delay(60);
    return clone(
      emails
        .filter((e) => e.threadId === threadId)
        .sort((a, b) => +new Date(a.receivedAt) - +new Date(b.receivedAt))
    );
  },
  async owners() {
    await delay(30);
    return [...OWNERS];
  },
  async assign(id, owner) {
    await delay();
    return mutateItem(id, (i) => {
      i.assignee = owner;
      i.state = "Assigned";
      i.resolvedAt = undefined;
    });
  },
  async resolve(id) {
    await delay();
    return mutateItem(id, (i) => {
      i.state = "Resolved";
      i.resolvedAt = new Date().toISOString();
    });
  },
  async reopen(id) {
    await delay();
    return mutateItem(id, (i) => {
      i.state = i.assignee ? "Assigned" : "Queue";
      i.resolvedAt = undefined;
    });
  },
  async markEmailProcessed(emailId) {
    await delay(40);
    const e = emails.find((x) => x.id === emailId);
    if (e) {
      e.processed = true;
      persist();
    }
  },
};

/** Demo helper — wipe the localStorage cache and re-seed. */
export function resetMockData() {
  localStorage.removeItem(ITEMS_KEY);
  localStorage.removeItem(EMAILS_KEY);
  const fresh = load();
  items = fresh.items;
  emails = fresh.emails;
}
