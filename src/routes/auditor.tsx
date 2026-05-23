import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Activity, FileText, GitBranch, Shield, Bell } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";

export const Route = createFileRoute("/auditor")({ component: AuditorLayout });

const NAV: NavItem[] = [
  { to: "/auditor/overview",       label: "Overview",      icon: Activity  },
  { to: "/auditor/audit-logs",     label: "Audit Logs",    icon: FileText  },
  { to: "/auditor/rfq-timeline",   label: "RFQ Timeline",  icon: GitBranch },
  { to: "/auditor/anomalies",      label: "Anomalies",     icon: Shield    },
  { to: "/auditor/notifications",  label: "Notifications", icon: Bell      },
];

function AuditorLayout() {
  return (
    <ProtectedRoute allowedRoles={["auditor"]}>
      <AppShell nav={NAV}><Outlet /></AppShell>
    </ProtectedRoute>
  );
}
