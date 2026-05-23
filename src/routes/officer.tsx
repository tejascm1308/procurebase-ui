import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Users, Bell } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";

export const Route = createFileRoute("/officer")({ component: OfficerLayout });

const NAV: NavItem[] = [
  { to: "/officer/dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { to: "/officer/rfqs",      label: "RFQs",         icon: FileText },
  { to: "/officer/vendors",   label: "Vendors",       icon: Users },
  { to: "/officer/notifications", label: "Notifications", icon: Bell },
];

function OfficerLayout() {
  return (
    <ProtectedRoute allowedRoles={["officer"]}>
      <AppShell nav={NAV}><Outlet /></AppShell>
    </ProtectedRoute>
  );
}
