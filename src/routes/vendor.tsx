import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Inbox, FileText, Package, CheckSquare, User2, Bell } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";

export const Route = createFileRoute("/vendor")({ component: VendorLayout });

const NAV: NavItem[] = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vendor/rfqs", label: "RFQ Inbox", icon: Inbox },
  { to: "/vendor/quotations", label: "My Quotations", icon: FileText },
  { to: "/vendor/orders", label: "Active Orders", icon: Package },
  { to: "/vendor/profile", label: "Profile & Documents", icon: User2 },
  { to: "/vendor/notifications", label: "Notifications", icon: Bell },
];

function VendorLayout() {
  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      <AppShell nav={NAV}><Outlet /></AppShell>
    </ProtectedRoute>
  );
}
