import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Send, FileText } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { useCreateRFQ, useSendRFQ, useAIGenerateRFQ } from "@/lib/queries";
import type { AIRFQDraft } from "@/lib/types";

export const Route = createFileRoute("/officer/rfqs/create")({ component: Create });

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

const ALL_CATEGORIES = [
  "Furniture", "IT Hardware", "Electronics", "Office Supplies",
  "Logistics", "Machinery", "Construction", "Chemicals",
  "Food & Beverage", "Textiles", "Healthcare", "Consulting", "Other",
];

function Create() {
  const navigate        = useNavigate();
  const createMutation  = useCreateRFQ();
  const sendMutation    = useSendRFQ();
  const aiMutation      = useAIGenerateRFQ();

  const today = new Date().toISOString().split("T")[0];

  // Controlled form state
  const [form, setForm] = useState({
    title: "", description: "", item_type: "product",
    category: "Furniture", quantity: "", uom: "",
    delivery_location: "", delivery_deadline: "", submission_deadline: "",
    budget_min: "", budget_max: "", specifications: "", special_conditions: "",
  });

  // AI Assist state
  const [showAI, setShowAI]   = useState(false);
  const [aiTitle, setAiTitle] = useState("");
  const [aiDesc, setAiDesc]   = useState("");

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const runAI = async () => {
    const combined = [aiTitle, aiDesc].filter(Boolean).join("\n");
    if (!combined) { toast.error("Enter a title or description"); return; }
    const draft = await aiMutation.mutateAsync(combined) as AIRFQDraft;
    setForm(p => ({
      ...p,
      title:               draft.title              || p.title,
      description:         draft.description        || p.description,
      category:            ALL_CATEGORIES.includes(draft.category ?? "") ? (draft.category ?? p.category) : p.category,
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
    toast.success("✨ Fields autofilled — review before sending.");
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

  const buildPayload = () => ({
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
    distribution_type:   "open",   // This page always creates Open RFQs
  });

  const saveDraft = async () => {
    if (!form.title) { toast.error("Title is required to save a draft"); return; }
    try {
      await createMutation.mutateAsync(buildPayload());
      navigate({ to: "/officer/rfqs" });
    } catch (err: any) { toast.error(err?.message || "Failed to save draft"); }
  };

  const sendRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    try {
      const res: any = await createMutation.mutateAsync(buildPayload());
      const rfqId = res?.rfq_id || res?.id;
      if (!rfqId) { toast.error("Failed to get RFQ ID from server"); return; }
      await sendMutation.mutateAsync(rfqId);
      navigate({ to: "/officer/rfqs" });
    } catch (err: any) { toast.error(err?.message || "Failed to send RFQ"); }
  };

  const busy = createMutation.isPending || sendMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Create Open RFQ"
        subtitle="Post a public request for quotation — all verified vendors can view and respond."
        actions={
          <button onClick={() => setShowAI(!showAI)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border transition ${showAI ? "bg-[#635BFF] text-white border-[#635BFF]" : "border-[#635BFF] text-[#635BFF] hover:bg-accent"}`}>
            <Sparkles className="h-4 w-4" /> AI Assist
          </button>
        }
      />

      {/* AI Assist panel */}
      {showAI && (
        <div className="mb-6 rounded-2xl border border-[#635BFF]/30 bg-[#F8F6FF] p-5 shadow-card">
          <p className="text-xs font-bold text-[#635BFF] mb-3">✨ AI Assist — describe your need and autofill the form</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title / Subject">
              <input value={aiTitle} onChange={e => setAiTitle(e.target.value)}
                placeholder="e.g. Office Chairs Procurement"
                className={IP} />
            </Field>
            <Field label="Detailed Requirement">
              <input value={aiDesc} onChange={e => setAiDesc(e.target.value)}
                placeholder="200 ergonomic chairs, grade A foam, Mumbai office by August…"
                className={IP} />
            </Field>
          </div>
          <button onClick={runAI} disabled={aiMutation.isPending || (!aiTitle && !aiDesc)}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card disabled:opacity-60">
            {aiMutation.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</> : <><Sparkles className="h-3.5 w-3.5" /> Autofill with AI</>}
          </button>
        </div>
      )}

      <form onSubmit={sendRFQ}>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-heading">RFQ Details</h3>
          </div>

          {/* Item type */}
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

          {/* 4-column grid — same layout as modal */}
          <div className="grid gap-4 grid-cols-4">
            <Field label="RFQ Title" required className="col-span-4">
              <input className={IP} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. 200 Ergonomic Office Chairs" />
            </Field>

            <Field label="Description" required className="col-span-4">
              <textarea className={TA} rows={2} value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="Detailed description of what you need, specifications, brand preferences…" />
            </Field>

            <Field label="Category" required className="col-span-2">
              <select className={IP} value={form.category} onChange={e => set("category", e.target.value)}>
                {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Quantity" required>
              <input className={IP} type="number" min="1" value={form.quantity} onChange={e => set("quantity", e.target.value)} placeholder="e.g. 200" />
            </Field>

            <Field label="Unit of Measurement">
              <input className={IP} value={form.uom} onChange={e => set("uom", e.target.value)} placeholder="units / kg / hours" />
            </Field>

            <Field label="Delivery Location" required className="col-span-2">
              <input className={IP} value={form.delivery_location} onChange={e => set("delivery_location", e.target.value)} placeholder="City, State" />
            </Field>

            <Field label="Submission Deadline" required>
              <input className={IP} type="date" value={form.submission_deadline}
                min={today} onChange={e => set("submission_deadline", e.target.value)} />
              <p className="mt-0.5 text-[11px] text-mute">Vendor must submit by this date</p>
            </Field>

            <Field label="Delivery Deadline" required>
              <input className={IP} type="date" value={form.delivery_deadline}
                min={form.submission_deadline || today} onChange={e => set("delivery_deadline", e.target.value)} />
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
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={saveDraft} disabled={busy}
            className="h-10 rounded-lg border bg-card px-5 text-xs font-semibold text-heading hover:bg-secondary disabled:opacity-60">
            Save Draft
          </button>
          <button type="submit" disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-6 text-xs font-semibold text-white shadow-card disabled:opacity-60">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Post Open RFQ</>}
          </button>
        </div>
      </form>
    </div>
  );
}
