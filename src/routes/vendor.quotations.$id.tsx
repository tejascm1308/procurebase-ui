import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, Save, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useMyQuote, useUpdateMyQuote, useNegotiationInfo } from "@/lib/queries";

export const Route = createFileRoute("/vendor/quotations/$id")({ component: QuoteDetail });

function QuoteDetail() {
  const { id } = useParams({ from: "/vendor/quotations/$id" });
  const { data: q, isLoading } = useMyQuote(id);
  const { data: negInfo }       = useNegotiationInfo(q?.rfq_id ?? "");
  const updateMutation          = useUpdateMyQuote(id);

  const isNegotiation = q?.status === "vendor_negotiation";

  const [unitPrice,    setUnitPrice]    = useState<string>("");
  const [deliveryDays, setDeliveryDays] = useState<string>("");
  const [paymentTerms, setPaymentTerms] = useState<string>("");
  const [warrantyTerms,setWarrantyTerms]= useState<string>("");
  const [editNotes,    setEditNotes]    = useState<string>("");
  const [editing,      setEditing]      = useState(false);

  const initEdit = () => {
    if (!q) return;
    setUnitPrice(String(q.unit_price ?? ""));
    setDeliveryDays(String(q.delivery_days ?? ""));
    setPaymentTerms(q.payment_terms ?? "");
    setWarrantyTerms(q.warranty_terms ?? "");
    setEditNotes(q.notes ?? "");
    setEditing(true);
  };

  const handleSubmit = async () => {
    const payload: Record<string, unknown> = {};
    if (unitPrice)    payload.unit_price    = Number(unitPrice);
    if (deliveryDays) payload.delivery_days = Number(deliveryDays);
    if (paymentTerms) payload.payment_terms = paymentTerms;
    if (warrantyTerms)payload.warranty_terms= warrantyTerms;
    if (editNotes)    payload.notes         = editNotes;
    await updateMutation.mutateAsync(payload);
    setEditing(false);
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!q) return <p className="text-sm text-mute p-8">Quotation not found.</p>;

  return (
    <div className="space-y-5">
      <Link to="/vendor/quotations" className="text-xs font-semibold text-primary hover:underline">← Back to Quotations</Link>
      <PageHeader eyebrow={q.id} title={q.rfqs?.title ?? "Quotation Detail"} actions={<StatusBadge status={q.status?.toUpperCase()} />} />

      {/* Negotiation banner */}
      {isNegotiation && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">Revision requested by procurement team</p>
              {negInfo && (negInfo as any).vendor_message && (
                <p className="mt-1 text-sm text-amber-700 whitespace-pre-wrap">{(negInfo as any).vendor_message}</p>
              )}
              <p className="mt-2 text-xs text-amber-600">Please update your quotation below and submit the revised version.</p>
            </div>
          </div>
        </div>
      )}

      {/* Quote details */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        {!editing ? (
          <>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                ["Unit Price",    `₹${q.unit_price?.toLocaleString("en-IN")}`],
                ["Quantity",      q.quantity],
                ["Total Amount",  `₹${q.total_amount?.toLocaleString("en-IN")}`],
                ["Delivery Days", q.delivery_days],
                ["Validity Date", q.validity_date],
                ["Payment Terms", q.payment_terms],
                ["Warranty",      q.warranty_terms],
                ["Version",       q.version],
                ["Submitted",     q.created_at?.slice(0, 10)],
              ].map(([k, v]) => (
                <div key={k as string}><p className="label-tiny">{k}</p><p className="mt-1 font-semibold text-heading">{v ?? "—"}</p></div>
              ))}
            </dl>
            {q.notes && <div className="mt-5 pt-5 border-t"><p className="label-tiny">Notes</p><p className="mt-1 text-sm text-body">{q.notes}</p></div>}
            {isNegotiation && (
              <div className="mt-5 pt-5 border-t">
                <button onClick={initEdit}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-5 text-sm font-semibold text-white hover:bg-amber-600 shadow-card">
                  <MessageSquare className="h-4 w-4" /> Revise Quotation
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-heading">Edit Quotation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label-tiny mb-1">Unit Price (₹)</p>
                <input type="number" value={unitPrice} onChange={e => setUnitPrice(e.target.value)}
                  className="h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
              </div>
              <div>
                <p className="label-tiny mb-1">Delivery Days</p>
                <input type="number" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)}
                  className="h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
              </div>
              <div>
                <p className="label-tiny mb-1">Payment Terms</p>
                <input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}
                  className="h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
              </div>
              <div>
                <p className="label-tiny mb-1">Warranty Terms</p>
                <input value={warrantyTerms} onChange={e => setWarrantyTerms(e.target.value)}
                  className="h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
              </div>
            </div>
            <div>
              <p className="label-tiny mb-1">Notes</p>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3}
                className="w-full rounded-lg border bg-white p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={updateMutation.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-5 text-sm font-semibold text-white shadow-card disabled:opacity-60">
                {updateMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><Save className="h-4 w-4" /> Submit Revised Quote</>}
              </button>
              <button onClick={() => setEditing(false)} className="h-10 rounded-lg border px-4 text-sm font-semibold text-heading hover:bg-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
