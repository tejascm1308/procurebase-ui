import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Input, PrimaryButton } from "@/components/app/AuthLayout";
import { useForgotPassword } from "@/lib/queries";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  const mutation = useForgotPassword();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutation.mutateAsync(email);
      setSent(true);
    } catch (err: unknown) {
      // Error is already toasted by the global query error handler
      // but we stay on the form so user can correct their email
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent a reset code to ${email}.`}>
        <PrimaryButton onClick={() => navigate({ to: "/reset-password" })}>Enter Reset Code →</PrimaryButton>
        <button onClick={() => setSent(false)} className="mt-3 block text-xs text-mute hover:underline">Use a different email</button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your account email and we'll send a 6-digit reset code."
      footer={<><Link to="/login" className="font-semibold text-primary hover:underline">← Back to sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Work Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        <PrimaryButton type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Sending…" : "Send Reset Code"}</PrimaryButton>
      </form>
    </AuthLayout>
  );
}
