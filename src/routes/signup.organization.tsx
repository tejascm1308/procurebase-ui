import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";
import { AuthLayout, Input, PrimaryButton } from "@/components/app/AuthLayout";

export const Route = createFileRoute("/signup/organization")({ component: OrgSignup });

function OrgSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState(""); const [type, setType] = useState("Private Limited");
  const [email, setEmail] = useState(""); const [gstin, setGstin] = useState(""); const [pw, setPw] = useState("");
  const [gstStatus, setGstStatus] = useState<"idle"|"checking"|"valid"|"invalid">("idle");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!gstin) { setGstStatus("idle"); return; }
    setGstStatus("checking");
    const t = setTimeout(() => {
      setGstStatus(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin) ? "valid" : "invalid");
    }, 700);
    return () => clearTimeout(t);
  }, [gstin]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Organization registered. Please sign in.");
    setLoading(false); navigate({ to: "/login" });
  };

  return (
    <AuthLayout
      title="Register your Organization"
      subtitle="Set up your procurement workspace in minutes."
      footer={<>Already registered? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Organization Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tech Corp India Pvt Ltd" />
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-heading">Organization Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]">
            {["Private Limited","Public Limited","LLP","Partnership","Proprietorship","Government","Non-profit"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <Input label="Official Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" />
        <div>
          <Input label="GSTIN" required value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="27AAACA1234B1Z5" maxLength={15} />
          {gstStatus === "checking" && <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "#EFF6FF", color: "#1E40AF" }}><Loader2 className="h-3 w-3 animate-spin" /> Validating…</span>}
          {gstStatus === "valid" && <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "#ECFDF5", color: "#065F46" }}><Check className="h-3 w-3" /> GSTIN verified</span>}
          {gstStatus === "invalid" && gstin && <span className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "#FFF1F2", color: "#9F1239" }}><X className="h-3 w-3" /> Invalid format</span>}
        </div>
        <Input label="Password" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
        <PrimaryButton type="submit" disabled={loading || gstStatus !== "valid"}>{loading ? "Registering…" : "Register Organization"}</PrimaryButton>
      </form>
    </AuthLayout>
  );
}
