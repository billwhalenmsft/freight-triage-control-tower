import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { ControlTower } from "@/pages/control-tower";
import { Inbox } from "@/pages/inbox";
import { ItemDetail } from "@/pages/item-detail";
import { Report } from "@/pages/report";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<ControlTower />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </AppShell>
  );
}
