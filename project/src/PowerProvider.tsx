import type { ReactNode } from "react";

/**
 * Power Platform context wrapper.
 *
 * With @microsoft/power-apps v1.0 no explicit SDK initialization is required —
 * this is a passthrough today. When we bind to the real Master CE Mfg
 * environment (`pac code init` + `pac code add-data-source`), any required
 * provider/init wiring goes here so the rest of the app stays unchanged.
 */
export default function PowerProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
