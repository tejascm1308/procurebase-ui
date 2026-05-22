import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { AuthLayout, Input, PrimaryButton } from "@/components/app/AuthLayout";

export const Route = createFileRoute("/signup/member")({ component: MemberSignup });

const ORGS = ["Tech Corp India", "Globex Industries", "Innova Health", "Sundaram Logistics"];

function MemberSignup() {
  const navigate = useNavigate();
  const [org, setOrg] = useState(""); const [name, setName] = useState("");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Invitation request sent to your organization head.");
    setLoading(false); navigate({ to: "/login" });
  };
  return (
    <AuthLayout
      title="Join your team"
      subtitle="Register as an existing organization member. Your role will be assigned by your Procurement Head."
      footer={<>Already a member? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-heading">Organization</label>
          <input list="orgs" value={org} onChange={(e) => setOrg(e.target.value)} required placeholder="Search organization…"
            className="h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
          <datalist id="orgs">{ORGS.map((o) => <option key={o} value={o} />)}</datalist>
        </div>
        <Input label="Full Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <Input label="Work Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        <Input label="Password" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
        {email.includes("@") && (
          <div className="flex items-start gap-2.5 rounded-lg border bg-[#ECFDF5] p-3">
            <Check className="mt-0.5 h-4 w-4 text-[#0E9F6E]" />
            <p className="text-xs font-semibold text-[#065F46]">Email verified — Pending role assignment by Procurement Head</p>
          </div>
        )}
        <PrimaryButton type="submit" disabled={loading}>{loading ? "Submitting…" : "Request Access"}</PrimaryButton>
      </form>
    </AuthLayout>
  );
}
