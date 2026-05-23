import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Check, X, Loader2 } from "lucide-react";
import { useOrgProfile, useVerifyGSTIN } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/head/verify-gstin")({ component: VerifyGSTIN });

function VerifyGSTIN() {
  const navigate = useNavigate();
  const { data: org, isLoading } = useOrgProfile();
  const verifyMutation = useVerifyGSTIN();

  const [gstin, setGstin] = useState("");
  const [gstStatus, setGstStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");

  // Redirect if already verified
  useEffect(() => {
    if (org && org.status === "verified") {
      navigate({ to: "/head/dashboard" });
    }
  }, [org]);

  useEffect(() => {
    if (!gstin) { setGstStatus("idle"); return; }
    setGstStatus("checking");
    const t = setTimeout(() => {
      setGstStatus(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin) ? "valid" : "invalid");
    }, 600);
    return () => clearTimeout(t);
  }, [gstin]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gstStatus !== "valid") { toast.error("Please enter a valid GSTIN format"); return; }
    try {
      await verifyMutation.mutateAsync(gstin);
      navigate({ to: "/head/dashboard" });
    } catch {}
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0F1E] via-[#151B35] to-[#0A0F1E] p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#635BFF] to-[#0570DE] shadow-lg shadow-[#635BFF]/30">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-center text-2xl font-bold text-white mb-2">Verify Your Organization</h1>
          <p className="text-center text-sm text-white/60 mb-8">
            Enter the GSTIN you registered with to verify your organization and activate your workspace.
          </p>

          {/* Org info chip */}
          {org && (
            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#635BFF]/20 text-sm font-bold text-[#a5a0ff]">
                {org.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{org.name}</p>
                <p className="text-xs text-white/50">{org.org_type?.replace(/_/g, " ")} · Enter your GSTIN to activate</p>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/70">GSTIN *</label>
              <input
                className="h-11 w-full rounded-xl border border-white/15 bg-white/8 px-4 text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/20 transition"
                placeholder="27AAACA1234B1Z5"
                maxLength={15}
                value={gstin}
                onChange={e => setGstin(e.target.value.toUpperCase())}
                autoFocus
              />
              <div className="mt-2 h-5">
                {gstStatus === "checking" && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/50">
                    <Loader2 className="h-3 w-3 animate-spin" /> Validating format…
                  </span>
                )}
                {gstStatus === "valid" && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <Check className="h-3 w-3" /> Valid GSTIN format
                  </span>
                )}
                {gstStatus === "invalid" && gstin && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-400">
                    <X className="h-3 w-3" /> Invalid format — must be 15 chars (e.g. 27AAACA1234B1Z5)
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={verifyMutation.isPending || gstStatus !== "valid"}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#635BFF] to-[#0570DE] text-sm font-semibold text-white shadow-lg shadow-[#635BFF]/30 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifyMutation.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
                : <><ShieldCheck className="h-4 w-4" /> Verify & Activate Workspace</>
              }
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
            <p className="text-xs text-amber-300/80">
              <span className="font-semibold">Why GSTIN verification?</span> This confirms your organization is a legitimate registered business and activates procurement features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
