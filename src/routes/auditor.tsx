import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, ScrollText, AlertTriangle, FileSearch, FolderLock } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";

export const Route = createFileRoute("/auditor")({ component: AuditorLayout });

const NAV: NavItem[] = [
  { to: "/auditor/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/auditor/logs", label: "Activity Logs", icon: ScrollText },
  { to: "/auditor/anomalies", label: "Anomaly Alerts", icon: AlertTriangle },
  { to: "/auditor/documents", label: "Document Access", icon: FolderLock },
];

function AuditorLayout() {
  return (
    <ProtectedRoute allowedRoles={["auditor"]}>
      <AppShell nav={NAV}><Outlet /></AppShell>
    </ProtectedRoute>
  );
}
