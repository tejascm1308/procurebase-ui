import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { roleDashboards } from "@/lib/auth-context";
import type { Role } from "@/lib/auth-context";
import { ShieldOff, LogOut } from "lucide-react";

function DeactivatedScreen() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#F6F9FC] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
          <ShieldOff className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-heading mb-2">Account Deactivated</h1>
        <p className="text-sm text-mute mb-6">
          Your account has been deactivated by your Procurement Head. You no longer have access to ProcuBase.
        </p>
        <p className="text-xs text-mute mb-6">
          If you believe this is a mistake, please contact your Procurement Head to reactivate your account.
        </p>
        <button onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

export function ProtectedRoute({ allowedRoles, children }: { allowedRoles: Role[]; children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <div className="animate-pulse-soft text-sm text-mute">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  // Show deactivated screen if account was deactivated while session was active
  if (user.is_active === false) return <DeactivatedScreen />;

  if (!allowedRoles.includes(user.role)) return <Navigate to={roleDashboards[user.role] as any} />;

  return <>{children}</>;
}
