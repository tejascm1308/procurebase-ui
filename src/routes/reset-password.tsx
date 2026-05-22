import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout, Input, PrimaryButton } from "@/components/app/AuthLayout";

export const Route = createFileRoute("/reset-password")({ component: ResetPw });

function ResetPw() {
  const navigate = useNavigate();
  const [pw, setPw] = useState(""); const [cpw, setCpw] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== cpw) return toast.error("Passwords do not match");
    setLoading(true); await new Promise((r) => setTimeout(r, 700));
    toast.success("Password reset. Please sign in."); navigate({ to: "/login" });
  };
  return (
    <AuthLayout title="Set a new password" footer={<><Link to="/login" className="font-semibold text-primary hover:underline">← Back to sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Input label="New Password" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
        <Input label="Confirm Password" type="password" required value={cpw} onChange={(e) => setCpw(e.target.value)} placeholder="Re-enter password" error={cpw && cpw !== pw ? "Passwords don't match" : undefined} />
        <PrimaryButton type="submit" disabled={loading}>{loading ? "Resetting…" : "Reset Password"}</PrimaryButton>
      </form>
    </AuthLayout>
  );
}
