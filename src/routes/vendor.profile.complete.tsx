import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Check, Upload, X, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import {
  useMyVendorProfile,
  useUpdateVendorProfile,
  useSubmitVendorProfile,
  useUploadVendorDocument,
  useMyVendorDocuments,
} from "@/lib/queries";
import type { Vendor, VendorDocument } from "@/lib/types";

export const Route = createFileRoute("/vendor/profile/complete")({ component: Wizard });

const STEPS = ["Business Identity", "Tax & Legal", "Contact Details", "Address", "Bank Details", "Documents"];

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry"];
const CATEGORIES = ["IT & Software","Manufacturing","Logistics","Healthcare","Construction","Office Supplies","Electrical","Civil Works","Furniture","Printing","Catering","Security","Housekeeping","Automotive","Pharma"];

const FF = `h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]`;
const LBL = `mb-1.5 block text-xs font-semibold text-heading`;

function Wizard() {
  const navigate = useNavigate();
  const { data: v, isLoading } = useMyVendorProfile();
  const { data: docs = [] } = useMyVendorDocuments();
  const updateMutation   = useUpdateVendorProfile();
  const submitMutation   = useSubmitVendorProfile();
  const uploadMutation   = useUploadVendorDocument();

  const [step, setStep] = useState(0);

  // Form state — initialised from API data
  const [f1, setF1] = useState({ legal_name: "", business_type: "", date_of_incorporation: "", website: "", description: "", industry_categories: [] as string[] });
  const [f2, setF2] = useState({ gstin: "", pan: "", cin: "", msme_number: "" });
  const [f3, setF3] = useState({ business_email: "", additional_email: "", phone: "", landline: "" });
  const [f4, setF4] = useState({ registered_address: "", operational_address: "", pin_code: "", city: "", state: "" });
  const [f5, setF5] = useState({ bank_name: "", ifsc_code: "", account_number: "", confirm_account: "", account_holder_name: "", account_type: "Current" });
  const [sameAddress, setSameAddress] = useState(false);

  // Pre-populate on load
  useEffect(() => {
    if (!v) return;
    setF1({ legal_name: v.legal_name || "", business_type: v.business_type || "", date_of_incorporation: v.date_of_incorporation || "", website: v.website || "", description: v.description || "", industry_categories: v.industry_categories || [] });
    setF2({ gstin: v.gstin || "", pan: v.pan || "", cin: v.cin || "", msme_number: v.msme_number || "" });
    setF3({ business_email: v.business_email || "", additional_email: v.additional_email || "", phone: v.phone || "", landline: v.landline || "" });
    setF4({ registered_address: v.registered_address || "", operational_address: v.operational_address || "", pin_code: v.pin_code || "", city: v.city || "", state: v.state || "" });
    setF5({ bank_name: v.bank_name || "", ifsc_code: v.ifsc_code || "", account_number: "", confirm_account: "", account_holder_name: v.account_holder_name || "", account_type: v.account_type || "Current" });
  }, [v]);

  const toggleCategory = (c: string) => setF1(prev => ({ ...prev, industry_categories: prev.industry_categories.includes(c) ? prev.industry_categories.filter(x => x !== c) : [...prev.industry_categories, c] }));

  const saveDraft = async () => {
    if (f5.account_number && f5.account_number !== f5.confirm_account) {
      toast.error("Account numbers do not match"); return;
    }
    const payload: Record<string, unknown> = { ...f1, ...f2, ...f3, ...f4, bank_name: f5.bank_name, ifsc_code: f5.ifsc_code, account_number: f5.account_number, account_holder_name: f5.account_holder_name, account_type: f5.account_type };
    await updateMutation.mutateAsync(payload);
  };

  const next = async () => { await saveDraft(); if (step < STEPS.length - 1) setStep(step + 1); };
  const back = () => setStep(Math.max(0, step - 1));

  const submitForApproval = async () => {
    await saveDraft();
    await submitMutation.mutateAsync();
    navigate({ to: "/vendor/profile" });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <Link to="/vendor/profile" className="text-xs font-semibold text-primary hover:underline">← Back to profile</Link>
      <PageHeader title="Complete your profile" subtitle="Fill in your business details to get verified on ProcuBase." />

      {/* Step indicator */}
      <div className="mb-6 rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button onClick={() => setStep(i)} className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${i === step ? "bg-gradient-primary text-white shadow-card" : i < step ? "bg-[#ECFDF5] text-[#0E9F6E]" : "bg-secondary text-mute"}`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </button>
                <p className={`mt-2 text-[10px] font-semibold text-center hidden md:block ${i === step ? "text-heading" : "text-mute"}`}>{s}</p>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-[#0E9F6E]" : "bg-secondary"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="rounded-2xl border bg-card p-4 shadow-card lg:col-span-1">
          <ul className="space-y-1">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button onClick={() => setStep(i)} className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium ${i === step ? "bg-accent text-primary" : "text-body hover:bg-secondary"}`}>
                  <span className="mr-2 text-xs">{i + 1}.</span>{s}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Form panel */}
        <div className="rounded-2xl border bg-card p-6 shadow-card lg:col-span-3">
          <h3 className="text-base font-semibold text-heading mb-1">Step {step + 1}: {STEPS[step]}</h3>
          <p className="text-xs text-mute mb-5">Fields marked * are required.</p>

          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={LBL}>Legal Business Name *</label><input className={FF} value={f1.legal_name} onChange={e => setF1(p => ({ ...p, legal_name: e.target.value }))} /></div>
              <div><label className={LBL}>Business Type *</label>
                <select className={FF} value={f1.business_type} onChange={e => setF1(p => ({ ...p, business_type: e.target.value }))}>
                  <option value="">Select type…</option>
                  {["Private Limited","Public Limited","LLP","Partnership","Sole Proprietorship","OPC"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className={LBL}>Date of Incorporation *</label><input type="date" className={FF} value={f1.date_of_incorporation} onChange={e => setF1(p => ({ ...p, date_of_incorporation: e.target.value }))} /></div>
              <div><label className={LBL}>Website</label><input className={FF} placeholder="https://" value={f1.website} onChange={e => setF1(p => ({ ...p, website: e.target.value }))} /></div>
              <div className="md:col-span-2">
                <label className={LBL}>Industry Categories *</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button type="button" key={c} onClick={() => toggleCategory(c)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${f1.industry_categories.includes(c) ? "bg-primary text-white border-primary" : "text-body hover:bg-accent hover:text-primary hover:border-primary"}`}>
                      {f1.industry_categories.includes(c) ? <><Check className="inline h-3 w-3 mr-1" />{c}</> : `+ ${c}`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2"><label className={LBL}>Business Description</label><textarea rows={3} className="w-full rounded-lg border bg-white p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" placeholder="Brief overview of your business…" value={f1.description} onChange={e => setF1(p => ({ ...p, description: e.target.value }))} /></div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={LBL}>GSTIN *</label><input className={FF} maxLength={15} placeholder="22AAAAA0000A1Z5" value={f2.gstin} onChange={e => setF2(p => ({ ...p, gstin: e.target.value.toUpperCase() }))} /></div>
              <div><label className={LBL}>PAN *</label><input className={FF} maxLength={10} placeholder="AAAAA0000A" value={f2.pan} onChange={e => setF2(p => ({ ...p, pan: e.target.value.toUpperCase() }))} /></div>
              <div><label className={LBL}>CIN / LLPIN</label><input className={FF} value={f2.cin} onChange={e => setF2(p => ({ ...p, cin: e.target.value }))} /></div>
              <div><label className={LBL}>MSME / UDYAM Number</label><input className={FF} value={f2.msme_number} onChange={e => setF2(p => ({ ...p, msme_number: e.target.value }))} /></div>
              {f2.gstin.length === 15 && f2.pan.length === 10 && (
                <div className="md:col-span-2 flex items-center gap-2 rounded-lg p-3" style={{ background: "#ECFDF5", color: "#065F46" }}>
                  <Check className="h-4 w-4" /><span className="text-xs font-semibold">GSTIN & PAN provided ✓</span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={LBL}>Business Email *</label><input className={FF} type="email" value={f3.business_email} onChange={e => setF3(p => ({ ...p, business_email: e.target.value }))} /></div>
              <div><label className={LBL}>Additional Email</label><input className={FF} type="email" value={f3.additional_email} onChange={e => setF3(p => ({ ...p, additional_email: e.target.value }))} /></div>
              <div><label className={LBL}>Business Phone *</label><input className={FF} placeholder="+91 98765 43210" value={f3.phone} onChange={e => setF3(p => ({ ...p, phone: e.target.value }))} /></div>
              <div><label className={LBL}>Landline</label><input className={FF} placeholder="022-12345678" value={f3.landline} onChange={e => setF3(p => ({ ...p, landline: e.target.value }))} /></div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><label className={LBL}>Registered Business Address *</label><textarea rows={3} className="w-full rounded-lg border bg-white p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" value={f4.registered_address} onChange={e => setF4(p => ({ ...p, registered_address: e.target.value }))} /></div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="same" checked={sameAddress} onChange={e => { setSameAddress(e.target.checked); if (e.target.checked) setF4(p => ({ ...p, operational_address: p.registered_address })); }} />
                <label htmlFor="same" className="text-xs text-body">Operational address same as registered</label>
              </div>
              {!sameAddress && (
                <div className="md:col-span-2"><label className={LBL}>Operational Address</label><textarea rows={3} className="w-full rounded-lg border bg-white p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" value={f4.operational_address} onChange={e => setF4(p => ({ ...p, operational_address: e.target.value }))} /></div>
              )}
              <div><label className={LBL}>PIN Code *</label><input className={FF} maxLength={6} value={f4.pin_code} onChange={e => setF4(p => ({ ...p, pin_code: e.target.value }))} /></div>
              <div><label className={LBL}>City *</label><input className={FF} value={f4.city} onChange={e => setF4(p => ({ ...p, city: e.target.value }))} /></div>
              <div><label className={LBL}>State *</label>
                <select className={FF} value={f4.state} onChange={e => setF4(p => ({ ...p, state: e.target.value }))}>
                  <option value="">Select state…</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className={LBL}>Bank Name *</label><input className={FF} value={f5.bank_name} onChange={e => setF5(p => ({ ...p, bank_name: e.target.value }))} /></div>
              <div><label className={LBL}>IFSC Code *</label><input className={FF} maxLength={11} placeholder="SBIN0001234" value={f5.ifsc_code} onChange={e => setF5(p => ({ ...p, ifsc_code: e.target.value.toUpperCase() }))} /></div>
              <div><label className={LBL}>Account Number *</label><input className={FF} type="password" value={f5.account_number} onChange={e => setF5(p => ({ ...p, account_number: e.target.value }))} /></div>
              <div><label className={LBL}>Confirm Account Number *</label><input className={FF} value={f5.confirm_account} onChange={e => setF5(p => ({ ...p, confirm_account: e.target.value }))} /></div>
              <div><label className={LBL}>Account Holder Name *</label><input className={FF} value={f5.account_holder_name} onChange={e => setF5(p => ({ ...p, account_holder_name: e.target.value }))} /></div>
              <div><label className={LBL}>Account Type *</label>
                <select className={FF} value={f5.account_type} onChange={e => setF5(p => ({ ...p, account_type: e.target.value }))}>
                  {["Current","Savings","OD"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {f5.account_number && f5.confirm_account && f5.account_number !== f5.confirm_account && (
                <div className="md:col-span-2 flex items-center gap-2 rounded-lg p-3" style={{ background: "#FFF1F2", color: "#9F1239" }}>
                  <X className="h-4 w-4" /><span className="text-xs font-semibold">Account numbers do not match</span>
                </div>
              )}
            </div>
          )}

          {step === 5 && <DocUploader docs={docs as VendorDocument[]} uploadMutation={uploadMutation} />}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between border-t pt-5">
            <button onClick={back} disabled={step === 0} className="h-10 rounded-lg border bg-card px-4 text-xs font-semibold text-heading hover:bg-secondary disabled:opacity-40">← Back</button>
            <div className="flex gap-2">
              <button onClick={saveDraft} disabled={updateMutation.isPending} className="h-10 rounded-lg border bg-card px-4 text-xs font-semibold text-heading hover:bg-secondary disabled:opacity-60">
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
              </button>
              {step < STEPS.length - 1 ? (
                <button onClick={next} disabled={updateMutation.isPending} className="h-10 rounded-lg bg-gradient-primary px-5 text-xs font-semibold text-white shadow-card hover:opacity-90 disabled:opacity-60">
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Next →"}
                </button>
              ) : (
                <button onClick={submitForApproval} disabled={submitMutation.isPending || updateMutation.isPending} className="h-10 rounded-lg bg-gradient-primary px-5 text-xs font-semibold text-white shadow-card hover:opacity-90 disabled:opacity-60">
                  {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit for Approval →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Document uploader component ────────────────────────────────────────────────
const DOC_TYPES = ["GST Certificate","PAN Card (Business)","Cancelled Cheque","Certificate of Incorporation","MSME Certificate","Other Supporting"];

function DocUploader({ docs, uploadMutation }: { docs: VendorDocument[]; uploadMutation: ReturnType<typeof useUploadVendorDocument> }) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const upload = async (docType: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("doc_type", docType);
    await uploadMutation.mutateAsync(form);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {DOC_TYPES.map(dt => {
        const existing = docs.find(d => d.document_type === dt);
        return (
          <div key={dt}>
            <input ref={el => { fileRefs.current[dt] = el; }} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) upload(dt, f); e.target.value = ""; }} />
            <button type="button" onClick={() => fileRefs.current[dt]?.click()}
              className={`w-full rounded-lg border-2 border-dashed p-4 text-center transition ${existing ? "border-[#0E9F6E] bg-[#ECFDF5]" : "hover:border-primary hover:bg-accent/30"}`}>
              {existing ? (
                <><Check className="mx-auto h-5 w-5 text-[#0E9F6E] mb-1" /><p className="text-xs font-semibold text-[#065F46]">{dt}</p><p className="text-[10px] text-mute mt-1">{existing.file_name} · Click to replace</p></>
              ) : (
                <><Upload className="mx-auto h-6 w-6 text-mute mb-2" /><p className="text-sm font-semibold text-heading">{dt}</p><p className="text-[10px] text-mute mt-1">PDF, JPG, PNG · max 10MB</p></>
              )}
            </button>
          </div>
        );
      })}
      {uploadMutation.isPending && (
        <div className="md:col-span-2 flex items-center gap-2 rounded-lg p-3 bg-accent">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /><span className="text-xs font-semibold text-primary">Uploading document…</span>
        </div>
      )}
    </div>
  );
}
