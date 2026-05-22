import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { roleDashboards, type Role } from "@/lib/mock-data";

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
  if (!allowedRoles.includes(user.role)) return <Navigate to={roleDashboards[user.role] as any} />;
  return <>{children}</>;
}
