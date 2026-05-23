import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { LayoutDashboard, Users2, Files, AlertOctagon, Building2, Settings, ShieldAlert } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/app/ProtectedRoute";
import { useOrgProfile } from "@/lib/queries";

export const Route = createFileRoute("/head")({ component: HeadLayout });

const NAV: NavItem[] = [
  { to: "/head/dashboard",   label: "Overview",           icon: LayoutDashboard },
  { to: "/head/team",        label: "Team",               icon: Users2 },
  { to: "/head/rfqs",        label: "All RFQs",           icon: Files },
  { to: "/head/escalations", label: "Escalations",        icon: AlertOctagon },
  { to: "/head/vendors",     label: "Vendor Performance", icon: Building2 },
  { to: "/head/settings",    label: "Settings",           icon: Settings },
];

function HeadLayout() {
  const { data: org } = useOrgProfile();
  const isUnverified = org && org.status !== "verified";

  return (
    <ProtectedRoute allowedRoles={["head"]}>
      <AppShell nav={NAV}>
        {/* Persistent GSTIN verification banner */}
        {isUnverified && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Your organization is not verified yet.</p>
                <p className="text-xs text-amber-700">Verify your GSTIN to unlock all procurement features.</p>
              </div>
            </div>
            <Link to="/head/settings"
              className="shrink-0 h-8 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 text-xs font-semibold text-white hover:bg-amber-600 transition">
              Verify Now →
            </Link>
          </div>
        )}
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  );
}
