import { Badge } from "@fluentui/react-components";
import type { Mode, Priority } from "@/types/models";

export function PriorityPill({ priority }: { priority: Priority }) {
  return (
    <Badge appearance="tint" color={priority === "High" ? "danger" : "informative"}>
      {priority}
    </Badge>
  );
}

export function ModeBadge({ mode }: { mode: Mode }) {
  return (
    <Badge appearance="outline" color="brand">
      {mode}
    </Badge>
  );
}
