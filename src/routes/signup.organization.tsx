import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AuthLayout, Input, PrimaryButton } from "@/components/app/AuthLayout";
import { useRegisterOrganization, useVerifyOTP, useResendOTP } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/signup/organization")({ component: OrgSignup });

const ORG_TYPES = ["Private Limited", "Public Limited", "LLP", "Partnership", "Proprietorship", "Government", "Non-profit"];

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const strengthColor = (s: number) => ["#E5E7EB","#EF4444","#F59E0B","#10B981","#635BFF"][s];
const strengthLabel = (s: number) => ["","Weak","Fair","Good","Strong"][s];

function OrgSignup() {
  const navigate = useNavigate();

  const [name, setName]   = useState("");
  const [type, setType]   = useState("Private Limited");
  const [email, setEmail] = useState("");
  const [pw, setPw]       = useState("");
  const [step, setStep]   = useState<1 | 2>(1);

  // Step 2 fields
  const [otp, setOtp] = useState("");

  const registerMutation = useRegisterOrganization();
  const verifyMutation   = useVerifyOTP();
  const resendMutation   = useResendOTP();

  const pwStrength = strength(pw);

  const submitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwStrength < 2) { toast.error("Password is too weak"); return; }
    if (pw.length > 64) { toast.error("Password must be 64 characters or fewer"); return; }
    try {
      await registerMutation.mutateAsync({ name, org_type: type, email, password: pw });
      toast.success("Account created. OTP sent to your email.");
      setStep(2);
    } catch (err: unknown) {}
  };

  const submitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyMutation.mutateAsync({ email, otp_code: otp, purpose: "email_verification" });
      toast.success("Email verified! Please sign in.");
      navigate({ to: "/login" });
    } catch (err: unknown) {
      // handled by hook
    }
  };

  const resendOtp = async () => {
    try {
      await resendMutation.mutateAsync({ email, purpose: "email_verification" });
    } catch {}
  };

  // ── Step 2: OTP verification ─────────────────────────────────────────────
  if (step === 2) {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle={`We sent a 6-digit code to ${email}. Enter it below to activate your account.`}
        footer={<>Wrong email? <button onClick={() => setStep(1)} className="font-semibold text-primary hover:underline">Go back</button></>}
      >
        <form onSubmit={submitStep2} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-heading">Verification Code</label>
            <input
              className="h-14 w-full rounded-xl border-2 bg-white text-center text-2xl font-bold tracking-[0.5em] text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]"
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="──────" maxLength={6} autoFocus
            />
          </div>
          <PrimaryButton type="submit" disabled={verifyMutation.isPending || otp.length < 6}>
            {verifyMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" />Verifying…</> : "Verify & Continue →"}
          </PrimaryButton>
          <button type="button" onClick={resendOtp} disabled={resendMutation.isPending}
            className="w-full text-center text-xs text-mute hover:text-primary hover:underline disabled:opacity-50">
            {resendMutation.isPending ? "Sending…" : "Didn't receive it? Resend code"}
          </button>
        </form>
      </AuthLayout>
    );
  }

  // ── Step 1: Registration form ────────────────────────────────────────────
  return (
    <AuthLayout
      title="Register your Organization"
      subtitle="Set up your procurement workspace in minutes."
      footer={<>Already registered? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submitStep1} className="space-y-4">
        <Input label="Organization Name" required value={name} onChange={e => setName(e.target.value)} placeholder="Tech Corp India Pvt Ltd" />

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-heading">Organization Type</label>
          <select value={type} onChange={e => setType(e.target.value)}
            className="h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]">
            {ORG_TYPES.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <Input label="Official Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@company.com" />


        <div>
          <Input label="Password" type="password" required value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 8 characters" maxLength={64} />
          <div className="mt-2 flex gap-1">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i < pwStrength ? strengthColor(pwStrength) : "#E5E7EB" }} />
            ))}
          </div>
          {pw && <p className="mt-1 text-[11px] font-semibold" style={{ color: strengthColor(pwStrength) }}>{strengthLabel(pwStrength)}</p>}
        </div>

        <PrimaryButton type="submit" disabled={registerMutation.isPending || pwStrength < 2}>
          {registerMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" />Registering…</> : "Register Organization →"}
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
