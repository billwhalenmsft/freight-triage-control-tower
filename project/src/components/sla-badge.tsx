import { Badge } from "@fluentui/react-components";
import type { FreightTriageItem } from "@/types/models";
import { slaCountdown, slaState } from "@/lib/sla";

const COLOR = {
  "On track": "success",
  "Due soon": "warning",
  Breached: "danger",
  Resolved: "informative",
} as const;

export function SlaBadge({ item, withCountdown = false }: { item: FreightTriageItem; withCountdown?: boolean }) {
  const state = slaState(item);
  return (
    <Badge appearance="filled" color={COLOR[state]}>
      {state}
      {withCountdown && state !== "Resolved" ? ` · ${slaCountdown(item)}` : ""}
    </Badge>
  );
}
