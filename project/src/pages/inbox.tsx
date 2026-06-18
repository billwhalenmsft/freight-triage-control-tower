import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  Text,
  Caption1,
  Badge,
  Button,
  Input,
  Dropdown,
  Option,
  Checkbox,
  Spinner,
  Avatar,
  Divider,
  OverlayDrawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
} from "@fluentui/react-components";
import {
  Attach16Regular,
  Mail20Regular,
  MailRead20Regular,
  Open16Regular,
  Dismiss24Regular,
  Search20Regular,
} from "@fluentui/react-icons";
import type { FreightEmail, FreightTriageItem } from "@/types/models";
import { MODES } from "@/types/models";
import { useEmails, useItems } from "@/hooks/use-triage";
import { formatDateTime, timeAgo } from "@/lib/format";
import { PriorityPill, ModeBadge } from "@/components/priority-pill";

const useStyles = makeStyles({
  filters: { display: "flex", flexWrap: "wrap", alignItems: "flex-end", ...shorthands.gap("12px"), marginBottom: "14px" },
  field: { display: "flex", flexDirection: "column", ...shorthands.gap("4px") },
  list: { display: "flex", flexDirection: "column", ...shorthands.gap("8px") },
  row: {
    display: "grid",
    gridTemplateColumns: "32px 1fr auto",
    alignItems: "center",
    ...shorthands.gap("12px"),
    ...shorthands.padding("12px", "14px"),
    cursor: "pointer",
  },
  rowUnread: { ...shorthands.borderLeft("3px", "solid", tokens.colorBrandStroke1) },
  subject: { fontWeight: 600, fontSize: "14px" },
  sub: { color: tokens.colorNeutralForeground3, fontSize: "12px" },
  metaRow: { display: "flex", flexWrap: "wrap", alignItems: "center", ...shorthands.gap("6px"), marginTop: "4px" },
  right: { display: "flex", alignItems: "center", ...shorthands.gap("10px") },
  empty: { color: tokens.colorNeutralForeground3, textAlign: "center", ...shorthands.padding("40px"), fontSize: "13px" },
  loading: { display: "flex", justifyContent: "center", ...shorthands.padding("60px") },
  body: { whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: "14px", marginTop: "12px" },
  kv: { display: "grid", gridTemplateColumns: "90px 1fr", ...shorthands.gap("6px", "10px"), fontSize: "13px", marginTop: "8px" },
  kvKey: { color: tokens.colorNeutralForeground3 },
});

interface JoinedEmail extends FreightEmail {
  item?: FreightTriageItem;
}

export function Inbox() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { data: emails, isLoading } = useEmails();
  const { data: items } = useItems();
  const [carrier, setCarrier] = useState<string>("All");
  const [mode, setMode] = useState<string>("All");
  const [needsOnly, setNeedsOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<JoinedEmail | null>(null);

  const byThread = useMemo(() => {
    const m = new Map<string, FreightTriageItem>();
    (items ?? []).forEach((i) => m.set(i.threadId, i));
    return m;
  }, [items]);

  const carriers = useMemo(() => ["All", ...Array.from(new Set((items ?? []).map((i) => i.carrier))).sort()], [items]);

  const joined: JoinedEmail[] = useMemo(() => {
    return (emails ?? [])
      .map((e) => ({ ...e, item: byThread.get(e.threadId) }))
      .sort((a, b) => +new Date(b.receivedAt) - +new Date(a.receivedAt));
  }, [emails, byThread]);

  const filtered = joined.filter((e) => {
    if (carrier !== "All" && e.item?.carrier !== carrier) return false;
    if (mode !== "All" && e.item?.mode !== mode) return false;
    if (needsOnly && !e.item?.needsAttention) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${e.subject} ${e.from} ${e.body} ${e.item?.shNumbers.join(" ") ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (isLoading || !emails) {
    return (
      <div className={styles.loading}>
        <Spinner label="Loading inbox…" />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.filters}>
        <div className={styles.field}>
          <Caption1>Search</Caption1>
          <Input contentBefore={<Search20Regular />} placeholder="Subject, sender, SH#…" value={search} onChange={(_, d) => setSearch(d.value)} />
        </div>
        <div className={styles.field}>
          <Caption1>Carrier</Caption1>
          <Dropdown value={carrier} selectedOptions={[carrier]} onOptionSelect={(_, d) => setCarrier(d.optionValue ?? "All")}>
            {carriers.map((c) => (
              <Option key={c} value={c}>{c}</Option>
            ))}
          </Dropdown>
        </div>
        <div className={styles.field}>
          <Caption1>Mode</Caption1>
          <Dropdown value={mode} selectedOptions={[mode]} onOptionSelect={(_, d) => setMode(d.optionValue ?? "All")}>
            {["All", ...MODES].map((m) => (
              <Option key={m} value={m}>{m}</Option>
            ))}
          </Dropdown>
        </div>
        <Checkbox label="Needs attention only" checked={needsOnly} onChange={(_, d) => setNeedsOnly(!!d.checked)} />
        <Text style={{ marginLeft: "auto" }}>{filtered.length} of {emails.length} emails</Text>
      </div>

      <Card>
        <div className={styles.list}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>No emails match the filters.</div>
          ) : (
            filtered.map((e, idx) => (
              <div key={e.id}>
                {idx > 0 && <Divider />}
                <div className={`${styles.row} ${e.processed ? "" : styles.rowUnread}`} onClick={() => setSelected(e)}>
                  <Avatar size={28} icon={e.processed ? <MailRead20Regular /> : <Mail20Regular />} color="colorful" name={e.from} />
                  <div>
                    <Text className={styles.subject}>{e.subject}</Text>
                    <div className={styles.sub}>{e.from} · {timeAgo(e.receivedAt)}</div>
                    <div className={styles.metaRow}>
                      {e.item && <Badge appearance="ghost" color="brand">{e.item.carrier}</Badge>}
                      {e.item && <ModeBadge mode={e.item.mode} />}
                      {e.item && <PriorityPill priority={e.item.priority} />}
                      {e.item?.needsAttention && <Badge appearance="tint" color="danger">Needs attention</Badge>}
                      {e.hasAttachment && <Caption1><Attach16Regular /> attachment</Caption1>}
                    </div>
                  </div>
                  <div className={styles.right}>
                    {e.item && (
                      <Button
                        size="small"
                        appearance="primary"
                        icon={<Open16Regular />}
                        onClick={(ev) => { ev.stopPropagation(); navigate(`/item/${e.item!.id}`); }}
                      >
                        Open item
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <OverlayDrawer position="end" size="medium" open={!!selected} onOpenChange={(_, { open }) => !open && setSelected(null)}>
        <DrawerHeader>
          <DrawerHeaderTitle action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setSelected(null)} />}>
            {selected?.subject}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
          {selected && (
            <>
              <div className={styles.kv}>
                <span className={styles.kvKey}>From</span><span>{selected.from}</span>
                <span className={styles.kvKey}>To</span><span>{selected.to}</span>
                {selected.cc && <><span className={styles.kvKey}>Cc</span><span>{selected.cc}</span></>}
                <span className={styles.kvKey}>Received</span><span>{formatDateTime(selected.receivedAt)}</span>
              </div>
              {selected.item && (
                <div className={styles.metaRow} style={{ marginTop: 12 }}>
                  <Badge appearance="ghost" color="brand">{selected.item.carrier}</Badge>
                  <ModeBadge mode={selected.item.mode} />
                  <PriorityPill priority={selected.item.priority} />
                </div>
              )}
              <Text className={styles.body}>{selected.body}</Text>
              {selected.item && (
                <Button appearance="primary" icon={<Open16Regular />} style={{ marginTop: 18 }} onClick={() => { const id = selected.item!.id; setSelected(null); navigate(`/item/${id}`); }}>
                  Open triage item
                </Button>
              )}
            </>
          )}
        </DrawerBody>
      </OverlayDrawer>
    </div>
  );
}
