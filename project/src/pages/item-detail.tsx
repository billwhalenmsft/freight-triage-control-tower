import { useNavigate, useParams } from "react-router-dom";
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  Text,
  Title2,
  Title3,
  Caption1,
  Body1,
  Button,
  Badge,
  Avatar,
  Spinner,
  Divider,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from "@fluentui/react-components";
import {
  ArrowLeft20Regular,
  PersonAdd20Regular,
  CheckmarkCircle20Regular,
  ArrowUndo20Regular,
  Attach16Regular,
  Warning16Filled,
} from "@fluentui/react-icons";
import { useAssign, useItem, useOwners, useReopen, useResolve, useThreadEmails } from "@/hooks/use-triage";
import { SlaBadge } from "@/components/sla-badge";
import { ModeBadge, PriorityPill } from "@/components/priority-pill";
import { ageingBucket, ageHours } from "@/lib/sla";
import { formatDateTime, timeAgo } from "@/lib/format";

const useStyles = makeStyles({
  back: { marginBottom: "12px" },
  header: { ...shorthands.padding("18px", "20px"), marginBottom: "16px" },
  titleRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", ...shorthands.gap("16px"), flexWrap: "wrap" },
  badges: { display: "flex", flexWrap: "wrap", alignItems: "center", ...shorthands.gap("8px"), marginTop: "10px" },
  actions: { display: "flex", ...shorthands.gap("8px"), marginTop: "14px", flexWrap: "wrap" },
  grid: { display: "grid", gridTemplateColumns: "2fr 1fr", ...shorthands.gap("16px"), alignItems: "start" },
  thread: { ...shorthands.padding("16px") },
  email: { backgroundColor: tokens.colorNeutralBackground2, ...shorthands.borderRadius("10px"), ...shorthands.padding("14px"), marginTop: "12px" },
  emailHead: { display: "flex", alignItems: "center", ...shorthands.gap("10px"), marginBottom: "8px" },
  emailMeta: { color: tokens.colorNeutralForeground3, fontSize: "12px" },
  body: { whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: "14px" },
  side: { ...shorthands.padding("16px") },
  kv: { display: "grid", ...shorthands.gap("10px"), marginTop: "8px" },
  kvItem: { display: "flex", flexDirection: "column" },
  kvKey: { color: tokens.colorNeutralForeground3, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" },
  chip: { fontFamily: "monospace", fontSize: "12px" },
  loading: { display: "flex", justifyContent: "center", ...shorthands.padding("60px") },
});

export function ItemDetail() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: item, isLoading } = useItem(id);
  const { data: emails = [] } = useThreadEmails(item?.threadId);
  const { data: owners = [] } = useOwners();
  const assign = useAssign();
  const resolve = useResolve();
  const reopen = useReopen();

  if (isLoading) {
    return <div className={styles.loading}><Spinner label="Loading item…" /></div>;
  }
  if (!item) {
    return (
      <div>
        <Button icon={<ArrowLeft20Regular />} appearance="subtle" onClick={() => navigate("/")}>Back</Button>
        <Text>Triage item not found.</Text>
      </div>
    );
  }

  return (
    <div>
      <Button className={styles.back} icon={<ArrowLeft20Regular />} appearance="subtle" onClick={() => navigate(-1)}>Back</Button>

      <Card className={styles.header}>
        <div className={styles.titleRow}>
          <div>
            <Title2>
              {item.needsAttention && <Warning16Filled style={{ color: tokens.colorPaletteRedForeground1, marginRight: 6, verticalAlign: "-2px" }} />}
              {item.name}
            </Title2>
            <div className={styles.badges}>
              <Badge appearance="ghost" color="brand">{item.carrier}</Badge>
              <ModeBadge mode={item.mode} />
              <PriorityPill priority={item.priority} />
              <Badge appearance="tint">{item.state}</Badge>
              <SlaBadge item={item} withCountdown />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Caption1>Owner</Caption1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              {item.assignee ? <Avatar size={24} name={item.assignee} /> : null}
              <Text weight="semibold">{item.assignee ?? "Unassigned"}</Text>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          {item.state !== "Resolved" && (
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button appearance={item.state === "Queue" ? "primary" : "secondary"} icon={<PersonAdd20Regular />}>
                  {item.assignee ? "Reassign" : "Assign"}
                </Button>
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
            <Button appearance="primary" icon={<CheckmarkCircle20Regular />} onClick={() => resolve.mutate({ id: item.id })}>Resolve</Button>
          )}
          {item.state === "Resolved" && (
            <Button icon={<ArrowUndo20Regular />} onClick={() => reopen.mutate({ id: item.id })}>Reopen</Button>
          )}
        </div>
      </Card>

      <div className={styles.grid}>
        <Card className={styles.thread}>
          <Title3>Email thread ({emails.length})</Title3>
          {emails.length === 0 && <Text className={styles.emailMeta}>No emails on this thread.</Text>}
          {emails.map((e) => (
            <div key={e.id} className={styles.email}>
              <div className={styles.emailHead}>
                <Avatar size={28} name={e.from} color="colorful" />
                <div>
                  <Text weight="semibold">{e.from}</Text>
                  <div className={styles.emailMeta}>{formatDateTime(e.receivedAt)} · {timeAgo(e.receivedAt)}</div>
                </div>
                {e.hasAttachment && <Badge appearance="tint" style={{ marginLeft: "auto" }}><Attach16Regular /> attachment</Badge>}
              </div>
              <Text className={styles.emailMeta}>To: {e.to}{e.cc ? ` · Cc: ${e.cc}` : ""}</Text>
              <Divider style={{ margin: "8px 0" }} />
              <Body1 className={styles.body}>{e.body}</Body1>
            </div>
          ))}
        </Card>

        <Card className={styles.side}>
          <Title3>Shipment details</Title3>
          <div className={styles.kv}>
            <div className={styles.kvItem}>
              <span className={styles.kvKey}>SH numbers</span>
              <Text className={styles.chip}>{item.shNumbers.join(", ")}</Text>
            </div>
            {item.hbl && <div className={styles.kvItem}><span className={styles.kvKey}>HBL</span><Text className={styles.chip}>{item.hbl}</Text></div>}
            {item.awb && <div className={styles.kvItem}><span className={styles.kvKey}>AWB</span><Text className={styles.chip}>{item.awb}</Text></div>}
            {item.mbl && <div className={styles.kvItem}><span className={styles.kvKey}>MBL</span><Text className={styles.chip}>{item.mbl}</Text></div>}
            <Divider />
            <div className={styles.kvItem}><span className={styles.kvKey}>To</span><Text>{item.toList}</Text></div>
            {item.ccList && <div className={styles.kvItem}><span className={styles.kvKey}>Cc</span><Text>{item.ccList}</Text></div>}
            <Divider />
            <div className={styles.kvItem}><span className={styles.kvKey}>Age</span><Text>{Math.round(ageHours(item))}h · {ageingBucket(item)}</Text></div>
            <div className={styles.kvItem}><span className={styles.kvKey}>First email</span><Text>{formatDateTime(item.firstEmailAt)}</Text></div>
            <div className={styles.kvItem}><span className={styles.kvKey}>SLA due</span><Text>{formatDateTime(item.slaDueAt)}</Text></div>
            {item.resolvedAt && <div className={styles.kvItem}><span className={styles.kvKey}>Resolved</span><Text>{formatDateTime(item.resolvedAt)}</Text></div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
