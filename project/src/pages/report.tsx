import { useMemo } from "react";
import { makeStyles, shorthands, tokens, Card, Text, Title3, Caption1, Spinner, Badge } from "@fluentui/react-components";
import type { AgeingBucket } from "@/lib/sla";
import { ageingBucket, hoursBetween, resolvedWithinSla, slaState } from "@/lib/sla";
import { useItems } from "@/hooks/use-triage";

const useStyles = makeStyles({
  kpis: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", ...shorthands.gap("12px"), marginBottom: "18px" },
  kpi: { ...shorthands.padding("16px") },
  kpiLabel: { color: tokens.colorNeutralForeground3, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" },
  kpiValue: { fontSize: "28px", fontWeight: 800, marginTop: "4px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", ...shorthands.gap("16px"), alignItems: "start" },
  card: { ...shorthands.padding("18px") },
  barRow: { display: "grid", gridTemplateColumns: "140px 1fr 40px", alignItems: "center", ...shorthands.gap("10px"), ...shorthands.margin("8px", "0"), fontSize: "13px" },
  track: { backgroundColor: tokens.colorNeutralBackground3, ...shorthands.borderRadius("999px"), height: "16px", ...shorthands.overflow("hidden") },
  fill: { height: "100%", ...shorthands.borderRadius("999px") },
  loading: { display: "flex", justifyContent: "center", ...shorthands.padding("60px") },
  empty: { color: tokens.colorNeutralForeground3, fontSize: "13px", ...shorthands.padding("8px", "0") },
});

const BUCKET_COLOR: Record<AgeingBucket, string> = {
  "0–24h": "#067647",
  "24–48h": "#b54708",
  "48h+": "#b42318",
};

function Bars({ rows, color }: { rows: { label: string; value: number }[]; color?: (label: string) => string }) {
  const styles = useStyles();
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <div className={styles.empty}>None 🎉</div>;
  return (
    <>
      {rows.map((r) => (
        <div key={r.label} className={styles.barRow}>
          <Text>{r.label}</Text>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${(r.value / max) * 100}%`, backgroundColor: color ? color(r.label) : "#0078d4" }} />
          </div>
          <Text weight="semibold">{r.value}</Text>
        </div>
      ))}
    </>
  );
}

export function Report() {
  const styles = useStyles();
  const { data: items, isLoading } = useItems();

  const stats = useMemo(() => {
    const all = items ?? [];
    const open = all.filter((i) => i.state !== "Resolved");
    const resolved = all.filter((i) => i.state === "Resolved");

    const buckets: AgeingBucket[] = ["0–24h", "24–48h", "48h+"];
    const byBucket = buckets.map((b) => ({ label: b, value: open.filter((i) => ageingBucket(i) === b).length }));

    const breached = open.filter((i) => slaState(i) === "Breached");
    const groupCount = (arr: typeof all, key: (i: (typeof all)[number]) => string) => {
      const m = new Map<string, number>();
      arr.forEach((i) => m.set(key(i), (m.get(key(i)) ?? 0) + 1));
      return Array.from(m.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    };
    const breachByCarrier = groupCount(breached, (i) => i.carrier);
    const breachByOwner = groupCount(breached, (i) => i.assignee ?? "Unassigned");

    const withinSla = resolved.filter((i) => resolvedWithinSla(i) === true).length;
    const pctWithin = resolved.length ? Math.round((withinSla / resolved.length) * 100) : 0;
    const mttr = resolved.length
      ? Math.round(resolved.reduce((sum, i) => sum + hoursBetween(i.firstEmailAt, i.resolvedAt!), 0) / resolved.length)
      : 0;

    return { open, resolved, byBucket, breached, breachByCarrier, breachByOwner, pctWithin, mttr };
  }, [items]);

  if (isLoading || !items) {
    return <div className={styles.loading}><Spinner label="Crunching the numbers…" /></div>;
  }

  return (
    <div>
      <div className={styles.kpis}>
        <Card className={styles.kpi}><Text className={styles.kpiLabel}>Open items</Text><div className={styles.kpiValue}>{stats.open.length}</div></Card>
        <Card className={styles.kpi}><Text className={styles.kpiLabel}>SLA breaches (open)</Text><div className={styles.kpiValue} style={{ color: stats.breached.length ? "#b42318" : undefined }}>{stats.breached.length}</div></Card>
        <Card className={styles.kpi}><Text className={styles.kpiLabel}>Resolved within SLA</Text><div className={styles.kpiValue} style={{ color: "#067647" }}>{stats.pctWithin}%</div></Card>
        <Card className={styles.kpi}><Text className={styles.kpiLabel}>Mean time to resolve</Text><div className={styles.kpiValue}>{stats.mttr}h</div></Card>
      </div>

      <div className={styles.grid}>
        <Card className={styles.card}>
          <Title3>Open by ageing bucket</Title3>
          <Caption1>Time since the first email on the thread.</Caption1>
          <div style={{ marginTop: 10 }}>
            <Bars rows={stats.byBucket} color={(l) => BUCKET_COLOR[l as AgeingBucket]} />
          </div>
        </Card>

        <Card className={styles.card}>
          <Title3>SLA breaches by carrier</Title3>
          <Caption1>Open items past their SLA, grouped by carrier.</Caption1>
          <div style={{ marginTop: 10 }}>
            <Bars rows={stats.breachByCarrier} color={() => "#b42318"} />
          </div>
        </Card>

        <Card className={styles.card}>
          <Title3>SLA breaches by owner</Title3>
          <Caption1>Who has breached items right now.</Caption1>
          <div style={{ marginTop: 10 }}>
            <Bars rows={stats.breachByOwner} color={() => "#b54708"} />
          </div>
        </Card>

        <Card className={styles.card}>
          <Title3>Resolution snapshot</Title3>
          <Caption1>Across all resolved items in the store.</Caption1>
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge appearance="tint" color="success" size="large">{stats.resolved.length} resolved</Badge>
            <Badge appearance="tint" color="brand" size="large">{stats.pctWithin}% within SLA</Badge>
            <Badge appearance="tint" size="large">{stats.mttr}h MTTR</Badge>
          </div>
          <Caption1 style={{ marginTop: 12, display: "block" }}>No Power BI — this report runs on Dataverse aggregates inside the app (Phase 1).</Caption1>
        </Card>
      </div>
    </div>
  );
}
