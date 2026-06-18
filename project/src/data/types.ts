import type { FreightEmail, FreightTriageItem } from "@/types/models";

/**
 * The single data contract the whole app talks to. The mock provider implements
 * it today; a `dataverse-provider.ts` will implement the SAME interface against
 * the PAC-generated services in `src/generated/services/` once we bind to the
 * Master CE Mfg environment. Swapping is a one-line change in `data/index.ts`.
 */
export interface DataProvider {
  listItems(): Promise<FreightTriageItem[]>;
  getItem(id: string): Promise<FreightTriageItem | undefined>;

  listEmails(): Promise<FreightEmail[]>;
  emailsForThread(threadId: string): Promise<FreightEmail[]>;

  /** Assignable operations-team members (seeds the people picker). */
  owners(): Promise<string[]>;

  assign(id: string, owner: string): Promise<FreightTriageItem>;
  resolve(id: string): Promise<FreightTriageItem>;
  reopen(id: string): Promise<FreightTriageItem>;
  markEmailProcessed(emailId: string): Promise<void>;
}
