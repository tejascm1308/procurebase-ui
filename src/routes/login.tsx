import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout, Input, PrimaryButton } from "@/components/app/AuthLayout";
import { useAuth } from "@/lib/auth-context";
import { roleDashboards } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please enter email and password"); return; }
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.full_name}`);
      navigate({ to: roleDashboards[u.role] as any });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout
      title="Sign in to ProcuBase"
      subtitle="Welcome back. Enter your credentials to continue."
      footer={<>Don't have an account? <Link to="/signup/organization" className="font-semibold text-primary hover:underline">Register your organization</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Work Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
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
