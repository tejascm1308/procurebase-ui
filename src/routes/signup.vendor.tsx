import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout, Input, PrimaryButton } from "@/components/app/AuthLayout";

export const Route = createFileRoute("/signup/vendor")({ component: VendorSignup });

function VendorSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [pw, setPw] = useState(""); const [loading, setLoading] = useState(false);
  const strength = Math.min(4, [/.{8,}/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((r) => r.test(pw)).length);
  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["#E5E7EB", "#DF1B41", "#D97706", "#0570DE", "#0E9F6E"][strength];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false); setStep(2);
    toast.success("Account created. OTP sent to your email.");
  };
  const verify = async () => {
    setLoading(true); await new Promise((r) => setTimeout(r, 600)); setLoading(false);
    toast.success("Email verified. Please sign in.");
    navigate({ to: "/login" });
  };

  if (step === 2) {
    return (
      <AuthLayout title="Verify your email" subtitle={`Enter the 6-digit code sent to ${email || "your email"}.`}>
        <OTPInput />
        <p className="mt-3 text-xs text-mute">Code expires in 09:42</p>
        <div className="mt-5"><PrimaryButton onClick={verify} disabled={loading}>{loading ? "Verifying…" : "Verify Email"}</PrimaryButton></div>
        <button onClick={() => setStep(1)} className="mt-3 text-xs font-semibold text-primary hover:underline">← Back to signup</button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Register as a Vendor"
      subtitle="After registration, verify your email OTP to activate your account."
      footer={<>Already registered? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Legal Business Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Industrial Supplies Pvt Ltd" />
        <Input label="Business Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@company.com" />
        <div>
          <Input label="Password" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
          <div className="mt-2 flex gap-1">
            {[0,1,2,3].map((i) => (
              <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i < strength ? strengthColor : "#E5E7EB" }} />
            ))}
          </div>
          {pw && <p className="mt-1 text-[11px] font-semibold" style={{ color: strengthColor }}>{strengthLabel}</p>}
        </div>
        <PrimaryButton type="submit" disabled={loading}>{loading ? "Creating account…" : "Create Vendor Account"}</PrimaryButton>
      </form>
    </AuthLayout>
  );
}

function OTPInput() {
  const [vals, setVals] = useState(["","","","","",""]);
  return (
    <div className="flex justify-between gap-2">
      {vals.map((v, i) => (
        <input
          key={i} maxLength={1} value={v} inputMode="numeric"
          onChange={(e) => {
            const next = [...vals]; next[i] = e.target.value.replace(/\D/g, ""); setVals(next);
            if (e.target.value && i < 5) (e.target.nextElementSibling as HTMLInputElement)?.focus();
          }}
          className="h-12 w-full rounded-lg border bg-white text-center text-lg font-bold text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]"
        />
      ))}
    </div>
  );
}
