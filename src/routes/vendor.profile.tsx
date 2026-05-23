import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Building2, FileText, CreditCard, MapPin, Phone, IdCard, Loader2, Pencil, X, Check, Send, Upload } from "lucide-react";
import { useMyVendorProfile, useMyVendorDocuments, useUpdateVendorProfile, useSubmitVendorProfile, useUploadVendorDocument } from "@/lib/queries";
import { PageHeader } from "@/components/app/PageHeader";
import { toast } from "sonner";
import { useRef } from "react";
import type { VendorDocument } from "@/lib/types";

export const Route = createFileRoute("/vendor/profile")({ component: VendorProfile });

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry"];
const CATEGORIES = ["IT & Software","Manufacturing","Logistics","Healthcare","Construction","Office Supplies","Electrical","Civil Works","Furniture","Printing","Catering","Security","Housekeeping","Automotive","Pharma"];
const DOC_TYPES = ["GST Certificate","PAN Card (Business)","Cancelled Cheque","Certificate of Incorporation","MSME Certificate","Other Supporting"];

const FF = `h-9 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]`;
const LBL = `mb-1 block text-[10px] font-bold uppercase tracking-wide text-mute`;

// Status → display label + colour
function StatusChip({ status }: { status?: string }) {
  const map: Record<string, { label: string; bg: string; dot: string }> = {
    registered:           { label: "Unverified",         bg: "#FFF8E1", dot: "#F59E0B" },
    pending_approval:     { label: "Under Review",       bg: "#EEF2FF", dot: "#635BFF" },
    needs_clarification:  { label: "Needs Clarification",bg: "#FFF1F2", dot: "#E11D48" },
    verified:             { label: "Verified",           bg: "#ECFDF5", dot: "#0E9F6E" },
    suspended:            { label: "Suspended",          bg: "#FEF3C7", dot: "#D97706" },
  };
  const s = map[status || "registered"] || map["registered"];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: s.bg, color: s.dot }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function Field({ label, required, value, editing, children }: { label: string; required?: boolean; value?: string | null; editing: boolean; children?: React.ReactNode }) {
  return (
    <div>
      <p className={LBL}>{label}{required && <span className="ml-0.5 text-red-500">*</span>}</p>
      {editing && children ? children : <p className="mt-1 text-sm font-semibold text-heading">{value || "—"}</p>}
    </div>
  );
}

function VendorProfile() {
  const { data: v, isLoading, refetch } = useMyVendorProfile();
  const { data: docs = [], refetch: refetchDocs } = useMyVendorDocuments();
  const updateMutation  = useUpdateVendorProfile();
  const submitMutation  = useSubmitVendorProfile();
  const uploadMutation  = useUploadVendorDocument();

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false); // track if just saved (show Request Approval btn)

  // Flat form state
  const [form, setForm] = useState({
    legal_name: "", business_type: "", date_of_incorporation: "", website: "", description: "",
    industry_categories: [] as string[],
    gstin: "", pan: "", cin: "", msme_number: "",
    business_email: "", additional_email: "", phone: "", landline: "",
    registered_address: "", operational_address: "", pin_code: "", city: "", state: "",
    bank_name: "", ifsc_code: "", account_number: "", account_holder_name: "", account_type: "Current",
  });

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const toggleCat = (c: string) => setForm(p => ({ ...p, industry_categories: p.industry_categories.includes(c) ? p.industry_categories.filter(x => x !== c) : [...p.industry_categories, c] }));

  useEffect(() => {
    if (!v) return;
    setForm({
      legal_name: v.legal_name || "", business_type: v.business_type || "",
      date_of_incorporation: v.date_of_incorporation || "", website: v.website || "", description: v.description || "",
      industry_categories: v.industry_categories || [],
      gstin: v.gstin || "", pan: v.pan || "", cin: v.cin || "", msme_number: v.msme_number || "",
      business_email: v.business_email || "", additional_email: v.additional_email || "",
      phone: v.phone || "", landline: v.landline || "",
      registered_address: v.registered_address || "", operational_address: v.operational_address || "",
      pin_code: v.pin_code || "", city: v.city || "", state: v.state || "",
      bank_name: v.bank_name || "", ifsc_code: v.ifsc_code || "",
      account_number: "", account_holder_name: v.account_holder_name || "", account_type: v.account_type || "Current",
    });
  }, [v]);

  const save = async () => {
    const { account_number, ...rest } = form;
    const payload: Record<string, unknown> = { ...rest };
    if (account_number) payload.account_number = account_number;
    await updateMutation.mutateAsync(payload);
    setEditing(false);
    setSaved(true);
    refetch();
  };

  const cancelEdit = () => {
    setEditing(false);
    // reset to server values
    if (v) setForm({
      legal_name: v.legal_name || "", business_type: v.business_type || "",
      date_of_incorporation: v.date_of_incorporation || "", website: v.website || "", description: v.description || "",
      industry_categories: v.industry_categories || [],
      gstin: v.gstin || "", pan: v.pan || "", cin: v.cin || "", msme_number: v.msme_number || "",
      business_email: v.business_email || "", additional_email: v.additional_email || "",
      phone: v.phone || "", landline: v.landline || "",
      registered_address: v.registered_address || "", operational_address: v.operational_address || "",
      pin_code: v.pin_code || "", city: v.city || "", state: v.state || "",
      bank_name: v.bank_name || "", ifsc_code: v.ifsc_code || "",
      account_number: "", account_holder_name: v.account_holder_name || "", account_type: v.account_type || "Current",
    });
  };

  const requestApproval = async () => {
    await submitMutation.mutateAsync();
    setSaved(false);
    refetch();
  };

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const uploadDoc = async (dt: string, file: File) => {
    const fd = new FormData(); fd.append("file", file); fd.append("doc_type", dt);
    await uploadMutation.mutateAsync(fd);
    refetchDocs();
  };

  const canRequestApproval = (saved || v?.status === "registered" || v?.status === "needs_clarification") && !editing;
  const showApprovalBtn = canRequestApproval && v?.status !== "pending_approval" && v?.status !== "verified";

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!v) return <p className="text-sm text-mute p-8">Profile not found.</p>;

  return (
    <div>
      <PageHeader
        title="Profile & Documents"
        subtitle="Manage your business profile, contact details, and supporting documents."
        actions={
          <div className="flex items-center gap-3">
            <StatusChip status={v.status} />
            {!editing ? (
              <>
                <button onClick={() => { setEditing(true); setSaved(false); }}
                  className="h-10 inline-flex items-center gap-2 rounded-lg border border-primary px-4 text-xs font-semibold text-primary hover:bg-accent transition">
                  <Pencil className="h-3.5 w-3.5" /> Edit Profile
                </button>
                {showApprovalBtn && (
                  <button onClick={requestApproval} disabled={submitMutation.isPending}
                    className="h-10 inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90 disabled:opacity-60">
                    {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Request KYC Approval</>}
                  </button>
                )}
              </>
            ) : (
              <>
                <button onClick={cancelEdit} className="h-10 inline-flex items-center gap-2 rounded-lg border px-4 text-xs font-semibold text-heading hover:bg-secondary">
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
                <button onClick={save} disabled={updateMutation.isPending}
                  className="h-10 inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90 disabled:opacity-60">
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-3.5 w-3.5" /> Save Changes</>}
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Approval nudge banner */}
      {showApprovalBtn && !editing && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-800">Your profile is not yet submitted for verification.</p>
            <p className="text-xs text-amber-600 mt-0.5">Fill in all details, then click <b>Request KYC Approval</b> to begin verification.</p>
          </div>
          <button onClick={requestApproval} disabled={submitMutation.isPending}
            className="shrink-0 h-9 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60">
            {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Request KYC Approval</>}
          </button>
        </div>
      )}

      {v.status === "pending_approval" && (
        <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm font-semibold text-indigo-800">KYC verification in progress.</p>
          <p className="text-xs text-indigo-600 mt-0.5">Our team is reviewing your profile. You'll be notified once verified.</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Business Identity */}
        <Card icon={Building2} title="Business Identity">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Legal Name" required value={v.legal_name} editing={editing}>
              <input className={FF} value={form.legal_name} onChange={f("legal_name")} />
            </Field>
            <Field label="Business Type" required value={v.business_type} editing={editing}>
              <select className={FF} value={form.business_type} onChange={f("business_type")}>
                <option value="">Select…</option>
                {["Private Limited","Public Limited","LLP","Partnership","Sole Proprietorship","OPC"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Date of Incorporation" required value={v.date_of_incorporation} editing={editing}>
              <input type="date" className={FF} value={form.date_of_incorporation} onChange={f("date_of_incorporation")} />
            </Field>
            <Field label="Website" value={v.website} editing={editing}>
              <input className={FF} placeholder="https://" value={form.website} onChange={f("website")} />
            </Field>
            <div className="col-span-2">
              <p className={LBL}>Categories</p>
              {editing ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {CATEGORIES.map(c => (
                    <button type="button" key={c} onClick={() => toggleCat(c)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition ${form.industry_categories.includes(c) ? "bg-primary text-white border-primary" : "text-body hover:bg-accent hover:text-primary"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm font-semibold text-heading">{(v.industry_categories || []).join(", ") || "—"}</p>
              )}
            </div>
            {editing && (
              <div className="col-span-2">
                <p className={LBL}>Description</p>
                <textarea rows={3} className="w-full rounded-lg border bg-white p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]"
                  value={form.description} onChange={f("description")} />
              </div>
            )}
          </div>
        </Card>

        {/* Tax & Legal */}
        <Card icon={IdCard} title="Tax & Legal">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="GSTIN" required value={v.gstin} editing={editing}>
              <input className={FF} maxLength={15} placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={f("gstin")} />
            </Field>
            <Field label="PAN" required value={v.pan} editing={editing}>
              <input className={FF} maxLength={10} placeholder="AAAAA0000A" value={form.pan} onChange={f("pan")} />
            </Field>
            <Field label="CIN / LLPIN" value={v.cin} editing={editing}>
              <input className={FF} value={form.cin} onChange={f("cin")} />
            </Field>
            <Field label="MSME / UDYAM" value={v.msme_number} editing={editing}>
              <input className={FF} value={form.msme_number} onChange={f("msme_number")} />
            </Field>
          </div>
        </Card>

        {/* Contact */}
        <Card icon={Phone} title="Contact">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Business Email" required value={v.business_email} editing={editing}>
              <input type="email" className={FF} value={form.business_email} onChange={f("business_email")} />
            </Field>
            <Field label="Additional Email" value={v.additional_email} editing={editing}>
              <input type="email" className={FF} value={form.additional_email} onChange={f("additional_email")} />
            </Field>
            <Field label="Business Phone" required value={v.phone} editing={editing}>
              <input className={FF} placeholder="+91 98765 43210" value={form.phone} onChange={f("phone")} />
            </Field>
            <Field label="Landline" value={v.landline} editing={editing}>
              <input className={FF} value={form.landline} onChange={f("landline")} />
            </Field>
          </div>
        </Card>

        {/* Address */}
        <Card icon={MapPin} title="Address">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div className="col-span-2">
              <Field label="Registered Business Address" required value={v.registered_address} editing={editing}>
                <textarea rows={2} className="w-full rounded-lg border bg-white p-2 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]"
                  value={form.registered_address} onChange={f("registered_address")} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Operational Address" value={v.operational_address} editing={editing}>
                <textarea rows={2} className="w-full rounded-lg border bg-white p-2 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]"
                  value={form.operational_address} onChange={f("operational_address")} />
              </Field>
            </div>
            <Field label="PIN Code" required value={v.pin_code} editing={editing}>
              <input className={FF} maxLength={6} value={form.pin_code} onChange={f("pin_code")} />
            </Field>
            <Field label="City" required value={v.city} editing={editing}>
              <input className={FF} value={form.city} onChange={f("city")} />
            </Field>
            <div className="col-span-2">
              <Field label="State" required value={v.state} editing={editing}>
                <select className={FF} value={form.state} onChange={f("state")}>
                  <option value="">Select…</option>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </Card>

        {/* Bank Details */}
        <Card icon={CreditCard} title="Bank Details">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Bank Name" required value={v.bank_name} editing={editing}>
              <input className={FF} value={form.bank_name} onChange={f("bank_name")} />
            </Field>
            <Field label="IFSC Code" required value={v.ifsc_code} editing={editing}>
              <input className={FF} maxLength={11} placeholder="SBIN0001234" value={form.ifsc_code} onChange={f("ifsc_code")} />
            </Field>
            <Field label="Account Number" required value={v.account_number ? `XXXX ${v.account_number.slice(-4)}` : undefined} editing={editing}>
              <input type="password" className={FF} placeholder="Enter account number" value={form.account_number} onChange={f("account_number")} />
            </Field>
            <Field label="Account Holder Name" required value={v.account_holder_name} editing={editing}>
              <input className={FF} value={form.account_holder_name} onChange={f("account_holder_name")} />
            </Field>
            <Field label="Account Type" required value={v.account_type} editing={editing}>
              <select className={FF} value={form.account_type} onChange={f("account_type")}>
                {["Current","Savings","OD"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </Card>

        {/* Documents — full width */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent"><FileText className="h-4.5 w-4.5 text-primary" /></div>
            <h3 className="text-sm font-semibold text-heading">Documents</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DOC_TYPES.map(dt => {
              const existing = (docs as VendorDocument[]).find(d => d.document_type === dt);
              return (
                <div key={dt}>
                  <input ref={el => { fileRefs.current[dt] = el; }} type="file" className="hidden"
                    onChange={e => { const fl = e.target.files?.[0]; if (fl) uploadDoc(dt, fl); e.target.value = ""; }} />
                  <button type="button" onClick={() => fileRefs.current[dt]?.click()}
                    className={`w-full text-left rounded-xl border-2 border-dashed p-3 transition ${existing ? "border-[#0E9F6E] bg-[#ECFDF5]" : "border-secondary hover:border-primary hover:bg-accent/30"}`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${existing ? "bg-[#D1FAE5]" : "bg-secondary"}`}>
                        {existing ? <Check className="h-4 w-4 text-[#0E9F6E]" /> : <Upload className="h-4 w-4 text-mute" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-heading truncate">{dt}</p>
                        <p className="text-[10px] text-mute mt-0.5">{existing ? `${existing.file_name} · click to replace` : "Any file type · PDF, Word, Image, etc."}</p>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
          {uploadMutation.isPending && (
            <div className="mt-3 flex items-center gap-2 text-xs text-primary font-semibold">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent"><Icon className="h-4.5 w-4.5 text-primary" /></div>
        <h3 className="text-sm font-semibold text-heading">{title}</h3>
      </div>
      {children}
    </div>
  );
}
