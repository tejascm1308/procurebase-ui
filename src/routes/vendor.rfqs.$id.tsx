import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Building2, Calendar, MapPin, Package, X, Loader2, Paperclip, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useRFQ, useSubmitQuotation, useMyQuotationForRFQ, useUpdateQuotation, useWithdrawQuotation, useNegotiationInfo } from "@/lib/queries";
import { api } from "@/lib/api";

export const Route = createFileRoute("/vendor/rfqs/$id")({ component: RFQDetail });

const IP = "h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]";

function QuoteModal({ rfqId, quantity, uom, rfqTitle, onClose, existingQuote, isRevision }: {
  rfqId: string; quantity: number; uom: string; rfqTitle: string; onClose: () => void;
  existingQuote?: any; isRevision?: boolean;
}) {
  const isEdit = !!existingQuote;
  const submitMutation  = useSubmitQuotation();
  const updateMutation  = useUpdateQuotation();
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const [price, setPrice]               = useState(existingQuote?.unit_price?.toString() ?? "");
  const [deliveryDays, setDeliveryDays] = useState(existingQuote?.delivery_days?.toString() ?? "");
  const [validity, setValidity]         = useState(existingQuote?.validity_date ?? "");
  const [warranty, setWarranty]         = useState(existingQuote?.warranty_terms ?? "");
  const [notes, setNotes]               = useState(existingQuote?.notes ?? "");
  const [files, setFiles]               = useState<File[]>([]);
  const [uploading, setUploading]       = useState(false);

  const total = price ? Number(price) * quantity : 0;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = [...files, ...Array.from(incoming)].slice(0, 5);
    setFiles(next);
  };

  const removeFile = (idx: number) => setFiles(f => f.filter((_, i) => i !== idx));

  const formatBytes = (b: number) => b < 1024 * 1024
    ? `${(b / 1024).toFixed(0)} KB`
    : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price) { toast.error("Please enter a unit price"); return; }
    try {
      let quoteId: string;
      if (isEdit) {
        // Update existing quotation
        await updateMutation.mutateAsync({
          quoteId: existingQuote.id,
          data: {
            unit_price: Number(price),
            delivery_days: Number(deliveryDays) || undefined,
            validity_date: validity || undefined,
            warranty_terms: warranty || undefined,
            notes: notes || undefined,
          },
        });
        quoteId = existingQuote.id;
        toast.success("Quotation updated!");
      } else {
        const res: any = await submitMutation.mutateAsync({
          rfq_id: rfqId,
          unit_price: Number(price),
          quantity,
          delivery_days: Number(deliveryDays) || 0,
          validity_date: validity || undefined,
          payment_terms: "TBD",
          warranty_terms: warranty || undefined,
          notes: notes || undefined,
        });
        quoteId = res?.quote_id;
      }

      // Upload attached files (both submit and edit modes)
      if (quoteId && files.length > 0) {
        setUploading(true);
        for (const file of files) {
          try {
            const form = new FormData();
            form.append("file", file);
            await api.upload(`/api/quotations/my/${quoteId}/documents`, form);
          } catch {
            toast.error(`Failed to upload ${file.name}`);
          }
        }
        setUploading(false);
      }

      if (!isEdit) toast.success("Quotation submitted successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit quotation");
    }
  };

  const busy = (isEdit ? updateMutation.isPending : submitMutation.isPending) || uploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,37,64,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-heading">
            {isRevision ? "✏️ Revise Your Quotation" : isEdit ? "Edit Your Quotation" : "Submit Your Quotation"}
          </h2>
            <p className="text-xs text-mute mt-0.5">Responding to: <span className="font-semibold text-primary">{rfqTitle}</span></p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-mute hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-3 gap-4">
            {/* Row 1: pricing */}
            <Field label="Unit Price (₹) *">
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" placeholder="0" className={IP} />
            </Field>
            <Field label="Quantity (locked)">
              <input value={`${quantity} ${uom}`} disabled className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-mute" />
            </Field>
            <Field label="Total Amount">
              <div className="h-10 flex items-center rounded-lg border-2 px-3 font-bold text-primary text-base" style={{ borderColor: "#635BFF", background: "#EEF2FF" }}>
                ₹{total.toLocaleString("en-IN")}
              </div>
            </Field>

            {/* Row 2: schedule — no Payment Terms */}
            <Field label="Delivery Timeline (days)">
              <input type="number" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} placeholder="e.g. 15" min="1" className={IP} />
            </Field>
            <Field label="Quotation Valid Until">
              <input type="date" value={validity} onChange={e => setValidity(e.target.value)} min={new Date().toISOString().split("T")[0]} className={IP} />
            </Field>
            <Field label="Warranty / Guarantee">
              <input value={warranty} onChange={e => setWarranty(e.target.value)} placeholder="e.g. 1 Year on-site" className={IP} />
            </Field>

            {/* Row 3: notes */}
            <Field label="Additional Notes" className="col-span-3">
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="Any additional information, terms, or conditions…"
                className="w-full rounded-lg border bg-white p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
            </Field>
          </div>

          {/* File attachments */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-heading">Attachments <span className="text-mute font-normal">(up to 5 files, any type)</span></label>
              <span className="text-[11px] text-mute">{files.length}/5 files</span>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => files.length < 5 && fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors ${
                files.length >= 5
                  ? "opacity-50 cursor-not-allowed border-[#E2E8F0]"
                  : "cursor-pointer border-[#C7D2FE] hover:bg-accent hover:border-primary"
              }`}>
              <Paperclip className="h-6 w-6 text-mute mb-2" />
              <p className="text-xs font-semibold text-heading">
                {files.length >= 5 ? "Maximum 5 files reached" : "Click or drag files here"}
              </p>
              <p className="text-[11px] text-mute mt-0.5">PDF, Excel, images, CAD files — any format accepted</p>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="*/*" className="hidden"
              onChange={e => { addFiles(e.target.files); e.target.value = ""; }} />

            {/* File list */}
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg border bg-[#F8FAFC] px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="h-3.5 w-3.5 text-primary shrink-0" />
                      <p className="text-xs font-semibold text-heading truncate">{f.name}</p>
                      <p className="text-[10px] text-mute shrink-0">{formatBytes(f.size)}</p>
                    </div>
                    <button type="button" onClick={() => removeFile(i)}
                      className="ml-2 rounded p-0.5 text-mute hover:text-red-500 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 border-t px-6 py-4 shrink-0">
          <button type="button" onClick={onClose}
            className="h-10 rounded-lg border px-5 text-sm font-semibold text-heading hover:bg-secondary">
            Cancel
          </button>
          <button onClick={submit} disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-6 text-sm font-semibold text-white shadow-card disabled:opacity-60">
            {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading files…</> : (isRevision ? "Submit Revised Quote →" : isEdit ? "Update Quotation" : "Submit Quotation")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-heading">{label}</label>
      {children}
    </div>
  );
}

function RFQDetail() {
  const { id } = useParams({ from: "/vendor/rfqs/$id" });
  const { data: rfq, isLoading } = useRFQ(id);
  const [showModal, setShowModal] = useState(false);
  const { data: existingQuote } = useMyQuotationForRFQ(id);
  const { data: negInfo }       = useNegotiationInfo(id);

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!rfq) return <p className="text-sm text-mute p-8">RFQ not found.</p>;

  const canQuote  = rfq.status === "sent";
  const canRevise = existingQuote?.status === "vendor_negotiation";
  const isClosed  = ["under_review", "closed", "approved", "cancelled"].includes(rfq.status) && !canRevise;
  const hasQuote  = !!existingQuote && existingQuote.status !== "withdrawn";

  return (
    <div>
      {showModal && (canQuote || canRevise) && <QuoteModal rfqId={rfq.id} quantity={rfq.quantity} uom={rfq.unit_of_measurement} rfqTitle={rfq.title} existingQuote={hasQuote ? existingQuote : undefined} isRevision={canRevise} onClose={() => setShowModal(false)} />}

      <Link to="/vendor/rfqs" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">← Back to RFQ Inbox</Link>

      {/* Negotiation revision banner — shown when officer forwarded negotiation to vendor */}
      {canRevise && (
        <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">↩</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">Revision Requested</p>
              <p className="text-xs text-amber-700 mt-0.5">The procurement officer has asked you to revise your quotation.</p>
              {(negInfo as any)?.vendor_message && (
                <div className="mt-3 rounded-lg bg-amber-100 border border-amber-200 px-3 py-2">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Officer's Message</p>
                  <p className="text-xs text-amber-900">{(negInfo as any).vendor_message}</p>
                </div>
              )}
              <button onClick={() => setShowModal(true)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition-colors">
                ✏️ Revise My Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {isClosed && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-dashed bg-[#F8FAFC] px-4 py-3">
          <span className="text-lg">🔒</span>
          <div>
            <p className="text-xs font-bold text-heading">This RFQ is now closed</p>
            <p className="text-xs text-mute mt-0.5">The submission period has ended. Quotations are under review by the procurement team.</p>
          </div>
        </div>
      )}

      <PageHeader eyebrow={rfq.distribution_type === "targeted" ? "Sent To You" : "Open Request"} title={rfq.title} subtitle={rfq.description}
        actions={<>
          <StatusBadge status={rfq.status?.toUpperCase()} />
          {canQuote && (
            hasQuote ? (
              <button onClick={() => setShowModal(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary bg-white px-5 text-sm font-semibold text-primary shadow-sm hover:bg-accent">
                <Pencil className="h-4 w-4" /> Edit Quotation
              </button>
            ) : (
              <button onClick={() => setShowModal(true)}
                className="inline-flex h-10 items-center rounded-lg bg-gradient-primary px-5 text-sm font-semibold text-white shadow-card hover:opacity-90">
                Submit Quotation →
              </button>
            )
          )}
        </>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main details */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold text-heading mb-4">RFQ Specifications</h3>
          <dl className="grid grid-cols-2 gap-5 text-sm">
            {[
              ["Category",             rfq.category],
              ["Quantity",             `${rfq.quantity} ${rfq.unit_of_measurement}`],
              ["Delivery Location",    rfq.delivery_location],
              ["Submission Deadline",  rfq.submission_deadline],
              ["Delivery Deadline",    rfq.delivery_deadline],
              ["Budget Range",         rfq.budget_max ? `₹${rfq.budget_min?.toLocaleString("en-IN")} – ₹${rfq.budget_max.toLocaleString("en-IN")}` : "Not disclosed"],
            ].map(([k, v]) => (
              <div key={k as string}>
                <p className="label-tiny">{k}</p>
                <p className="mt-1 text-sm font-semibold text-heading">{v}</p>
              </div>
            ))}
          </dl>
          {rfq.special_conditions && (
            <div className="mt-5 pt-5 border-t">
              <p className="label-tiny">Special Conditions</p>
              <p className="mt-1.5 text-sm text-body">{rfq.special_conditions}</p>
            </div>
          )}
          {rfq.specifications && (
            <div className="mt-4 pt-4 border-t">
              <p className="label-tiny">Technical Specifications</p>
              <p className="mt-1.5 text-sm text-body whitespace-pre-wrap">{rfq.specifications}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Issued By */}
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <p className="label-tiny mb-3">Issued By</p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent"><Building2 className="h-5 w-5 text-primary" /></div>
              <div><p className="text-sm font-semibold text-heading">Organization</p><p className="text-xs text-mute">Verified</p></div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <p className="flex items-center gap-2 text-body"><Calendar className="h-3.5 w-3.5 text-mute" /> Posted {rfq.created_at?.slice(0, 10)}</p>
              <p className="flex items-center gap-2 text-body"><MapPin className="h-3.5 w-3.5 text-mute" /> {rfq.delivery_location}</p>
              <p className="flex items-center gap-2 text-body"><Package className="h-3.5 w-3.5 text-mute" /> {rfq.quantity} {rfq.unit_of_measurement}</p>
            </div>

            {/* Only show Submit if no quote submitted yet */}
            {canQuote && !hasQuote && (
              <button onClick={() => setShowModal(true)}
                className="mt-5 w-full h-10 rounded-lg bg-gradient-primary text-xs font-semibold text-white shadow-card hover:opacity-90">
                Submit Quotation →
              </button>
            )}
          </div>

          {/* Your submitted quotation management */}
          {hasQuote && (
            <QuotationManageCard
              quote={existingQuote}
              canEdit={canQuote || canRevise}
              onEdit={() => setShowModal(true)}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

// ─── Quotation Management Card ────────────────────────────────────────────────
function QuotationManageCard({ quote, onEdit, canEdit = true }: { quote: any; onEdit: () => void; canEdit?: boolean }) {
  const withdrawMutation = useWithdrawQuotation();
  const fileInputRef     = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [docFiles, setDocFiles]   = useState<File[]>([]);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await api.upload(`/api/quotations/my/${quote.id}/documents`, form);
      toast.success(`${file.name} uploaded`);
      setDocFiles(p => [...p, file]);
    } catch (e: any) {
      toast.error(e?.message || `Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = async (list: FileList | null) => {
    if (!list) return;
    for (const f of Array.from(list)) await uploadFile(f);
  };

  const handleWithdraw = () => {
    withdrawMutation.mutate(quote.id, {
      onSuccess: () => { toast.success("Quotation withdrawn"); setConfirmWithdraw(false); },
      onError:   (e: any) => toast.error(e?.message || "Failed to withdraw"),
    });
  };

  const fmt = (n: number) => `₹${n?.toLocaleString("en-IN")}`;

  return (
    <div className="rounded-2xl border-2 bg-card p-5 shadow-card" style={{ borderColor: "#635BFF" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-primary uppercase tracking-wider">Your Quotation</p>
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-[#ECFDF5] text-[#065F46]">{quote.status}</span>
      </div>

      <dl className="space-y-2.5 text-xs">
        <div className="flex justify-between">
          <span className="text-mute">Unit Price</span>
          <span className="font-semibold text-heading">{fmt(quote.unit_price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-mute">Total Amount</span>
          <span className="font-bold text-heading text-sm">{fmt(quote.total_amount)}</span>
        </div>
        {quote.delivery_days && (
          <div className="flex justify-between">
            <span className="text-mute">Delivery</span>
            <span className="font-semibold text-heading">{quote.delivery_days} days</span>
          </div>
        )}
        {quote.validity_date && (
          <div className="flex justify-between">
            <span className="text-mute">Valid Until</span>
            <span className="font-semibold text-heading">{new Date(quote.validity_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
          </div>
        )}
        {quote.warranty_terms && (
          <div className="flex justify-between">
            <span className="text-mute">Warranty</span>
            <span className="font-semibold text-heading">{quote.warranty_terms}</span>
          </div>
        )}
      </dl>

      {/* Action buttons — only when RFQ is still accepting quotes */}
      {canEdit && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onEdit}
            className="h-9 rounded-lg border border-primary text-xs font-semibold text-primary hover:bg-accent transition-colors flex items-center justify-center gap-1">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button onClick={() => setConfirmWithdraw(true)} disabled={withdrawMutation.isPending}
            className="h-9 rounded-lg border border-red-300 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1 disabled:opacity-50">
            <Trash2 className="h-3.5 w-3.5" /> Withdraw
          </button>
        </div>
      )}

      {/* Upload additional files — only when still open */}
      {canEdit && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-[11px] font-semibold text-heading mb-2">Attach Supporting Files</p>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="w-full h-9 rounded-lg border border-dashed border-[#C7D2FE] text-xs font-semibold text-primary hover:bg-accent transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
            {uploading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…</> : <><Paperclip className="h-3.5 w-3.5" /> Click to attach</>}
          </button>
          <input ref={fileInputRef} type="file" multiple accept="*/*" className="hidden"
            onChange={e => { handleFiles(e.target.files); e.target.value = ""; }} />
          {docFiles.length > 0 && (
            <ul className="mt-2 space-y-1">
              {docFiles.map((f, i) => (
                <li key={i} className="flex items-center gap-1.5 text-[11px] text-body">
                  <Paperclip className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">{f.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Read-only notice when closed */}
      {!canEdit && (
        <p className="mt-4 text-[11px] text-mute pt-4 border-t">This RFQ is closed. Your quotation has been forwarded for review.</p>
      )}

      {/* Withdraw confirm */}
      {confirmWithdraw && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3">
          <p className="text-xs font-semibold text-red-700 mb-2">Withdraw this quotation? This cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={handleWithdraw} disabled={withdrawMutation.isPending}
              className="flex-1 h-7 rounded-md bg-red-600 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {withdrawMutation.isPending ? "Withdrawing…" : "Yes, Withdraw"}
            </button>
            <button onClick={() => setConfirmWithdraw(false)}
              className="flex-1 h-7 rounded-md border text-[11px] font-semibold text-heading hover:bg-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
