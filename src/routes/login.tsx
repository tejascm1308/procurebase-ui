import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout, Input, PrimaryButton } from "@/components/app/AuthLayout";
import { useAuth } from "@/lib/auth-context";
import { roleDashboards, type Role } from "@/lib/mock-data";

export const Route = createFileRoute("/login")({ component: LoginPage });

const ROLES: { value: Role; label: string }[] = [
  { value: "vendor", label: "Vendor" },
  { value: "officer", label: "Procurement Officer" },
  { value: "approver", label: "Approver" },
  { value: "head", label: "Procurement Head" },
  { value: "auditor", label: "Auditor" },
];

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("officer");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password, role);
      toast.success(`Welcome back, ${u.name}`);
      navigate({ to: roleDashboards[u.role] as any });
    } catch {
      toast.error("Login failed");
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout
      title="Sign in to ProcureBase"
      subtitle="Welcome back. Select your role to continue."
      footer={<>Don't have an account? <Link to="/signup/organization" className="font-semibold text-primary hover:underline">Register your organization</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Work Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-heading">Sign in as (demo role selector)</label>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]">
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <p className="mt-1.5 text-[11px] text-mute">Demo: choose any role to explore that dashboard.</p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-body"><input type="checkbox" className="h-3.5 w-3.5 rounded border" /> Remember me</label>
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">Forgot password?</Link>
        </div>
        <PrimaryButton type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</PrimaryButton>
      </form>
      <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
        <Link to="/signup/vendor" className="rounded-lg border bg-white py-2 font-semibold text-heading hover:bg-secondary">Vendor signup</Link>
        <Link to="/signup/organization" className="rounded-lg border bg-white py-2 font-semibold text-heading hover:bg-secondary">Org signup</Link>
        <Link to="/signup/member" className="rounded-lg border bg-white py-2 font-semibold text-heading hover:bg-secondary">Member signup</Link>
      </div>
    </AuthLayout>
  );
}
