import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star, FileText, Building2, X, Loader2, Send, ChevronLeft, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useVendor, useAIAssessRisk, useAIGenerateRFQ, useCreateRFQ, useSendRFQ } from "@/lib/queries";
import { toast } from "sonner";
import type { AIRFQDraft } from "@/lib/types";

export const Route = createFileRoute("/officer/vendors/$id")({ component: VendorDetail });

const IP = "h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]";
const TA = "w-full rounded-lg border bg-white p-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]";

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-heading">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function RequestQuoteModal({
  vendorId, vendorName, vendorCategories, onClose,
}: {
  vendorId: string; vendorName: string; vendorCategories: string[]; onClose: () => void;
}) {
  const createMutation = useCreateRFQ();
  const sendMutation   = useSendRFQ();
  const aiMutation     = useAIGenerateRFQ();
  const navigate       = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "", description: "", item_type: "product",
    category: vendorCategories[0] ?? "Other",
    quantity: "", uom: "", delivery_location: "",
    delivery_deadline: "", submission_deadline: "",
    budget_min: "", budget_max: "", specifications: "", special_conditions: "",
  });

  // AI Assist state
  const [aiTitle, setAiTitle]   = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAI, setShowAI]     = useState(false);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const runAI = async () => {
    if (!aiTitle && !aiPrompt) { toast.error("Enter a title or description for AI to assist"); return; }
    const combined = [aiTitle, aiPrompt].filter(Boolean).join("\n");
    try {
      const draft = await aiMutation.mutateAsync(combined) as AIRFQDraft;
      setForm(p => ({
        ...p,
        title:               draft.title              || p.title,
        description:         draft.description        || p.description,
        category:            draft.category && vendorCategories.includes(draft.category) ? draft.category : (p.category),
        quantity:            draft.quantity            || p.quantity,
        uom:                 draft.unit_of_measurement || p.uom,
        delivery_location:   draft.delivery_location   || p.delivery_location,
        delivery_deadline:   draft.delivery_deadline   || p.delivery_deadline,
        submission_deadline: draft.submission_deadline || p.submission_deadline,
        specifications:      draft.specifications      || p.specifications,
        budget_min:          draft.budget_min          || p.budget_min,
        budget_max:          draft.budget_max          || p.budget_max,
        special_conditions:  draft.special_conditions  || p.special_conditions,
      }));
      setShowAI(false);
      toast.success("✨ AI has autofilled the form. Please review before sending.");
    } catch { /* errors shown via onError */ }
  };

  const validate = () => {
    if (!form.title)               return "Title is required";
    if (!form.description)         return "Description is required";
    if (!form.quantity || Number(form.quantity) < 1) return "Quantity must be at least 1";
    if (!form.delivery_location)   return "Delivery location is required";
    if (!form.submission_deadline) return "Submission deadline is required";
    if (!form.delivery_deadline)   return "Delivery deadline is required";
    if (new Date(form.submission_deadline) < new Date(today)) return "Submission deadline must be today or later";
    if (new Date(form.delivery_deadline)   < new Date(today)) return "Delivery deadline must be today or later";
    if (new Date(form.submission_deadline) >= new Date(form.delivery_deadline))
      return "Submission deadline must be before delivery deadline";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    const payload = {
      title:               form.title,
      description:         form.description,
      category:            form.category,
      quantity:            Number(form.quantity),
      unit_of_measurement: form.uom || "units",
      delivery_location:   form.delivery_location,
      delivery_deadline:   form.delivery_deadline,
      submission_deadline: form.submission_deadline,
      specifications:      form.specifications,
      special_conditions:  form.special_conditions,
      budget_min:          form.budget_min ? Number(form.budget_min) : null,
      budget_max:          form.budget_max ? Number(form.budget_max) : null,
      distribution_type:   "targeted",
      target_vendor_ids:   [vendorId],
    };

    try {
      const res: any = await createMutation.mutateAsync(payload);
      const rfqId = res?.rfq_id || res?.id;
      if (!rfqId) { toast.error("Failed to get RFQ ID from server"); return; }
      await sendMutation.mutateAsync(rfqId);
      toast.success(`RFQ sent to ${vendorName} ✓`);
      onClose();
      navigate({ to: "/officer/rfqs" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to send RFQ");
    }
  };

  const busy = createMutation.isPending || sendMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,37,64,0.45)", backdropFilter: "blur(4px)" }}>
      {/* Wide modal, max-h with internal scroll */}
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl">

        {/* Modal header */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-heading">Request a Quote</h2>
            <p className="text-xs text-mute mt-0.5">Sending targeted RFQ to <span className="font-semibold text-primary">{vendorName}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAI(!showAI)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${showAI ? "bg-[#635BFF] text-white border-[#635BFF]" : "border-[#635BFF] text-[#635BFF] hover:bg-accent"}`}>
              <Sparkles className="h-3.5 w-3.5" /> AI Assist
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-mute hover:bg-secondary"><X className="h-5 w-5" /></button>
          </div>
        </div>

        {/* AI Assist panel */}
        {showAI && (
          <div className="border-b px-6 py-4 shrink-0 bg-[#F8F6FF]">
            <p className="text-xs font-bold text-[#635BFF] mb-3">✨ AI Assist — autofill form from description</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-heading">Title / Subject</label>
                <input value={aiTitle} onChange={e => setAiTitle(e.target.value)}
                  placeholder="e.g. Office Chairs Procurement"
                  className={IP} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-heading">Detailed Requirement</label>
                <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  placeholder="200 ergonomic chairs, A-grade foam, Mumbai office, Aug delivery…"
                  className={IP} />
              </div>
            </div>
            <button onClick={runAI} disabled={aiMutation.isPending || (!aiTitle && !aiPrompt)}
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card disabled:opacity-60">
              {aiMutation.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</> : <><Sparkles className="h-3.5 w-3.5" /> Autofill with AI</>}
            </button>
          </div>
        )}

        {/* Form body — scrollable */}
        <form id="rfq-form" onSubmit={submit} className="flex-1 overflow-y-auto px-6 py-5">
          {/* Request type */}
          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold text-heading">Request Type</p>
            <div className="flex gap-3">
              {[["product", "Product / Goods"], ["service", "Service"]].map(([v, l]) => (
                <label key={v} className={`flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${form.item_type === v ? "border-primary bg-accent text-primary font-semibold" : "text-body hover:bg-secondary"}`}>
                  <input type="radio" name="item_type" value={v} checked={form.item_type === v} onChange={() => set("item_type", v)} className="accent-primary" />
                  {l}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 grid-cols-4">
            <Field label="Request Title" required className="col-span-4">
              <input className={IP} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. 200 Ergonomic Office Chairs" required />
            </Field>

            <Field label="Description" required className="col-span-4">
              <textarea className={TA} rows={2} value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="Detailed description of what you need, specifications, brand preferences…" required />
            </Field>

            {/* Category from vendor's profile */}
            <Field label="Category" required className="col-span-2">
              <select className={IP} value={form.category} onChange={e => set("category", e.target.value)}>
                {(vendorCategories.length > 0 ? vendorCategories : ["Other"]).map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Quantity" required>
              <input className={IP} type="number" min="1" value={form.quantity} onChange={e => set("quantity", e.target.value)} placeholder="e.g. 200" required />
            </Field>

            <Field label="Unit of Measurement">
              <input className={IP} value={form.uom} onChange={e => set("uom", e.target.value)} placeholder="units / kg / hours" />
            </Field>

            <Field label="Delivery Location" required className="col-span-2">
              <input className={IP} value={form.delivery_location} onChange={e => set("delivery_location", e.target.value)} placeholder="City, State" required />
            </Field>

            <Field label="Submission Deadline" required>
              <input className={IP} type="date" value={form.submission_deadline}
                min={today}
                onChange={e => set("submission_deadline", e.target.value)} required />
              <p className="mt-0.5 text-[11px] text-mute">Vendor must submit by this date</p>
            </Field>

            <Field label="Delivery Deadline" required>
              <input className={IP} type="date" value={form.delivery_deadline}
                min={form.submission_deadline || today}
                onChange={e => set("delivery_deadline", e.target.value)} required />
              <p className="mt-0.5 text-[11px] text-mute">Must be after submission deadline</p>
            </Field>

            <Field label="Budget Min (₹)">
              <input className={IP} type="number" value={form.budget_min} onChange={e => set("budget_min", e.target.value)} placeholder="Optional" />
            </Field>

            <Field label="Budget Max (₹)">
              <input className={IP} type="number" value={form.budget_max} onChange={e => set("budget_max", e.target.value)} placeholder="Optional" />
            </Field>

            <Field label="Technical Specifications" className="col-span-2">
              <textarea className={TA} rows={2} value={form.specifications} onChange={e => set("specifications", e.target.value)}
                placeholder="Grade, dimensions, material, compliance standards…" />
            </Field>

            <Field label="Special Conditions" className="col-span-2">
              <textarea className={TA} rows={2} value={form.special_conditions} onChange={e => set("special_conditions", e.target.value)}
                placeholder="Payment terms, delivery terms, compliance requirements…" />
            </Field>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4 shrink-0">
          <button type="button" onClick={onClose}
            className="h-10 rounded-lg border px-5 text-sm font-semibold text-heading hover:bg-secondary">Cancel</button>
          <button type="submit" form="rfq-form" disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-6 text-sm font-semibold text-white shadow-card disabled:opacity-60">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send RFQ to Vendor</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function VendorDetail() {
  const { id } = useParams({ from: "/officer/vendors/$id" });
  const { data: vendor, isLoading } = useVendor(id);
  const riskMutation  = useAIAssessRisk();
  const [risk, setRisk]       = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!vendor) return <p className="text-sm text-mute p-8">Vendor not found.</p>;

  const vendorCategories = vendor.industry_categories ?? [];
  const assessRisk = async () => { const r = await riskMutation.mutateAsync(id); setRisk(r); };

  const riskColor = risk?.risk_level === "HIGH" ? "#9F1239" : risk?.risk_level === "MEDIUM" ? "#D97706" : "#065F46";
  const riskBg    = risk?.risk_level === "HIGH" ? "#FFF1F2" : risk?.risk_level === "MEDIUM" ? "#FFFBEB" : "#ECFDF5";

  return (
    <div className="pb-24">
      {showModal && (
        <RequestQuoteModal
          vendorId={id}
          vendorName={vendor.legal_name}
          vendorCategories={vendorCategories}
          onClose={() => setShowModal(false)}
        />
      )}

      <Link to="/officer/vendors" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
        <ChevronLeft className="h-3.5 w-3.5" /> Back to Vendors
      </Link>

      <PageHeader
        eyebrow={vendor.business_type || "Vendor"}
        title={vendor.legal_name}
        subtitle={vendor.description || `${vendor.city || ""}${vendor.state ? `, ${vendor.state}` : ""}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={vendor.status?.toUpperCase()} />
            <button onClick={assessRisk} disabled={riskMutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-xs font-semibold text-heading hover:bg-secondary disabled:opacity-60">
              {riskMutation.isPending ? "Assessing…" : "AI Risk Check"}
            </button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Business details */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold text-heading mb-4">Business Details</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Business Email",   vendor.business_email],
                ["GSTIN",            vendor.gstin || "Not provided"],
                ["City",             vendor.city || "—"],
                ["State",            vendor.state || "—"],
                ["Pin Code",         vendor.pin_code || "—"],
                ["Website",          vendor.website || "—"],
                ["Phone",            vendor.phone || "—"],
                ["Orders Completed", String(vendor.completed_orders ?? 0)],
                ["Categories",       vendorCategories.join(", ") || "—"],
              ].map(([k, v]) => (
                <div key={k}><p className="label-tiny">{k}</p><p className="mt-1 font-semibold text-heading text-sm">{v}</p></div>
              ))}
            </dl>
          </div>

          {/* Documents */}
          {(vendor.documents?.length ?? 0) > 0 && (
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <h3 className="text-sm font-semibold text-heading mb-4">Documents</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {vendor.documents?.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent"><FileText className="h-4 w-4 text-primary" /></div>
                      <div><p className="text-xs font-semibold text-heading">{d.document_type}</p><p className="text-[10px] text-mute">{d.file_name}</p></div>
                    </div>
                    <StatusBadge status={d.status?.toUpperCase()} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-card text-center">
            <Building2 className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-heading">{vendor.avg_rating?.toFixed(1) ?? "—"}</p>
            <div className="flex justify-center gap-0.5 mt-1">
              {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(vendor.avg_rating || 0) ? "fill-[#F59E0B] text-[#F59E0B]" : "text-mute"}`} />)}
            </div>
            <p className="text-xs text-mute mt-1">{vendor.total_ratings ?? 0} ratings</p>
            <p className="text-xs text-mute mt-1">{vendor.completed_orders ?? 0} completed orders</p>
          </div>

          {risk && (
            <div className="rounded-2xl border p-5 shadow-card" style={{ background: riskBg, borderColor: riskColor }}>
              <p className="text-sm font-bold mb-1" style={{ color: riskColor }}>Risk: {risk.risk_level} · {risk.risk_score}/100</p>
              <p className="text-xs text-body mb-2">{risk.summary}</p>
              {risk.caution_indicators?.length > 0 && (
                <ul className="text-xs text-body space-y-0.5 mb-2">{risk.caution_indicators.map((c: string, i: number) => <li key={i}>⚠ {c}</li>)}</ul>
              )}
              {risk.positive_signals?.length > 0 && (
                <ul className="text-xs text-body space-y-0.5">{risk.positive_signals.map((p: string, i: number) => <li key={i}>✅ {p}</li>)}</ul>
              )}
              <p className="mt-3 text-xs font-semibold" style={{ color: riskColor }}>{risk.recommendation}</p>
            </div>
          )}
        </aside>
      </div>

      {/* Sticky Request Quote button */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center border-t bg-white/90 backdrop-blur-sm p-4">
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-8 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity">
          <Send className="h-4 w-4" /> Request a Quote from {vendor.legal_name}
        </button>
      </div>
    </div>
  );
}
