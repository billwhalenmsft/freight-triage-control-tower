import type { DataProvider } from "./types";
import { mockProvider } from "./mock-provider";

/**
 * Single switch point for the app's data source.
 *
 * Today: the mock provider (runs offline, demo-ready).
 * Later: after `pac code init` + `pac code add-data-source` against the Master
 * CE Mfg environment, add `dataverse-provider.ts` that implements the same
 * `DataProvider` interface using the generated services in
 * `src/generated/services/`, then flip the line below.
 */
export const data: DataProvider = mockProvider;

export type { DataProvider } from "./types";
export { resetMockData } from "./mock-provider";
