import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, KeyRound } from "lucide-react";
import { AuthLayout, Input, PrimaryButton } from "@/components/app/AuthLayout";
import { useRegisterMember } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/signup/member")({ component: MemberSignup });

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

function MemberSignup() {
  const navigate = useNavigate();
  const [orgName, setOrgName]     = useState("");
  const [email, setEmail]         = useState("");
  const [pw, setPw]               = useState("");
  const [signupKey, setSignupKey] = useState("");

  const registerMutation = useRegisterMember();
  const pwStrength = strength(pw);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwStrength < 2) { toast.error("Password is too weak"); return; }
    if (pw.length > 64) { toast.error("Password must be 64 characters or fewer"); return; }
    if (!signupKey.trim()) { toast.error("Please enter your signup key from the invite email"); return; }
    try {
      await registerMutation.mutateAsync({
        org_name: orgName.trim(),
        email,
        password: pw,
        signup_key: signupKey.trim(),
      });
      toast.success("Account created! Please sign in.");
      navigate({ to: "/login" });
    } catch {}
  };

  return (
    <AuthLayout
      title="Join your team"
      subtitle="Enter the details from your invite email to activate your account."
      footer={<>Already a member? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Organization Name *"
          required
          value={orgName}
          onChange={e => setOrgName(e.target.value)}
          placeholder="e.g. Acme Corp India Pvt Ltd"
        />
        <Input
          label="Work Email *"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@company.com"
        />

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-heading">
            <KeyRound className="inline h-3.5 w-3.5 mr-1 text-primary" />
            Signup Key *
          </label>
          <input
            required
            className="h-10 w-full rounded-lg border bg-white px-3 font-mono text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]"
            value={signupKey}
            onChange={e => setSignupKey(e.target.value)}
            placeholder="Paste the key from your invite email"
          />
          <p className="mt-1 text-[11px] text-mute">Check your email from ProcuBase — your Procurement Head sent you this key.</p>
        </div>

        <div>
          <Input
            label="Create Password *"
            type="password"
            required
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="At least 8 characters"
            maxLength={64}
          />
          <div className="mt-2 flex gap-1">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all"
                style={{ background: i < pwStrength ? strengthColor(pwStrength) : "#E5E7EB" }} />
            ))}
          </div>
          {pw && <p className="mt-1 text-[11px] font-semibold" style={{ color: strengthColor(pwStrength) }}>{strengthLabel(pwStrength)}</p>}
        </div>

        <PrimaryButton type="submit" disabled={registerMutation.isPending || pwStrength < 2 || !signupKey.trim()}>
          {registerMutation.isPending
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" />Activating account…</>
            : "Activate My Account →"
          }
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
