import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, X, AlertTriangle, Building2, MessageSquare, Send } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useRFQ, useRFQQuotations, useSendRFQ, useCloseRFQ, useForwardNegotiation, useNegotiationInfo } from "@/lib/queries";
import type { Quotation } from "@/lib/types";

export const Route = createFileRoute("/officer/rfqs/$id")({ component: RFQDetail });

// ─── Confirm Close Dialog ─────────────────────────────────────────────────────
function ConfirmCloseModal({ rfqId, quotesCount, onClose, onConfirm, loading }: {
  rfqId: string; quotesCount: number; onClose: () => void;
  onConfirm: () => void; loading: boolean;
}) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,37,64,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start gap-4 border-b px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-heading">Close RFQ & Forward to Approver?</h2>
            <p className="text-xs text-mute mt-1">
              This will stop accepting new quotations. All <strong>{quotesCount}</strong> received quotation{quotesCount !== 1 ? "s" : ""} will
              be immediately forwarded to the approver for review.
            </p>
            <p className="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              ⚠ This action cannot be undone. Vendors will no longer be able to submit quotes for this RFQ.
            </p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-mute" /></button>
        </div>

        <div className="px-6 py-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
              className="mt-0.5 accent-primary h-4 w-4" />
            <span className="text-xs text-body">
              I confirm that I want to close this RFQ (ID: <code className="text-primary">{rfqId.slice(0, 8)}…</code>) and forward it to the approver.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button onClick={onClose}
            className="h-9 rounded-lg border px-4 text-xs font-semibold text-heading hover:bg-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={!confirmed || loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-amber-600 px-4 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
            {loading ? "Closing…" : "Yes, Close & Forward"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function RFQDetail() {
  const { id } = useParams({ from: "/officer/rfqs/$id" });
  const { data: rfq, isLoading } = useRFQ(id);
  const { data: quotes = [] }    = useRFQQuotations(id);
  const { data: negInfo }        = useNegotiationInfo(id);
  const sendMutation    = useSendRFQ();
  const closeMutation   = useCloseRFQ();
  const forwardMutation = useForwardNegotiation(id);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [expandedQuote, setExpandedQuote]   = useState<string | null>(null);
  const [forwardOpen, setForwardOpen]       = useState(false);
  const [forwardQuoteId, setForwardQuoteId] = useState<string | null>(null);
  const [vendorMsg, setVendorMsg]           = useState("");

  const handleClose = () => {
    closeMutation.mutate(id, {
      onSuccess: () => { toast.success("RFQ closed and forwarded to approver ✓"); setShowConfirm(false); },
      onError:   (e: any) => toast.error(e?.message || "Failed to close RFQ"),
    });
  };

  const handleForwardNegotiation = async () => {
    if (!forwardQuoteId) return;
    if (!vendorMsg.trim()) { toast.error("Enter a message for the vendor"); return; }
    await forwardMutation.mutateAsync({ quotation_id: forwardQuoteId, vendor_message: vendorMsg });
    setForwardOpen(false);
    setVendorMsg("");
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!rfq) return <p className="text-sm text-mute p-8">RFQ not found.</p>;

  const quotesArr  = quotes as Quotation[];
  const isActive   = ["sent"].includes(rfq.status);
  const isReview   = rfq.status === "under_review";
  const isNegotiation = rfq.status === "needs_negotiation";
  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  // Deadline countdown
  const daysLeft = rfq.submission_deadline
    ? Math.ceil((new Date(rfq.submission_deadline).getTime() - Date.now()) / 86400000)
    : null;
  const urgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

  return (
    <div>
      {showConfirm && (
        <ConfirmCloseModal
          rfqId={rfq.id}
          quotesCount={quotesArr.length}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleClose}
          loading={closeMutation.isPending}
        />
      )}

      <Link to="/officer/rfqs" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">← Back to RFQs</Link>

      <PageHeader
        eyebrow={rfq.id.slice(0, 8) + "…"}
        title={rfq.title}
        subtitle={rfq.description}
        actions={<>
          <StatusBadge status={rfq.status?.toUpperCase()} />
          {rfq.status === "draft" && (
            <button onClick={() => sendMutation.mutate(id)} disabled={sendMutation.isPending}
              className="h-10 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card disabled:opacity-60">
              {sendMutation.isPending ? "Sending…" : "Send RFQ"}
            </button>
          )}
          {isActive && (
            <button onClick={() => setShowConfirm(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
              Close & Forward to Approver
            </button>
          )}
          {isReview && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#ECFDF5] border border-[#6EE7B7] px-3 py-1.5 text-xs font-semibold text-[#065F46]">
              ✓ Forwarded to Approver
            </span>
          )}
          {isNegotiation && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700">
              <MessageSquare className="h-3.5 w-3.5" /> Negotiation Pending
            </span>
          )}
        </>}
      />

      {/* Negotiation banner */}
      {isNegotiation && negInfo && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">
                {(negInfo as any).from_role === "head" ? "Procurement Head" : "Approver"} requested negotiation
              </p>
              <p className="mt-1 text-sm text-amber-700 whitespace-pre-wrap">{(negInfo as any).approver_message}</p>
              <p className="mt-2 text-xs text-amber-600">Forward this to the vendor so they can revise their quotation.</p>
            </div>
          </div>
        </div>
      )}

      {/* Forward to Vendor modal */}
      {forwardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,37,64,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <p className="text-xs font-bold text-amber-600">↩ Forward Negotiation to Vendor</p>
                <p className="text-sm font-bold text-heading mt-0.5">{quotesArr.find(q => q.id === forwardQuoteId)?.vendors?.legal_name ?? "Vendor"}</p>
              </div>
              <button onClick={() => setForwardOpen(false)}><X className="h-4 w-4 text-mute" /></button>
            </div>
            <div className="px-6 py-4">
              {negInfo && (negInfo as any).approver_message && (
                <div className="mb-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <p className="text-[11px] font-bold text-amber-700 mb-1">Message from {(negInfo as any).from_role === "head" ? "Head" : "Approver"}:</p>
                  <p className="text-xs text-amber-700">{(negInfo as any).approver_message}</p>
                </div>
              )}
              <p className="text-xs text-body mb-2">Your message to the vendor:</p>
              <textarea value={vendorMsg} onChange={e => setVendorMsg(e.target.value)} rows={4}
                placeholder="Explain what changes are needed in the quotation…"
                className="w-full rounded-lg border bg-white p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
            </div>
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button onClick={() => setForwardOpen(false)} className="h-9 rounded-lg border px-4 text-xs font-semibold text-heading hover:bg-secondary">Cancel</button>
              <button onClick={handleForwardNegotiation} disabled={!vendorMsg.trim() || forwardMutation.isPending}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
                {forwardMutation.isPending ? <><Send className="h-3.5 w-3.5 animate-pulse" /> Sending…</> : <><Send className="h-3.5 w-3.5" /> Send to Vendor</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {isActive && daysLeft !== null && (
        <div className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${urgent ? "bg-red-50 text-red-700 border border-red-200" : daysLeft <= 7 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]"}`}>
          <Clock className="h-3.5 w-3.5" />
          {daysLeft <= 0
            ? "⚠ Submission deadline has passed — this RFQ will be auto-forwarded to the approver."
            : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining until submission deadline (${fmt(rfq.submission_deadline)})`}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main: RFQ Details only */}
        <div className="lg:col-span-2 space-y-6">
          {/* RFQ Details */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold text-heading mb-4">RFQ Details</h3>
            <dl className="grid grid-cols-2 gap-y-5 gap-x-8 text-sm">
              {[
                ["Category",           rfq.category],
                ["Quantity",           `${rfq.quantity} ${rfq.unit_of_measurement}`],
                ["Delivery Location",  rfq.delivery_location],
                ["Submission Deadline", fmt(rfq.submission_deadline)],
                ["Delivery Deadline",  fmt(rfq.delivery_deadline)],
                ["Budget",             rfq.budget_max ? `₹${rfq.budget_min?.toLocaleString("en-IN")} – ₹${rfq.budget_max?.toLocaleString("en-IN")}` : "Not disclosed"],
                ["Distribution",       rfq.distribution_type === "open" ? "🌐 Open to all vendors" : "🎯 Targeted"],
                ["Quotes Received",    String(rfq.quotes_received ?? 0)],
              ].map(([k, v]) => (
                <div key={k as string}><p className="label-tiny">{k}</p><p className="mt-1 font-semibold text-heading">{v}</p></div>
              ))}
            </dl>
            {rfq.specifications && (
              <div className="mt-4 pt-4 border-t">
                <p className="label-tiny">Specifications</p>
                <p className="mt-1.5 text-sm text-body whitespace-pre-wrap">{rfq.specifications}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Timeline */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <p className="label-tiny mb-3">Timeline</p>
            <div className="space-y-3">
              {[
                { label: "Created",              date: rfq.created_at?.slice(0, 10), done: true },
                { label: "Sent to vendors",      date: rfq.sent_at?.slice(0, 10),   done: !!rfq.sent_at },
                { label: "Submission deadline",  date: rfq.submission_deadline,      done: false },
                { label: "Delivery deadline",    date: rfq.delivery_deadline,        done: false },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${t.done ? "bg-primary" : "bg-[#E2E8F0]"}`} />
                  <div>
                    <p className="text-[11px] text-mute">{t.label}</p>
                    <p className="text-xs font-semibold text-heading">{t.date ? fmt(t.date) : "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Quotations — full width below the grid */}
      <div className="mt-6">
          {quotesArr.length > 0 ? (
            <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-heading">Quotations Received</h3>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-primary">{quotesArr.length}</span>
                </div>
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
                  {quotesArr.map((q: any) => {
                    const expanded = expandedQuote === q.id;
                    return (
                      <>
                        <tr key={q.id} className="border-t hover:bg-[#F0F4F8] transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-[10px] font-bold text-primary">
                                {(q.vendors?.legal_name || "V").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-heading text-xs">{q.vendors?.legal_name ?? "Vendor"}</p>
                                <p className="text-[10px] text-mute">⭐ {q.vendors?.avg_rating?.toFixed(1) ?? "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-body">₹{q.unit_price?.toLocaleString("en-IN")}</td>
                          <td className="px-5 py-3 font-bold text-heading">₹{q.total_amount?.toLocaleString("en-IN")}</td>
                          <td className="px-5 py-3 text-body">{q.delivery_days ? `${q.delivery_days} days` : "—"}</td>
                          <td className="px-5 py-3"><StatusBadge status={q.status?.toUpperCase()} /></td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => setExpandedQuote(expanded ? null : q.id)}
                                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-semibold text-heading hover:bg-secondary transition-colors">
                                {expanded ? "Close" : "View"}
                              </button>
                              {isNegotiation && q.status === "negotiation_requested" && (
                                <button onClick={() => { setForwardQuoteId(q.id); setForwardOpen(true); }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                                  <Send className="h-3 w-3" /> Forward
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expanded && (
                          <tr key={`${q.id}-detail`} className="border-t bg-[#F8FAFC]">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                                {q.validity_date && (
                                  <div><p className="label-tiny">Valid Until</p><p className="mt-0.5 font-semibold text-heading">{new Date(q.validity_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p></div>
                                )}
                                {q.warranty_terms && (
                                  <div><p className="label-tiny">Warranty</p><p className="mt-0.5 font-semibold text-heading">{q.warranty_terms}</p></div>
                                )}
                                {q.delivery_terms && (
                                  <div><p className="label-tiny">Delivery Terms</p><p className="mt-0.5 font-semibold text-heading">{q.delivery_terms}</p></div>
                                )}
                                {q.notes && (
                                  <div className="col-span-2"><p className="label-tiny">Notes</p><p className="mt-0.5 text-body">{q.notes}</p></div>
                                )}
                                {q.documents?.length > 0 && (
                                  <div className="col-span-2">
                                    <p className="label-tiny mb-1">Attached Files</p>
                                    <div className="flex flex-wrap gap-2">
                                      {q.documents.map((doc: any) => (
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
          ) : isActive ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-12 text-center">
              <Building2 className="h-8 w-8 text-mute mb-2" />
              <p className="text-sm font-semibold text-heading">No quotations yet</p>
              <p className="text-xs text-mute mt-1">Vendors will respond before the submission deadline.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-[#F8FAFC] py-10 text-center">
              <p className="text-sm font-semibold text-heading">No quotations were received</p>
              <p className="text-xs text-mute mt-1">This RFQ closed without any vendor responses.</p>
            </div>
          )}
      </div>
    </div>
  );
}
