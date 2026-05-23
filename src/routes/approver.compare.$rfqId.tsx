import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, ShieldCheck, X, User, MapPin, Star, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import {
  useRFQ, useRFQQuotations, useRecordDecision, useRFQDecision,
  useAIScoreQuotes, useAIDeepScan, useAIAssessRisk, useVendor, useNegotiate,
} from "@/lib/queries";
import type { Quotation, AIScoreResult } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/approver/compare/$rfqId")({ component: QuoteCompare });



// ─── Risk Sidebar ─────────────────────────────────────────────────────────────
function RiskPanel({ vendorId, vendorName, onClose }: { vendorId: string; vendorName: string; onClose: () => void }) {
  const riskMutation = useAIAssessRisk();
  const [risk, setRisk] = useState<any>(null);

  const run = async () => { const r = await riskMutation.mutateAsync(vendorId); setRisk(r); };

  const riskColor = risk?.risk_level === "HIGH" ? "#9F1239" : risk?.risk_level === "MEDIUM" ? "#D97706" : "#065F46";
  const riskBg    = risk?.risk_level === "HIGH" ? "#FFF1F2" : risk?.risk_level === "MEDIUM" ? "#FFFBEB" : "#ECFDF5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: "rgba(10,37,64,0.3)", backdropFilter: "blur(2px)" }}>
      <div className="h-full w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-xs font-bold text-primary">AI Risk Assessment</p>
            <p className="text-sm font-bold text-heading">{vendorName}</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-mute" /></button>
        </div>
        <div className="flex-1 p-5">
          {!risk ? (
            <div className="text-center py-10">
              <ShieldCheck className="h-10 w-10 text-mute mx-auto mb-3" />
              <p className="text-sm font-semibold text-heading">Run AI Risk Check</p>
              <p className="text-xs text-mute mt-1 mb-5">Analyze this vendor's risk profile using AI.</p>
              <button onClick={run} disabled={riskMutation.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-5 text-xs font-semibold text-white shadow-card disabled:opacity-60">
                {riskMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><ShieldCheck className="h-4 w-4" /> Run Risk Check</>}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl p-4" style={{ background: riskBg, borderLeft: `4px solid ${riskColor}` }}>
                <p className="text-sm font-bold" style={{ color: riskColor }}>
                  {risk.risk_level} Risk · {risk.risk_score}/100
                </p>
                <p className="text-xs text-body mt-1">{risk.summary}</p>
              </div>
              {risk.caution_indicators?.length > 0 && (
                <div>
                  <p className="label-tiny mb-2">⚠ Caution Indicators</p>
                  <ul className="space-y-1.5">
                    {risk.caution_indicators.map((c: string, i: number) => (
                      <li key={i} className="text-xs text-red-700 flex items-start gap-2"><span>•</span>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {risk.positive_signals?.length > 0 && (
                <div>
                  <p className="label-tiny mb-2">✅ Positive Signals</p>
                  <ul className="space-y-1.5">
                    {risk.positive_signals.map((p: string, i: number) => (
                      <li key={i} className="text-xs text-green-700 flex items-start gap-2"><span>•</span>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs font-semibold mt-2 p-3 rounded-lg border" style={{ color: riskColor, borderColor: riskColor + "33" }}>
                {risk.recommendation}
              </p>
              <button onClick={run} disabled={riskMutation.isPending}
                className="text-xs font-semibold text-primary hover:underline">
                Re-run analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Profile Sidebar ────────────────────────────────────────────────────
function VendorProfilePanel({ vendorId, onClose }: { vendorId: string; onClose: () => void }) {
  const { data: vendor, isLoading } = useVendor(vendorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: "rgba(10,37,64,0.3)", backdropFilter: "blur(2px)" }}>
      <div className="h-full w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="text-xs font-bold text-primary">Vendor Profile</p>
            <p className="text-sm font-bold text-heading">{vendor?.legal_name ?? "Loading…"}</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-mute" /></button>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !vendor ? (
          <p className="p-5 text-sm text-mute">Profile not found.</p>
        ) : (
          <div className="flex-1 p-5 space-y-5 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#635BFF] to-[#0570DE] text-sm font-bold text-white">
                {(vendor.legal_name ?? "V").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-heading">{vendor.legal_name}</p>
                <p className="text-xs text-mute flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{vendor.city}{vendor.state ? `, ${vendor.state}` : ""}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 rounded-xl bg-accent p-3">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-heading">{vendor.avg_rating?.toFixed(1) ?? "—"}</span>
              <span className="text-xs text-mute">/ 5 · {vendor.total_ratings ?? 0} rating{vendor.total_ratings !== 1 ? "s" : ""}</span>
              <StatusBadge status={(vendor.status ?? "").toUpperCase()} />
            </div>

            {/* Business Details */}
            <div className="space-y-3 text-xs">
              <p className="label-tiny">Business Info</p>
              {[
                ["Business Type",    vendor.business_type],
                ["GSTIN",           vendor.gstin],
                ["PAN",             vendor.pan],
                ["Email",           vendor.business_email],
                ["Phone",           vendor.phone],
                ["Address",        [vendor.registered_address, vendor.city, vendor.state, vendor.pin_code].filter(Boolean).join(", ")],
              ].map(([k, v]) => v ? (
                <div key={k as string} className="flex justify-between gap-2">
                  <span className="text-mute shrink-0">{k}</span>
                  <span className="font-semibold text-heading text-right">{v}</span>
                </div>
              ) : null)}
            </div>

            {/* Categories */}
            {(vendor.industry_categories?.length ?? 0) > 0 && (
              <div>
                <p className="label-tiny mb-2">Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {vendor.industry_categories!.map((c: string) => (
                    <span key={c} className="rounded-full border bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-primary">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vendor.description && (
              <div>
                <p className="label-tiny mb-1">About</p>
                <p className="text-xs text-body">{vendor.description}</p>
              </div>
            )}

            {/* Bank */}
            {vendor.bank_name && (
              <div className="rounded-xl border p-3 space-y-1.5 text-xs">
                <p className="label-tiny">Banking</p>
                {[
                  ["Bank", vendor.bank_name],
                  ["Account Holder", vendor.account_holder_name],
                  ["Account No.", vendor.account_number],
                  ["IFSC", vendor.ifsc_code],
                  ["Type", vendor.account_type],
                ].map(([k, v]) => v ? (
                  <div key={k as string} className="flex justify-between">
                    <span className="text-mute">{k}</span>
                    <span className="font-semibold text-heading">{v}</span>
                  </div>
                ) : null)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function QuoteCompare() {
  const { rfqId } = useParams({ from: "/approver/compare/$rfqId" });
  const { data: rfq }           = useRFQ(rfqId);
  const { data: quotes = [] }    = useRFQQuotations(rfqId);
  const { data: decisions = [] } = useRFQDecision(rfqId);

  // The quotation that was previously approved/decided
  const decidedQuoteId = (decisions as any[])[0]?.entity_id ?? null;

  const [selected, setSelected]           = useState<string | null>(null);
  const [notes, setNotes]                 = useState("");
  const [aiScores, setAiScores]           = useState<AIScoreResult | null>(null);
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
  const [riskPanel, setRiskPanel]         = useState<{ id: string; name: string } | null>(null);
  const [profilePanel, setProfilePanel]   = useState<string | null>(null);
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [negotiateMsg, setNegotiateMsg]   = useState("");
  const decisionMutation  = useRecordDecision();
  const scoreMutation     = useAIScoreQuotes();
  const negotiateMutation = useNegotiate();

  // Auto-select if only one quote OR a prior decision exists
  const singleQuoteId   = (quotes as Quotation[]).length === 1 ? (quotes as Quotation[])[0]?.id : null;
  const effectiveSelected = selected ?? decidedQuoteId ?? singleQuoteId;

  const runAI = async () => { const r = await scoreMutation.mutateAsync(rfqId); setAiScores(r); };

  const decide = async (decision: "approve" | "escalate") => {
    if (decision === "approve" && !effectiveSelected) { toast.error("Select a quotation first"); return; }
    const fallback = (quotes as Quotation[])[0]?.id ?? "";
    await decisionMutation.mutateAsync({ rfq_id: rfqId, selected_quote_id: effectiveSelected ?? fallback, decision, notes });
  };

  const handleNegotiate = async () => {
    if (!effectiveSelected) { toast.error("Select a quotation first"); return; }
    if (!negotiateMsg.trim()) { toast.error("Enter a negotiation message"); return; }
    await negotiateMutation.mutateAsync({ rfq_id: rfqId, quotation_id: effectiveSelected, message: negotiateMsg });
    setNegotiateOpen(false);
    setNegotiateMsg("");
  };

  const aiRec = aiScores?.recommendation;
  const fmt   = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div>
      {riskPanel && (
        <RiskPanel vendorId={riskPanel.id} vendorName={riskPanel.name} onClose={() => setRiskPanel(null)} />
      )}
      {profilePanel && (
        <VendorProfilePanel vendorId={profilePanel} onClose={() => setProfilePanel(null)} />
      )}

      <Link to="/approver/pending" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">← Pending Approvals</Link>

      {/* Decision Record Banner (visible when viewing from history) */}
      {(decisions as any[]).length > 0 && (
        <div className="mb-5 space-y-3">
          {(decisions as any[]).map((d: any) => {
            const cfgMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
              QUOTE_APPROVED:     { label: "Approved",  color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" },
              APPROVAL_ESCALATED: { label: "Escalated", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
              QUOTE_REJECTED:     { label: "Rejected",  color: "#9F1239", bg: "#FFF1F2", border: "#FECDD3" },
              APPROVAL_RETURNED:  { label: "Returned",  color: "#1E40AF", bg: "#EFF6FF", border: "#BFDBFE" },
            };
            const style = cfgMap[d.event_type] ?? { label: d.event_type, color: "#374151", bg: "#F9FAFB", border: "#E5E7EB" };
            const decNotes = d.metadata?.notes;
            const decidedQ = (quotes as Quotation[]).find(q => q.id === d.entity_id);
            return (
              <div key={d.id} className="rounded-xl border p-4 space-y-3 text-xs"
                style={{ background: style.bg, borderColor: style.border }}>
                {/* Header */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold" style={{ color: style.color }}>{style.label}</span>
                  <span className="text-mute">by {d.actor_role} · {d.created_at?.slice(0, 10)}</span>
                  {decNotes && <span className="text-body italic">— "{decNotes}"</span>}
                </div>
                {/* Selected Quotation Summary */}
                {decidedQ && (
                  <div className="rounded-lg bg-white border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#635BFF] to-[#0570DE] text-[10px] font-bold text-white">
                        {(decidedQ.vendors?.legal_name ?? "V").split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <p className="font-semibold text-heading">{decidedQ.vendors?.legal_name ?? "Vendor"} — Selected Quotation</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <span className="text-mute">Unit Price: <strong className="text-heading">₹{decidedQ.unit_price.toLocaleString("en-IN")}</strong></span>
                      <span className="text-mute">Total: <strong className="text-heading">₹{decidedQ.total_amount.toLocaleString("en-IN")}</strong></span>
                      <span className="text-mute">Delivery: <strong className="text-heading">{decidedQ.delivery_days ? `${decidedQ.delivery_days} days` : "—"}</strong></span>
                      {decidedQ.validity_date && <span className="text-mute">Valid Until: <strong className="text-heading">{fmt(decidedQ.validity_date)}</strong></span>}
                      {decidedQ.warranty_terms && <span className="text-mute">Warranty: <strong className="text-heading">{decidedQ.warranty_terms}</strong></span>}
                      {decidedQ.payment_terms  && <span className="text-mute">Payment: <strong className="text-heading">{decidedQ.payment_terms}</strong></span>}
                    </div>
                    {decidedQ.notes && <p className="text-body italic">"{decidedQ.notes}"</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <PageHeader
        eyebrow={rfqId.slice(0, 8) + "…"}
        title={rfq?.title ?? "Quote Comparison"}
        subtitle={`${(quotes as Quotation[]).length} quotation(s) received`}
        actions={
          <button onClick={runAI} disabled={scoreMutation.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90 disabled:opacity-60">
            {scoreMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Evaluating…</> : <><Sparkles className="h-4 w-4" /> AI Evaluate</>}
          </button>
        }
      />

      {/* RFQ Summary */}
      {rfq && (
        <div className="mb-6 rounded-2xl border bg-card p-5 shadow-card">
          <h3 className="text-xs font-bold text-heading uppercase tracking-wider mb-3">RFQ Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {[
              ["Category",           rfq.category],
              ["Quantity",           `${rfq.quantity} ${rfq.unit_of_measurement}`],
              ["Delivery Location",  rfq.delivery_location],
              ["Submission Deadline", fmt(rfq.submission_deadline)],
              ["Delivery Deadline",  fmt(rfq.delivery_deadline)],
              ["Budget",             rfq.budget_max ? `₹${rfq.budget_min?.toLocaleString("en-IN")} – ₹${rfq.budget_max.toLocaleString("en-IN")}` : "Not disclosed"],
              ["Distribution",       rfq.distribution_type === "open" ? "🌐 Open" : "🎯 Targeted"],
              ["Status",             ""],
            ].map(([k, v]) => (
              k === "Status"
                ? <div key={k as string}><p className="label-tiny">{k}</p><div className="mt-1"><StatusBadge status={rfq.status?.toUpperCase()} /></div></div>
                : <div key={k as string}><p className="label-tiny">{k}</p><p className="mt-1 font-semibold text-heading">{v}</p></div>
            ))}
          </div>
          {rfq.description && <p className="mt-3 pt-3 border-t text-xs text-body">{rfq.description}</p>}
        </div>
      )}

      {/* AI Analysis */}
      {aiScores && (
        <div className="mb-6 rounded-2xl border bg-accent p-5 shadow-card" style={{ borderColor: "#635BFF" }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-heading">AI Analysis</p>
              <p className="text-[11px] text-mute">{aiScores.scores?.length} vendor{aiScores.scores?.length !== 1 ? "s" : ""} evaluated</p>
            </div>
          </div>

          {/* Vendor score chips */}
          {aiScores.scores?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {aiScores.scores.map((s, idx) => {
                const score = s.total_score ?? s.score;
                const rank  = s.rank ?? (idx + 1);
                const isWinner = aiScores.recommendation?.winner_vendor_name === s.vendor_name
                              || aiScores.recommendation?.vendor_name === s.vendor_name;
                return (
                  <span key={s.vendor_id}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm ${
                      isWinner ? "bg-primary text-white border-primary" : "bg-white text-heading"
                    }`}>
                    <span className={`font-bold ${ isWinner ? "text-white/80" : "text-primary" }`}>#{rank}</span>
                    {s.vendor_name ?? "Vendor"}
                    {score != null && <span className={isWinner ? "text-white/70" : "text-mute"}>· {score}/100</span>}
                  </span>
                );
              })}
            </div>
          )}

          {/* Recommendation box */}
          {(aiRec?.winner_vendor_name || aiRec?.vendor_name) && (
            <div className="rounded-lg bg-white border border-[#635BFF]/20 px-4 py-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary">
                  ✓ Recommended: {aiRec.winner_vendor_name ?? aiRec.vendor_name}
                </span>
                {aiRec.confidence && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    aiRec.confidence === "HIGH"   ? "bg-green-100 text-green-700" :
                    aiRec.confidence === "MEDIUM" ? "bg-amber-100 text-amber-700" :
                                                   "bg-red-100 text-red-700"
                  }`}>{aiRec.confidence} confidence</span>
                )}
              </div>
              {(aiRec.justification ?? aiRec.summary) && (
                <p className="text-xs text-body leading-relaxed">{aiRec.justification ?? aiRec.summary}</p>
              )}
            </div>
          )}

          {/* Price & Delivery analysis row */}
          {(aiScores.price_analysis || aiScores.delivery_analysis) && (
            <div className="grid grid-cols-2 gap-3">
              {aiScores.price_analysis && (
                <div className="rounded-lg bg-white/70 border border-[#635BFF]/10 px-3 py-2">
                  <p className="text-[10px] font-bold text-mute uppercase tracking-wide mb-1">Price Analysis</p>
                  <p className="text-xs text-heading">
                    Lowest: <strong>₹{aiScores.price_analysis.lowest_bid?.toLocaleString("en-IN")}</strong>
                    {aiScores.price_analysis.price_spread_pct > 0 &&
                      <> · Spread: {aiScores.price_analysis.price_spread_pct}%</>}
                  </p>
                  {aiScores.price_analysis.best_value_vendor && (
                    <p className="text-[11px] text-mute mt-0.5">Best value: {aiScores.price_analysis.best_value_vendor}</p>
                  )}
                </div>
              )}
              {aiScores.delivery_analysis && (
                <div className="rounded-lg bg-white/70 border border-[#635BFF]/10 px-3 py-2">
                  <p className="text-[10px] font-bold text-mute uppercase tracking-wide mb-1">Delivery Risk</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    aiScores.delivery_analysis.on_time_risk === "LOW"    ? "bg-green-100 text-green-700" :
                    aiScores.delivery_analysis.on_time_risk === "MEDIUM" ? "bg-amber-100 text-amber-700" :
                                                                           "bg-red-100 text-red-700"
                  }`}>{aiScores.delivery_analysis.on_time_risk} RISK</span>
                  <p className="text-xs text-mute mt-0.5">
                    Fastest: {aiScores.delivery_analysis.fastest_days} days
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Comparison notes */}
          {aiScores.comparison_notes && (
            <p className="mt-3 text-[11px] text-body leading-relaxed border-t border-[#635BFF]/10 pt-3">
              {aiScores.comparison_notes}
            </p>
          )}
        </div>
      )}

      {/* Quote Table — officer style */}
      <div className="mb-6">
        {(quotes as Quotation[]).length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
            <FileText className="h-8 w-8 text-mute mb-2" />
            <p className="text-sm font-semibold text-heading">No quotations received</p>
            <p className="text-xs text-mute mt-1">No vendors submitted quotes before the deadline.</p>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-heading">Quotations Received</h3>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-primary">{(quotes as Quotation[]).length}</span>
              </div>
              {selected && <p className="text-xs text-mute">Selected: <strong className="text-primary">{(quotes as Quotation[]).find(q => q.id === selected)?.vendors?.legal_name}</strong></p>}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b label-tiny text-left bg-[#F8FAFC]">
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Unit Price</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3">Delivery</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(quotes as Quotation[]).map((q) => {
                  const aiScore    = aiScores?.scores?.find(s => s.vendor_id === q.vendor_id);
                  const isSelected = effectiveSelected === q.id;
                  const expanded   = expandedQuote === q.id;
                  const vendorName = q.vendors?.legal_name ?? "Vendor";
                  return (
                    <>
                      <tr key={q.id}
                        onClick={() => setSelected(q.id)}
                        className={`border-t cursor-pointer transition-colors ${isSelected ? "bg-accent ring-inset ring-2 ring-primary/20" : "hover:bg-[#F0F4F8]"}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#635BFF] to-[#0570DE] text-[10px] font-bold text-white shrink-0">
                              {vendorName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-heading text-xs">{vendorName}</p>
                              <p className="text-[10px] text-mute">⭐ {q.vendors?.avg_rating?.toFixed(1) ?? "—"}{q.vendors?.city ? ` · ${q.vendors.city}` : ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-body text-xs">₹{q.unit_price.toLocaleString("en-IN")}</td>
                        <td className="px-5 py-3 font-bold text-heading text-xs">₹{q.total_amount.toLocaleString("en-IN")}</td>
                        <td className="px-5 py-3 text-body text-xs">{q.delivery_days ? `${q.delivery_days} days` : "—"}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={q.status?.toUpperCase()} />
                            {isSelected && <span className="text-[10px] font-bold text-primary">✓</span>}
                            {aiScore && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#EEF2FF", color: "#4F46E5" }}>
                                #{aiScore.rank ?? (aiScores!.scores.indexOf(aiScore) + 1)} · {aiScore.total_score ?? aiScore.score}/100
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={e => { e.stopPropagation(); setExpandedQuote(expanded ? null : q.id); }}
                            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-semibold text-heading hover:bg-secondary transition-colors">
                            {expanded ? "Close" : "View"}
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr key={`${q.id}-detail`} className="border-t bg-[#F8FAFC]">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3 mb-3">
                              {q.validity_date  && <div><p className="label-tiny">Valid Until</p><p className="mt-0.5 font-semibold text-heading">{fmt(q.validity_date)}</p></div>}
                              {q.warranty_terms && <div><p className="label-tiny">Warranty</p><p className="mt-0.5 font-semibold text-heading">{q.warranty_terms}</p></div>}
                              {q.delivery_terms && <div><p className="label-tiny">Delivery Terms</p><p className="mt-0.5 font-semibold text-heading">{q.delivery_terms}</p></div>}
                              {q.payment_terms  && <div><p className="label-tiny">Payment Terms</p><p className="mt-0.5 font-semibold text-heading">{q.payment_terms}</p></div>}
                              {q.notes          && <div className="col-span-2"><p className="label-tiny">Notes</p><p className="mt-0.5 text-body">{q.notes}</p></div>}
                            </div>
                            {/* AI insights */}
                            {aiScore && (aiScore.strengths?.length > 0 || aiScore.weaknesses?.length > 0) && (
                              <div className="flex flex-wrap gap-4 mb-3 text-xs">
                                {aiScore.strengths?.map((s: string, i: number) => (
                                  <span key={i} className="flex items-center gap-1 text-[#065F46]"><TrendingUp className="h-3 w-3" /> {s}</span>
                                ))}
                                {aiScore.weaknesses?.map((w: string, i: number) => (
                                  <span key={i} className="flex items-center gap-1 text-[#9F1239]"><TrendingDown className="h-3 w-3" /> {w}</span>
                                ))}
                              </div>
                            )}
                            {/* Attached files */}
                            {(q.documents?.length ?? 0) > 0 && (
                              <div className="mb-3">
                                <p className="label-tiny mb-1">Attached Files</p>
                                <div className="flex flex-wrap gap-2">
                                  {q.documents!.map((doc: any) => (
                                    doc.signed_url
                                      ? <a key={doc.id} href={doc.signed_url} target="_blank" rel="noreferrer"
                                          className="inline-flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-accent">
                                          📎 {doc.file_name}
                                        </a>
                                      : <span key={doc.id} className="text-[11px] text-mute">{doc.file_name}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Risk & Profile actions */}
                            <div className="flex gap-2 pt-2 border-t">
                              <button onClick={() => setRiskPanel({ id: q.vendor_id, name: vendorName })}
                                className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-heading hover:bg-secondary transition-colors">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Risk Assessment
                              </button>
                              <button onClick={() => setProfilePanel(q.vendor_id)}
                                className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-heading hover:bg-secondary transition-colors">
                                <User className="h-3.5 w-3.5 text-primary" /> Vendor Profile
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Negotiate Modal */}
      {negotiateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,37,64,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <p className="text-xs font-bold text-amber-600">↩ Request Negotiation</p>
                <p className="text-sm font-bold text-heading mt-0.5">
                  {(quotes as Quotation[]).find(q => q.id === effectiveSelected)?.vendors?.legal_name ?? "Selected vendor"}
                </p>
              </div>
              <button onClick={() => setNegotiateOpen(false)}><X className="h-4 w-4 text-mute" /></button>
            </div>
            <div className="px-6 py-4">
              <p className="text-xs text-body mb-3">Describe what needs to be revised. This message will go to the procurement officer who will forward it to the vendor.</p>
              <textarea
                value={negotiateMsg}
                onChange={e => setNegotiateMsg(e.target.value)}
                rows={4}
                placeholder="e.g. The unit price is 15% above market rate. Please revise to under ₹4,200 per unit with same delivery timeline…"
                className="w-full rounded-lg border bg-[#FFFBEB] p-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button onClick={() => setNegotiateOpen(false)}
                className="h-9 rounded-lg border px-4 text-xs font-semibold text-heading hover:bg-secondary">Cancel</button>
              <button onClick={handleNegotiate} disabled={!negotiateMsg.trim() || negotiateMutation.isPending}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
                {negotiateMutation.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…</> : <>↩ Send Negotiation Request</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Panel */}
      {(quotes as Quotation[]).length > 0 && (
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold text-heading mb-1">Record Decision</h3>
          {effectiveSelected && <p className="text-xs text-mute mb-3">Selected vendor: <strong className="text-primary">{(quotes as Quotation[]).find((q) => q.id === effectiveSelected)?.vendors?.legal_name}</strong></p>}
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            placeholder="Decision notes (optional)…"
            className="w-full rounded-lg border bg-white p-3 text-sm mb-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => decide("approve")} disabled={!effectiveSelected || decisionMutation.isPending}
              className="h-10 flex-1 min-w-[140px] rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card disabled:opacity-50">
              {decisionMutation.isPending ? "Processing…" : "✓ Approve & Issue PO"}
            </button>
            <button onClick={() => setNegotiateOpen(true)} disabled={decisionMutation.isPending}
              className="h-10 rounded-lg border border-amber-300 bg-amber-50 px-4 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50">
              ↩ Negotiate
            </button>
            <button onClick={() => decide("escalate")} disabled={decisionMutation.isPending}
              className="h-10 rounded-lg border bg-card px-4 text-xs font-semibold text-heading hover:bg-secondary">
              ↑ Escalate to Head
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
