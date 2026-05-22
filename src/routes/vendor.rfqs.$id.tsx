import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, Calendar, MapPin, Package, Upload } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { rfqs } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/rfqs/$id")({ component: RFQDetail });

function RFQDetail() {
  const { id } = useParams({ from: "/vendor/rfqs/$id" });
  const rfq = rfqs.find((r) => r.id === id) ?? rfqs[0];
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <Link to="/vendor/rfqs" className="text-xs font-semibold text-primary hover:underline">← Back to RFQ Inbox</Link>
      <PageHeader eyebrow={rfq.id} title={rfq.title} subtitle={rfq.description}
        actions={<><StatusBadge status={rfq.status} /><button onClick={() => setShowForm(!showForm)} className="inline-flex h-10 items-center rounded-lg bg-gradient-primary px-5 text-sm font-semibold text-white shadow-card hover:opacity-90">{showForm ? "Hide Quote Form" : "Submit Quotation"}</button></>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold text-heading mb-4">RFQ Specifications</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Category", rfq.category], ["Quantity", `${rfq.quantity} ${rfq.unit}`],
                ["Delivery Location", rfq.location], ["Submission Deadline", rfq.deadline],
                ["Delivery Deadline", rfq.deliveryDeadline], ["Budget Range", rfq.budgetMin ? `₹${rfq.budgetMin.toLocaleString("en-IN")} – ₹${rfq.budgetMax?.toLocaleString("en-IN")}` : "Not disclosed"],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <p className="label-tiny">{k}</p>
                  <p className="mt-1 text-sm font-semibold text-heading">{v}</p>
                </div>
              ))}
            </dl>
            <div className="mt-5 pt-5 border-t">
              <p className="label-tiny">Special Conditions</p>
              <p className="mt-1.5 text-sm text-body">Vendor must provide on-site installation. All items to be ergonomically certified. Compliance with IS 7596 mandatory.</p>
            </div>
          </div>

          {showForm && <QuoteForm rfq={rfq} />}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <p className="label-tiny">Issued by</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent"><Building2 className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm font-semibold text-heading">{rfq.organization}</p>
                <p className="text-xs text-mute">Verified Organization</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <p className="flex items-center gap-2 text-body"><Calendar className="h-3.5 w-3.5 text-mute" /> Posted {rfq.createdAt}</p>
              <p className="flex items-center gap-2 text-body"><MapPin className="h-3.5 w-3.5 text-mute" /> {rfq.location}</p>
              <p className="flex items-center gap-2 text-body"><Package className="h-3.5 w-3.5 text-mute" /> {rfq.quantity} {rfq.unit}</p>
            </div>
          </div>
          <button className="w-full inline-flex h-10 items-center justify-center rounded-lg border bg-card px-3 text-xs font-semibold text-heading hover:bg-secondary">Download RFQ Summary</button>
        </aside>
      </div>
    </div>
  );
}

function QuoteForm({ rfq }: { rfq: typeof rfqs[number] }) {
  const [price, setPrice] = useState(""); const total = price ? Number(price) * rfq.quantity : 0;
  const submit = (e: React.FormEvent) => { e.preventDefault(); toast.success("Quotation submitted successfully"); };
  return (
    <form onSubmit={submit} className="rounded-2xl border bg-card p-6 shadow-card animate-fade-in-up">
      <h3 className="text-sm font-semibold text-heading mb-4">Submit Your Quotation</h3>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Unit Price (₹)" required>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="0" className="ip" />
        </Field>
        <Field label="Quantity (locked)"><input value={`${rfq.quantity} ${rfq.unit}`} disabled className="ip bg-secondary" /></Field>
        <Field label="Total Amount" className="col-span-2">
          <div className="h-10 flex items-center rounded-lg border-2 px-3 text-base font-bold text-heading" style={{ borderColor: "#635BFF", background: "#EEF2FF" }}>₹{total.toLocaleString("en-IN")}</div>
        </Field>
        <Field label="Delivery Timeline (days)"><input type="number" placeholder="15" className="ip" /></Field>
        <Field label="Validity of Quotation"><input type="date" className="ip" /></Field>
        <Field label="Payment Terms"><select className="ip"><option>Net 30</option><option>Net 60</option><option>Advance 50%</option><option>On Delivery</option></select></Field>
        <Field label="Warranty"><input placeholder="e.g. 1 Year" className="ip" /></Field>
        <Field label="Delivery Terms" className="col-span-2"><input placeholder="Door delivery & installation" className="ip" /></Field>
        <Field label="Additional Notes" className="col-span-2"><textarea rows={3} placeholder="Any extra information..." className="w-full rounded-lg border bg-white p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" /></Field>
        <Field label="Supporting Documents" className="col-span-2">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-page p-6 text-center">
            <Upload className="h-6 w-6 text-mute mb-2" />
            <p className="text-sm font-semibold text-heading">Drop files here or click to upload</p>
            <p className="text-xs text-mute mt-1">PDF, JPG, PNG up to 10MB each</p>
          </div>
        </Field>
      </div>
      <div className="mt-5 flex gap-2">
        <button type="button" className="h-10 rounded-lg border bg-card px-4 text-xs font-semibold text-heading hover:bg-secondary">Save as Draft</button>
        <button type="submit" className="h-10 flex-1 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90">Submit Quotation</button>
      </div>
      <style>{`.ip { height: 40px; width: 100%; border-radius: 8px; border: 1px solid #E3E8EF; background: white; padding: 0 12px; font-size: 14px; color: #0A2540; outline: none; } .ip:focus { border-color: #635BFF; box-shadow: 0 0 0 4px rgba(99,91,255,0.15); }`}</style>
    </form>
  );
}

function Field({ label, children, required, className = "" }: { label: string; children: React.ReactNode; required?: boolean; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-heading">{label} {required && <span className="text-[#DF1B41]">*</span>}</label>
      {children}
    </div>
  );
}
