import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout, Input, PrimaryButton } from "@/components/app/AuthLayout";
import { useResetPassword } from "@/lib/queries";

export const Route = createFileRoute("/reset-password")({ component: ResetPassword });

function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [code, setCode] = useState(""); const [pw, setPw] = useState("");
  const mutation = useResetPassword();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutation.mutateAsync({ email, otp_code: code, new_password: pw });
    navigate({ to: "/login" });
  };

  return (
    <AuthLayout title="Set new password" subtitle="Enter the 6-digit code from your email and your new password."
      footer={<><Link to="/login" className="font-semibold text-primary hover:underline">← Back to sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        <Input label="Reset Code" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" maxLength={6} />
        <Input label="New Password" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
        <PrimaryButton type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Resetting…" : "Reset Password"}</PrimaryButton>
      </form>
    </AuthLayout>
  );
}
