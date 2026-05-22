import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, FilePlus2, Files, Users, Bell } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";

export const Route = createFileRoute("/officer")({ component: OfficerLayout });

const NAV: NavItem[] = [
  { to: "/officer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/officer/rfqs/create", label: "Create RFQ", icon: FilePlus2 },
  { to: "/officer/rfqs", label: "My RFQs", icon: Files },
  { to: "/officer/vendors", label: "Vendor Search", icon: Users },
  { to: "/officer/notifications", label: "Notifications", icon: Bell },
];

function OfficerLayout() {
  return (
    <ProtectedRoute allowedRoles={["officer"]}>
      <AppShell nav={NAV}><Outlet /></AppShell>
    </ProtectedRoute>
  );
}
