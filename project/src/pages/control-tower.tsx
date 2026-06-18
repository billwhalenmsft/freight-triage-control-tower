import { useNavigate } from "react-router-dom";
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  Text,
  Title3,
  Caption1,
  Button,
  Badge,
  Avatar,
  Spinner,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from "@fluentui/react-components";
import { PersonAdd20Regular, CheckmarkCircle20Regular, ArrowUndo20Regular, Warning16Filled } from "@fluentui/react-icons";
import type { FreightTriageItem, TriageState } from "@/types/models";
import { STATE_ORDER, slaState } from "@/lib/sla";
import { useAssign, useItems, useOwners, useReopen, useResolve } from "@/hooks/use-triage";
import { SlaBadge } from "@/components/sla-badge";
import { ModeBadge, PriorityPill } from "@/components/priority-pill";

const useStyles = makeStyles({
  kpis: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", ...shorthands.gap("12px"), marginBottom: "18px" },
  kpi: { ...shorthands.padding("14px", "16px") },
  kpiLabel: { color: tokens.colorNeutralForeground3, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" },
  kpiValue: { fontSize: "26px", fontWeight: 800, marginTop: "4px" },
  kpiAlert: { color: tokens.colorPaletteRedForeground1 },
  board: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", ...shorthands.gap("16px"), alignItems: "start" },
  lane: { backgroundColor: tokens.colorNeutralBackground2, ...shorthands.borderRadius("12px"), ...shorthands.padding("12px"), minHeight: "120px" },
  laneHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  laneDot: { width: "10px", height: "10px", ...shorthands.borderRadius("50%"), display: "inline-block", marginRight: "8px" },
  cards: { display: "flex", flexDirection: "column", ...shorthands.gap("10px") },
  card: { ...shorthands.padding("14px") },
  cardTitle: { fontWeight: 700, fontSize: "14px", cursor: "pointer", lineHeight: 1.35 },
  meta: { display: "flex", flexWrap: "wrap", ...shorthands.gap("6px"), marginTop: "10px", marginBottom: "8px" },
  chip: { fontFamily: "monospace", fontSize: "11px", backgroundColor: tokens.colorNeutralBackground3, ...shorthands.padding("2px", "7px"), ...shorthands.borderRadius("6px") },
  row: { display: "flex", alignItems: "center", ...shorthands.gap("8px"), flexWrap: "wrap", marginTop: "8px" },
  actions: { display: "flex", ...shorthands.gap("8px"), marginTop: "12px", flexWrap: "wrap" },
  empty: { color: tokens.colorNeutralForeground3, textAlign: "center", ...shorthands.padding("18px"), fontSize: "13px" },
  loading: { display: "flex", justifyContent: "center", ...shorthands.padding("60px") },
});

const LANE_DOT: Record<TriageState, string> = {
  Queue: "#6941c6",
  Assigned: "#0078d4",
  Resolved: "#067647",
};

export function ControlTower() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { data: items, isLoading } = useItems();
  const { data: owners = [] } = useOwners();
  const assign = useAssign();
  const resolve = useResolve();
  const reopen = useReopen();

  if (isLoading || !items) {
    return (
      <div className={styles.loading}>
        <Spinner label="Loading triage board…" />
      </div>
    );
  }

  const open = items.filter((i) => i.state !== "Resolved");
  const breaches = items.filter((i) => slaState(i) === "Breached").length;
  const needs = items.filter((i) => i.needsAttention && i.state !== "Resolved").length;
  const kpis = [
    { label: "Open items", value: open.length },
    { label: "In Queue", value: items.filter((i) => i.state === "Queue").length },
    { label: "Assigned", value: items.filter((i) => i.state === "Assigned").length },
    { label: "SLA breaches", value: breaches, alert: breaches > 0 },
    { label: "Needs attention", value: needs, alert: needs > 0 },
  ];

  const card = (item: FreightTriageItem) => (
    <Card key={item.id} className={styles.card}>
      <div className={styles.row} style={{ justifyContent: "space-between", marginTop: 0 }}>
        <Text className={styles.cardTitle} onClick={() => navigate(`/item/${item.id}`)}>
          {item.needsAttention && <Warning16Filled style={{ color: tokens.colorPaletteRedForeground1, marginRight: 4, verticalAlign: "-2px" }} />}
          {item.name}
        </Text>
      </div>
      <div className={styles.meta}>
        <Badge appearance="ghost" color="brand">{item.carrier}</Badge>
        <ModeBadge mode={item.mode} />
        <PriorityPill priority={item.priority} />
      </div>
      <div className={styles.meta}>
        {item.shNumbers.map((sh) => (
          <span key={sh} className={styles.chip}>{sh}</span>
        ))}
      </div>
      <div className={styles.row}>
        <SlaBadge item={item} withCountdown />
        {item.assignee ? (
          <Avatar size={20} name={item.assignee} /> 
        ) : null}
        {item.assignee ? <Caption1>{item.assignee}</Caption1> : <Caption1>Unassigned</Caption1>}
      </div>
      <div className={styles.actions}>
        {item.state === "Queue" && (
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button size="small" appearance="primary" icon={<PersonAdd20Regular />}>Assign</Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {owners.map((o) => (
                  <MenuItem key={o} onClick={() => assign.mutate({ id: item.id, owner: o })}>{o}</MenuItem>
                ))}
              </MenuList>
            </MenuPopover>
          </Menu>
        )}
        {item.state === "Assigned" && (
          <>
            <Button size="small" appearance="primary" icon={<CheckmarkCircle20Regular />} onClick={() => resolve.mutate({ id: item.id })}>
              Resolve
            </Button>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button size="small" icon={<PersonAdd20Regular />}>Reassign</Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {owners.map((o) => (
                    <MenuItem key={o} onClick={() => assign.mutate({ id: item.id, owner: o })}>{o}</MenuItem>
                  ))}
                </MenuList>
              </MenuPopover>
            </Menu>
          </>
        )}
        {item.state === "Resolved" && (
          <Button size="small" icon={<ArrowUndo20Regular />} onClick={() => reopen.mutate({ id: item.id })}>Reopen</Button>
        )}
        <Button size="small" appearance="subtle" onClick={() => navigate(`/item/${item.id}`)}>Open</Button>
      </div>
    </Card>
  );

  return (
    <div>
      <div className={styles.kpis}>
        {kpis.map((k) => (
          <Card key={k.label} className={styles.kpi}>
            <Text className={styles.kpiLabel}>{k.label}</Text>
            <div className={`${styles.kpiValue} ${k.alert ? styles.kpiAlert : ""}`}>{k.value}</div>
          </Card>
        ))}
      </div>

      <div className={styles.board}>
        {STATE_ORDER.map((state) => {
          const laneItems = items.filter((i) => i.state === state);
          return (
            <div key={state} className={styles.lane}>
              <div className={styles.laneHead}>
                <Title3>
                  <span className={styles.laneDot} style={{ backgroundColor: LANE_DOT[state] }} />
                  {state}
                </Title3>
                <Badge appearance="tint">{laneItems.length}</Badge>
              </div>
              <div className={styles.cards}>
                {laneItems.length === 0 ? <div className={styles.empty}>Nothing here</div> : laneItems.map(card)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
