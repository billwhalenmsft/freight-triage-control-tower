import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { makeStyles, shorthands, tokens, Tab, TabList, Text } from "@fluentui/react-components";
import {
  ColumnTriple24Regular,
  Mail24Regular,
  DataTrending24Regular,
} from "@fluentui/react-icons";
import { TeLogo } from "@/components/te-logo";

const useStyles = makeStyles({
  root: { minHeight: "100vh", display: "flex", flexDirection: "column" },
  header: {
    backgroundColor: "#0d1b2e",
    color: "#fff",
    ...shorthands.padding("14px", "24px"),
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("16px"),
  },
  brand: { display: "flex", flexDirection: "column" },
  divider: { width: "1px", height: "30px", backgroundColor: "rgba(255,255,255,.2)" },
  title: { color: "#fff", fontWeight: 700, fontSize: "16px", lineHeight: 1.2 },
  sub: { color: "rgba(255,255,255,.7)", fontSize: "12px" },
  chip: {
    marginLeft: "auto",
    fontSize: "11px",
    fontWeight: 700,
    color: "#9fd1ff",
    ...shorthands.border("1px", "solid", "rgba(159,209,255,.4)"),
    ...shorthands.borderRadius("999px"),
    ...shorthands.padding("4px", "10px"),
  },
  navbar: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderBottom("1px", "solid", tokens.colorNeutralStroke2),
    ...shorthands.padding("0", "16px"),
  },
  main: { flexGrow: 1, ...shorthands.padding("20px", "24px"), maxWidth: "1480px", width: "100%", marginLeft: "auto", marginRight: "auto" },
});

const TABS = [
  { path: "/", label: "Control Tower", icon: <ColumnTriple24Regular /> },
  { path: "/inbox", label: "Inbox", icon: <Mail24Regular /> },
  { path: "/report", label: "Ageing & SLA", icon: <DataTrending24Regular /> },
];

export function AppShell({ children }: { children: ReactNode }) {
  const styles = useStyles();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const selected = TABS.find((t) => (t.path === "/" ? pathname === "/" : pathname.startsWith(t.path)))?.path ?? "/";

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <TeLogo height={28} />
        <div className={styles.divider} />
        <div className={styles.brand}>
          <Text className={styles.title}>Freight Triage Control Tower</Text>
          <Text className={styles.sub}>Queue → Assign → Resolve</Text>
        </div>
        <span className={styles.chip}>DEMO · mock data</span>
      </header>
      <div className={styles.navbar}>
        <TabList selectedValue={selected} onTabSelect={(_, d) => navigate(d.value as string)}>
          {TABS.map((t) => (
            <Tab key={t.path} value={t.path} icon={t.icon}>
              {t.label}
            </Tab>
          ))}
        </TabList>
      </div>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
