import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout, Input, PrimaryButton } from "@/components/app/AuthLayout";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPw });

function ForgotPw() {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); setLoading(false); setSent(true);
    toast.success("Reset link sent to your email.");
  };
  return (
    <AuthLayout title="Reset your password" subtitle="Enter your work email and we'll send you a reset link." footer={<><Link to="/login" className="font-semibold text-primary hover:underline">← Back to sign in</Link></>}>
      {sent ? (
        <div className="rounded-lg border bg-[#ECFDF5] p-4 text-sm font-medium text-[#065F46]">If an account exists for {email}, a reset link has been sent.</div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Work Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          <PrimaryButton type="submit" disabled={loading}>{loading ? "Sending…" : "Send Reset Link"}</PrimaryButton>
        </form>
      )}
    </AuthLayout>
  );
}
