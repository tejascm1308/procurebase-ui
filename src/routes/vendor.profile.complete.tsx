import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Upload } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/vendor/profile/complete")({ component: Wizard });

const STEPS = ["Business Identity", "Tax & Legal", "Contact Details", "Address", "Bank Details", "Documents"];

function Wizard() {
  const [step, setStep] = useState(0);
  const submit = () => toast.success("Profile submitted for approval");
  return (
    <div>
      <Link to="/vendor/profile" className="text-xs font-semibold text-primary hover:underline">← Back to profile</Link>
      <PageHeader title="Complete your profile" subtitle="6 steps to get your vendor profile verified on the platform." />

      <div className="mb-6 rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${i === step ? "bg-gradient-primary text-white shadow-card" : i < step ? "bg-[#ECFDF5] text-[#0E9F6E]" : "bg-secondary text-mute"}`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <p className={`mt-2 text-[10px] font-semibold text-center hidden md:block ${i === step ? "text-heading" : "text-mute"}`}>{s}</p>
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-[#0E9F6E]" : "bg-secondary"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="rounded-2xl border bg-card p-4 shadow-card lg:col-span-1">
          <ul className="space-y-1">
            {STEPS.map((s, i) => (
              <li key={s}>
                <button onClick={() => setStep(i)} className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium ${i === step ? "bg-accent text-primary" : "text-body hover:bg-secondary"}`}>
                  <span className="mr-2 text-xs">{i + 1}.</span> {s}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="rounded-2xl border bg-card p-6 shadow-card lg:col-span-3">
          <h3 className="text-base font-semibold text-heading mb-1">Step {step + 1}: {STEPS[step]}</h3>
          <p className="text-xs text-mute mb-5">All fields marked with * are required.</p>
          {step === 0 && <Form1 />}
          {step === 1 && <Form2 />}
          {step === 2 && <Form3 />}
          {step === 3 && <Form4 />}
          {step === 4 && <Form5 />}
          {step === 5 && <Form6 />}

          <div className="mt-6 flex items-center justify-between border-t pt-5">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="h-10 rounded-lg border bg-card px-4 text-xs font-semibold text-heading hover:bg-secondary disabled:opacity-40">← Back</button>
            <div className="flex gap-2">
              <button onClick={() => toast.success("Draft saved")} className="h-10 rounded-lg border bg-card px-4 text-xs font-semibold text-heading hover:bg-secondary">Save Draft</button>
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(step + 1)} className="h-10 rounded-lg bg-gradient-primary px-5 text-xs font-semibold text-white shadow-card hover:opacity-90">Next Step →</button>
              ) : (
                <button onClick={submit} className="h-10 rounded-lg bg-gradient-primary px-5 text-xs font-semibold text-white shadow-card hover:opacity-90">Submit for Approval</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FF = `h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]`;
const LBL = `mb-1.5 block text-xs font-semibold text-heading`;

function Form1() { return (
  <div className="grid gap-4 md:grid-cols-2">
    <div><label className={LBL}>Legal Business Name *</label><input className={FF} defaultValue="Apex Industrial Supplies" /></div>
    <div><label className={LBL}>Business Type *</label><select className={FF}><option>Private Limited</option><option>LLP</option><option>Partnership</option></select></div>
    <div><label className={LBL}>Date of Incorporation *</label><input type="date" className={FF} /></div>
    <div><label className={LBL}>Website</label><input className={FF} placeholder="https://" /></div>
    <div className="md:col-span-2"><label className={LBL}>Industry Categories *</label>
      <div className="flex flex-wrap gap-2">{["IT","Manufacturing","Logistics","Healthcare","Construction","Office Supplies"].map((c) => <button type="button" key={c} className="rounded-full border px-3 py-1 text-xs font-semibold text-body hover:bg-accent hover:text-primary hover:border-primary">+ {c}</button>)}</div>
    </div>
    <div className="md:col-span-2"><label className={LBL}>Business Description</label><textarea rows={3} className="w-full rounded-lg border bg-white p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" placeholder="Brief overview of your business…" /></div>
  </div>
);}
function Form2() { return (
  <div className="grid gap-4 md:grid-cols-2">
    <div><label className={LBL}>GSTIN *</label><input className={FF} placeholder="15 chars" /></div>
    <div><label className={LBL}>PAN *</label><input className={FF} placeholder="10 chars" /></div>
    <div><label className={LBL}>CIN / LLPIN</label><input className={FF} /></div>
    <div><label className={LBL}>MSME / UDYAM</label><input className={FF} /></div>
    <div className="md:col-span-2 flex items-center gap-2 rounded-lg p-3" style={{ background: "#ECFDF5", color: "#065F46" }}><Check className="h-4 w-4" /><span className="text-xs font-semibold">PAN embedded in GSTIN — Match ✓</span></div>
  </div>
);}
function Form3() { return (
  <div className="grid gap-4 md:grid-cols-2">
    <div><label className={LBL}>Business Email *</label><input className={FF} defaultValue="contact@apexsupplies.in" /></div>
    <div><label className={LBL}>Additional Email</label><input className={FF} /></div>
    <div><label className={LBL}>Business Phone *</label><input className={FF} placeholder="+91 98765 43210" /></div>
    <div><label className={LBL}>Landline</label><input className={FF} /></div>
  </div>
);}
function Form4() { return (
  <div className="grid gap-4 md:grid-cols-2">
    <div className="md:col-span-2"><label className={LBL}>Registered Business Address *</label><textarea rows={3} className="w-full rounded-lg border bg-white p-3 text-sm" /></div>
    <div className="md:col-span-2 flex items-center gap-2"><input type="checkbox" id="same" /><label htmlFor="same" className="text-xs text-body">Operational address same as registered</label></div>
    <div><label className={LBL}>PIN Code *</label><input className={FF} /></div>
    <div><label className={LBL}>City *</label><input className={FF} /></div>
    <div><label className={LBL}>State *</label><select className={FF}><option>Maharashtra</option><option>Karnataka</option><option>Delhi</option><option>Tamil Nadu</option></select></div>
  </div>
);}
function Form5() { return (
  <div className="grid gap-4 md:grid-cols-2">
    <div><label className={LBL}>Bank Name *</label><input className={FF} /></div>
    <div><label className={LBL}>IFSC Code *</label><input className={FF} /></div>
    <div><label className={LBL}>Account Number *</label><input className={FF} /></div>
    <div><label className={LBL}>Confirm Account Number *</label><input className={FF} /></div>
    <div><label className={LBL}>Account Holder Name *</label><input className={FF} /></div>
    <div><label className={LBL}>Account Type *</label><select className={FF}><option>Current</option><option>Savings</option><option>OD</option></select></div>
  </div>
);}
function Form6() { return (
  <div className="grid gap-4 md:grid-cols-2">
    {["GST Certificate","PAN Card (Business)","Cancelled Cheque","Certificate of Incorporation","MSME Certificate","Other Supporting"].map((d) => (
      <div key={d} className="rounded-lg border-2 border-dashed p-4 text-center hover:border-primary hover:bg-accent/30">
        <Upload className="mx-auto h-6 w-6 text-mute mb-2" />
        <p className="text-sm font-semibold text-heading">{d}</p>
        <p className="text-[10px] text-mute mt-1">PDF, JPG, PNG · max 10MB</p>
      </div>
    ))}
  </div>
);}
