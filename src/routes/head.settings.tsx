import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { useOrgProfile, useVerifyGSTIN } from "@/lib/queries";
import { useState, useEffect } from "react";
import { Check, X, Loader2, ShieldCheck, Building2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/head/settings")({ component: HeadSettings });

function HeadSettings() {
  const { data: org, isLoading } = useOrgProfile();
  const verifyMutation = useVerifyGSTIN();

  const [gstin, setGstin] = useState("");
  const [gstStatus, setGstStatus] = useState<"idle"|"checking"|"valid"|"invalid">("idle");

  useEffect(() => {
    if (!gstin) { setGstStatus("idle"); return; }
    setGstStatus("checking");
    const t = setTimeout(() => {
      setGstStatus(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin) ? "valid" : "invalid");
    }, 600);
    return () => clearTimeout(t);
  }, [gstin]);

  const submitGSTIN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gstStatus !== "valid") { toast.error("Invalid GSTIN format"); return; }
    await verifyMutation.mutateAsync(gstin);
  };

  const FF = `h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]`;

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <PageHeader title="Organization Settings" subtitle="Manage your organization profile and verification." />

      {/* Org profile card */}
      <div className="grid gap-6">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent"><Building2 className="h-4.5 w-4.5 text-primary" /></div>
            <h3 className="text-sm font-semibold text-heading">Organization Profile</h3>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {[
              ["Name", org?.name],
              ["Type", org?.org_type?.replace(/_/g, " ")],
              ["Email", org?.email],
              ["GSTIN", org?.gstin || "Not verified yet"],
              ["Status", org?.status],
            ].map(([k, v]) => (
              <div key={String(k)}>
                <p className="text-[10px] font-bold uppercase tracking-wide text-mute">{k}</p>
                <p className="mt-1 text-sm font-semibold text-heading">{String(v) || "—"}</p>
              </div>
            ))}
          </dl>
        </div>

        {/* GSTIN verification */}
        {org?.status !== "verified" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100"><ShieldCheck className="h-4.5 w-4.5 text-amber-600" /></div>
              <div>
                <h3 className="text-sm font-semibold text-amber-900">GSTIN Verification Required</h3>
                <p className="text-xs text-amber-700 mt-0.5">Verify your GSTIN to unlock full procurement features.</p>
              </div>
            </div>
            <form onSubmit={submitGSTIN} className="flex gap-3 items-start flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <input className={FF} placeholder="27AAACA1234B1Z5" maxLength={15}
                  value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} />
                <div className="mt-1.5 h-4">
                  {gstStatus === "valid" && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><Check className="h-3 w-3" />Valid format</span>}
                  {gstStatus === "invalid" && gstin && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600"><X className="h-3 w-3" />Invalid format</span>}
                </div>
              </div>
              <button type="submit" disabled={verifyMutation.isPending || gstStatus !== "valid"}
                className="h-10 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60">
                {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldCheck className="h-3.5 w-3.5" />Verify GSTIN</>}
              </button>
            </form>
          </div>
        )}

        {org?.status === "verified" && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-center gap-3">
            <Check className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Organization verified</p>
              <p className="text-xs text-emerald-600">GSTIN: {org.gstin} · All procurement features are active.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
