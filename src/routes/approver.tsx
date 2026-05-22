import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, ClipboardCheck, History, AlertOctagon, Bell } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";

export const Route = createFileRoute("/approver")({ component: ApproverLayout });

const NAV: NavItem[] = [
  { to: "/approver/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/approver/pending", label: "Pending Approvals", icon: ClipboardCheck },
  { to: "/approver/history", label: "Approval History", icon: History },
  { to: "/approver/escalations", label: "Escalations", icon: AlertOctagon },
  { to: "/approver/notifications", label: "Notifications", icon: Bell },
];

function ApproverLayout() {
  return (
    <ProtectedRoute allowedRoles={["approver"]}>
      <AppShell nav={NAV}><Outlet /></AppShell>
    </ProtectedRoute>
  );
}
