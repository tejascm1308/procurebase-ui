import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Users2, Files, AlertOctagon, Building2, Settings } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";

export const Route = createFileRoute("/head")({ component: HeadLayout });

const NAV: NavItem[] = [
  { to: "/head/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/head/team", label: "Team", icon: Users2 },
  { to: "/head/rfqs", label: "All RFQs", icon: Files },
  { to: "/head/escalations", label: "Escalations", icon: AlertOctagon },
  { to: "/head/vendors", label: "Vendor Performance", icon: Building2 },
  { to: "/head/settings", label: "Settings", icon: Settings },
];

function HeadLayout() {
  return (
    <ProtectedRoute allowedRoles={["head"]}>
      <AppShell nav={NAV}><Outlet /></AppShell>
    </ProtectedRoute>
  );
}
