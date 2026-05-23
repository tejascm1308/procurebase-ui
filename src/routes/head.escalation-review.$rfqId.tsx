import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2, ShieldCheck, X, User, MapPin, Star, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import {
  useRFQ, useRFQQuotations, useHeadDecideEscalation,
  useAIScoreQuotes, useAIAssessRisk, useVendor, useNegotiate,
} from "@/lib/queries";
import type { Quotation, AIScoreResult } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/head/escalation-review/$rfqId")({ component: HeadEscalationDetail });

// ─── Risk Panel ───────────────────────────────────────────────────────────────
function RiskPanel({ vendorId, vendorName, onClose }: { vendorId: string; vendorName: string; onClose: () => void }) {
  const riskMutation = useAIAssessRisk();
  const [risk, setRisk] = useState<any>(null);
  const run = async () => { const r = await riskMutation.mutateAsync(vendorId); setRisk(r); };
  const riskColor = risk?.risk_level === "HIGH" ? "#9F1239" : risk?.risk_level === "MEDIUM" ? "#D97706" : "#065F46";
  const riskBg    = risk?.risk_level === "HIGH" ? "#FFF1F2" : risk?.risk_level === "MEDIUM" ? "#FFFBEB" : "#ECFDF5";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ background: "rgba(10,37,64,0.3)", backdropFilter: "blur(2px)" }}>
      <div className="h-full w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div><p className="text-xs font-bold text-primary">AI Risk Assessment</p><p className="text-sm font-bold text-heading">{vendorName}</p></div>
          <button onClick={onClose}><X className="h-5 w-5 text-mute" /></button>
        </div>
        <div className="flex-1 p-5">
          {!risk ? (
            <div className="text-center py-10">
              <ShieldCheck className="h-10 w-10 text-mute mx-auto mb-3" />
              <p className="text-sm font-semibold text-heading">Run AI Risk Check</p>
              <p className="text-xs text-mute mt-1 mb-5">Analyse this vendor's risk profile using AI.</p>
              <button onClick={run} disabled={riskMutation.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-5 text-xs font-semibold text-white shadow-card disabled:opacity-60">
                {riskMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><ShieldCheck className="h-4 w-4" /> Run Risk Check</>}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl p-4" style={{ background: riskBg, borderLeft: `4px solid ${riskColor}` }}>
                <p className="text-sm font-bold" style={{ color: riskColor }}>{risk.risk_level} Risk · {risk.risk_score}/100</p>
                <p className="text-xs text-body mt-1">{risk.summary}</p>
              </div>
              {risk.caution_indicators?.length > 0 && (
                <div><p className="label-tiny mb-2">⚠ Caution Indicators</p>
                  <ul className="space-y-1.5">{risk.caution_indicators.map((c: string, i: number) => (
                    <li key={i} className="text-xs text-red-700 flex gap-2"><span>•</span>{c}</li>
                  ))}</ul></div>
              )}
              {risk.positive_signals?.length > 0 && (
                <div><p className="label-tiny mb-2">✅ Positive Signals</p>
                  <ul className="space-y-1.5">{risk.positive_signals.map((p: string, i: number) => (
                    <li key={i} className="text-xs text-green-700 flex gap-2"><span>•</span>{p}</li>
                  ))}</ul></div>
              )}
              <p className="text-xs font-semibold p-3 rounded-lg border" style={{ color: riskColor, borderColor: riskColor + "33" }}>{risk.recommendation}</p>
              <button onClick={run} disabled={riskMutation.isPending} className="text-xs font-semibold text-primary hover:underline">Re-run analysis</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Panel ────────────────────────────────────────────────────────────
function VendorProfilePanel({ vendorId, onClose }: { vendorId: string; onClose: () => void }) {
  const { data: vendor, isLoading } = useVendor(vendorId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" style={{ background: "rgba(10,37,64,0.3)", backdropFilter: "blur(2px)" }}>
      <div className="h-full w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div><p className="text-xs font-bold text-primary">Vendor Profile</p><p className="text-sm font-bold text-heading">{vendor?.legal_name ?? "Loading…"}</p></div>
          <button onClick={onClose}><X className="h-5 w-5 text-mute" /></button>
        </div>
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !vendor ? (
          <p className="p-5 text-sm text-mute">Profile not found.</p>
        ) : (
          <div className="flex-1 p-5 space-y-5 overflow-y-auto">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#635BFF] to-[#0570DE] text-sm font-bold text-white">
                {(vendor.legal_name ?? "V").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-heading">{vendor.legal_name}</p>
                <p className="text-xs text-mute flex items-center gap-1"><MapPin className="h-3 w-3" />{vendor.city}{vendor.state ? `, ${vendor.state}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-accent p-3">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-heading">{vendor.avg_rating?.toFixed(1) ?? "—"}</span>
              <span className="text-xs text-mute">/ 5 · {vendor.total_ratings ?? 0} ratings</span>
              <StatusBadge status={(vendor.status ?? "").toUpperCase()} />
            </div>
            <div className="space-y-3 text-xs">
              <p className="label-tiny">Business Info</p>
              {[
                ["Business Type", vendor.business_type], ["GSTIN", vendor.gstin], ["PAN", vendor.pan],
                ["Email", vendor.business_email], ["Phone", vendor.phone],
                ["Address", [vendor.registered_address, vendor.city, vendor.state, vendor.pin_code].filter(Boolean).join(", ")],
              ].map(([k, v]) => v ? (
                <div key={k as string} className="flex justify-between gap-2">
                  <span className="text-mute shrink-0">{k}</span>
                  <span className="font-semibold text-heading text-right">{v}</span>
                </div>
              ) : null)}
            </div>
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
            {vendor.description && <div><p className="label-tiny mb-1">About</p><p className="text-xs text-body">{vendor.description}</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
function HeadEscalationDetail() {
  const { rfqId } = useParams({ from: "/head/escalation-review/$rfqId" });
  const { data: rfq }         = useRFQ(rfqId);
  const { data: quotes = [] } = useRFQQuotations(rfqId);
  const [selected, setSelected]           = useState<string | null>(null);
  const [notes, setNotes]                 = useState("");
  const [aiScores, setAiScores]           = useState<AIScoreResult | null>(null);
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
  const [riskPanel, setRiskPanel]         = useState<{ id: string; name: string } | null>(null);
  const [profilePanel, setProfilePanel]   = useState<string | null>(null);
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [negotiateMsg, setNegotiateMsg]   = useState("");
  const decideMutation    = useHeadDecideEscalation();
  const scoreMutation     = useAIScoreQuotes();
  const negotiateMutation = useNegotiate();


  const runAI = async () => { const r = await scoreMutation.mutateAsync(rfqId); setAiScores(r); };
  
  const decide = async (decision: "approve" | "reject") => {
    const fallback = (quotes as Quotation[])[0]?.id ?? "";
    await decideMutation.mutateAsync({ rfq_id: rfqId, selected_quote_id: effectiveSelected ?? fallback, decision, notes });
  };

  const handleNegotiate = async () => {
    if (!effectiveSelected) { toast.error("Select a quotation first"); return; }
    if (!negotiateMsg.trim()) { toast.error("Enter a negotiation message"); return; }
    await negotiateMutation.mutateAsync({ rfq_id: rfqId, quotation_id: effectiveSelected, message: negotiateMsg });
    setNegotiateOpen(false);
    setNegotiateMsg("");
  };

  // Auto-select if only one quote or a prior decision exists
  const singleQuoteId    = (quotes as Quotation[]).length === 1 ? (quotes as Quotation[])[0]?.id : null;
  const effectiveSelected = selected ?? singleQuoteId;

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const aiRec = aiScores?.recommendation;

  return (
    <div>
      {riskPanel && <RiskPanel vendorId={riskPanel.id} vendorName={riskPanel.name} onClose={() => setRiskPanel(null)} />}
      {profilePanel && <VendorProfilePanel vendorId={profilePanel} onClose={() => setProfilePanel(null)} />}

      <Link to="/head/escalations" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">← Escalations</Link>

      <PageHeader
        eyebrow={rfqId.slice(0, 8) + "…"}
        title={rfq?.title ?? "Escalation Review"}
        subtitle={`${(quotes as Quotation[]).length} quotation(s) received · Escalated for final decision`}
        actions={
          <button onClick={runAI} disabled={scoreMutation.isPending || (quotes as Quotation[]).length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90 disabled:opacity-60">
            {scoreMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Evaluating…</> : <><Sparkles className="h-4 w-4" /> AI Evaluate</>}
          </button>
        }
      />

      {/* RFQ Details */}
      {rfq && (
        <div className="mb-6 rounded-2xl border bg-card p-5 shadow-card">
          <h3 className="text-xs font-bold text-heading uppercase tracking-wider mb-3">RFQ Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {([
              ["Category",            rfq.category],
              ["Quantity",            `${rfq.quantity} ${rfq.unit_of_measurement}`],
              ["Delivery Location",   rfq.delivery_location],
              ["Submission Deadline", fmt(rfq.submission_deadline)],
              ["Delivery Deadline",   fmt(rfq.delivery_deadline)],
              ["Budget",              rfq.budget_max ? `₹${rfq.budget_min?.toLocaleString("en-IN")} – ₹${rfq.budget_max.toLocaleString("en-IN")}` : "Not disclosed"],
              ["Distribution",        rfq.distribution_type === "open" ? "🌐 Open" : "🎯 Targeted"],
              ["Status",              ""],
            ] as [string, string][]).map(([k, v]) => (
              k === "Status"
                ? <div key={k}><p className="label-tiny">{k}</p><div className="mt-1"><StatusBadge status={rfq.status?.toUpperCase()} /></div></div>
                : <div key={k}><p className="label-tiny">{k}</p><p className="mt-1 font-semibold text-heading">{v}</p></div>
            ))}
          </div>
          {rfq.description    && <p className="mt-3 pt-3 border-t text-xs text-body">{rfq.description}</p>}
          {rfq.specifications && <p className="mt-2 text-xs text-body whitespace-pre-wrap">{rfq.specifications}</p>}
        </div>
      )}

      {/* AI Recommendation */}
      {aiRec && (
        <div className="mb-6 flex items-center gap-4 rounded-2xl border bg-accent p-5 shadow-card" style={{ borderColor: "#635BFF" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"><Sparkles className="h-5 w-5 text-primary" /></div>
          <div className="flex-1">
            <p className="text-sm font-bold text-heading">AI Recommendation: <span className="text-primary">{aiRec.vendor_name}</span></p>
            <p className="text-xs text-body mt-0.5">{aiRec.summary}</p>
          </div>
        </div>
      )}

      {/* Quotation Table — officer style */}
      <div className="mb-6">
        {(quotes as Quotation[]).length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
            <FileText className="h-8 w-8 text-mute mb-2" />
            <p className="text-sm font-semibold text-heading">No quotations received</p>
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
                {(quotes as Quotation[]).map(q => {
                  const aiScore    = aiScores?.scores?.find(s => s.vendor_id === q.vendor_id);
                  const isSelected = selected === q.id;
                  const expanded   = expandedQuote === q.id;
                  const vendorName = q.vendors?.legal_name ?? "Vendor";
                  return (
                    <>
                      <tr key={q.id} onClick={() => setSelected(q.id)}
                        className={`border-t cursor-pointer transition-colors ${isSelected ? "bg-accent" : "hover:bg-[#F0F4F8]"}`}>
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={q.status?.toUpperCase()} />
                            {isSelected && <span className="text-[10px] font-bold text-primary">✓ Selected</span>}
                            {aiScore && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#EEF2FF", color: "#4F46E5" }}>#{aiScore.rank} · {aiScore.score}/100</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={e => { e.stopPropagation(); setSelected(q.id); setExpandedQuote(expanded ? null : q.id); }}
                            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-semibold text-heading hover:bg-secondary transition-colors">
                            {expanded ? "Close" : "View"}
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr key={`${q.id}-exp`} className="border-t bg-[#F8FAFC]">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mb-3">
                              {q.validity_date  && <div><p className="label-tiny">Valid Until</p><p className="mt-0.5 font-semibold text-heading">{fmt(q.validity_date)}</p></div>}
                              {q.warranty_terms && <div><p className="label-tiny">Warranty</p><p className="mt-0.5 font-semibold text-heading">{q.warranty_terms}</p></div>}
                              {q.delivery_terms && <div><p className="label-tiny">Delivery Terms</p><p className="mt-0.5 font-semibold text-heading">{q.delivery_terms}</p></div>}
                              {q.payment_terms  && <div><p className="label-tiny">Payment Terms</p><p className="mt-0.5 font-semibold text-heading">{q.payment_terms}</p></div>}
                              {q.notes          && <div className="col-span-2"><p className="label-tiny">Notes</p><p className="mt-0.5 text-body">{q.notes}</p></div>}
                            </div>
                            {/* AI insights */}
                            {aiScore && (aiScore.strengths?.length > 0 || aiScore.weaknesses?.length > 0) && (
                              <div className="flex flex-wrap gap-4 mb-3 text-xs">
                                {aiScore.strengths?.map((s: string, i: number) => <span key={i} className="flex items-center gap-1 text-[#065F46]"><TrendingUp className="h-3 w-3" /> {s}</span>)}
                                {aiScore.weaknesses?.map((w: string, i: number) => <span key={i} className="flex items-center gap-1 text-[#9F1239]"><TrendingDown className="h-3 w-3" /> {w}</span>)}
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
                            {/* Risk & Profile buttons */}
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

      {/* Decision Panel */}
      {(quotes as Quotation[]).length > 0 && (
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold text-heading mb-1">Final Decision</h3>
          {effectiveSelected && <p className="text-xs text-mute mb-3">Selected vendor: <strong className="text-primary">{(quotes as Quotation[]).find(q => q.id === effectiveSelected)?.vendors?.legal_name}</strong></p>}
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="Decision notes (optional)…"
            className="w-full rounded-lg border bg-white p-3 text-sm mb-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />


          <div className="flex gap-2 flex-wrap">
            <button onClick={() => decide("approve")} disabled={!effectiveSelected || decideMutation.isPending}
              className="h-10 flex-1 min-w-[140px] rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card disabled:opacity-50">
              {decideMutation.isPending ? "Processing…" : "✓ Approve & Issue PO"}
            </button>
            <button onClick={() => setNegotiateOpen(true)} disabled={!effectiveSelected || decideMutation.isPending}
              className="h-10 rounded-lg border border-amber-300 bg-amber-50 px-4 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50">
              ↩ Negotiate
            </button>
            <button onClick={() => decide("reject")} disabled={decideMutation.isPending}
              className="h-10 rounded-lg border border-red-200 px-4 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
              ✕ Reject RFQ
            </button>
          </div>
        </div>
      )}

      {/* Negotiate Modal — at root level so fixed positioning is not clipped */}
      {negotiateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,37,64,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <p className="text-xs font-bold text-amber-600">↩ Request Negotiation</p>
                <p className="text-sm font-bold text-heading mt-0.5">{(quotes as Quotation[]).find(q => q.id === effectiveSelected)?.vendors?.legal_name ?? "Selected vendor"}</p>
              </div>
              <button onClick={() => setNegotiateOpen(false)}><X className="h-4 w-4 text-mute" /></button>
            </div>
            <div className="px-6 py-4">
              <p className="text-xs text-body mb-3">Describe what needs to be revised. The officer will forward this to the vendor.</p>
              <textarea value={negotiateMsg} onChange={e => setNegotiateMsg(e.target.value)} rows={4}
                placeholder="e.g. The unit price needs to come down by 10%. Please also confirm warranty terms…"
                className="w-full rounded-lg border bg-[#FFFBEB] p-3 text-sm focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" />
            </div>
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button onClick={() => setNegotiateOpen(false)} className="h-9 rounded-lg border px-4 text-xs font-semibold text-heading hover:bg-secondary">Cancel</button>
              <button onClick={handleNegotiate} disabled={!negotiateMsg.trim() || negotiateMutation.isPending}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
                {negotiateMutation.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…</> : <>↩ Send Negotiation Request</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
