import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Edit3, Sparkles, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/officer/rfqs/create")({ component: Create });

function Create() {
  const [mode, setMode] = useState<"manual"|"ai">("manual");
  const [aiPrompt, setAiPrompt] = useState(""); const [aiLoading, setAiLoading] = useState(false); const [aiDone, setAiDone] = useState(false);
  const [distribution, setDistribution] = useState<"targeted"|"open">("open");
  const generate = async () => { setAiLoading(true); await new Promise(r=>setTimeout(r,1400)); setAiLoading(false); setAiDone(true); toast.success("RFQ draft generated. Please review."); };
  return (
    <div>
      <PageHeader title="Create RFQ" subtitle="Draft a request for quotation — manually or with AI assistance." />
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        {[{k:"manual",i:Edit3,t:"Manual RFQ",d:"Fill structured RFQ form manually"},{k:"ai",i:Sparkles,t:"AI-Generated RFQ",d:"Describe your need in plain language"}].map((o:any) => (
          <button key={o.k} onClick={()=>setMode(o.k)} className={`rounded-2xl border p-5 text-left transition ${mode===o.k?"border-primary bg-accent shadow-card":"bg-card hover:shadow-card"}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent"><o.i className="h-5 w-5 text-primary"/></div>
            <p className="mt-3 text-sm font-bold text-heading">{o.t}</p>
            <p className="text-xs text-body">{o.d}</p>
          </button>
        ))}
      </div>

      {mode === "ai" && (
        <div className="mb-6 rounded-2xl border bg-card p-6 shadow-card">
          <label className="text-xs font-semibold text-heading mb-2 block">Describe your procurement requirement</label>
          <textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} rows={4} className="w-full rounded-lg border bg-white p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" placeholder="We need 200 ergonomic office chairs, grade A foam, with armrests, delivered to our Mumbai office by end of August…" />
          <button onClick={generate} disabled={aiLoading||!aiPrompt} className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card disabled:opacity-60">
            {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin"/> Generating…</> : <><Sparkles className="h-4 w-4"/> Generate RFQ with AI</>}
          </button>
          {aiDone && <p className="mt-3 text-xs text-mute">✨ AI suggestion — please review and edit before sending.</p>}
        </div>
      )}

      <form onSubmit={(e)=>{e.preventDefault();toast.success("RFQ sent successfully");}} className="space-y-6">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold text-heading mb-4">RFQ Details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="RFQ Title *" full><input className={IP} defaultValue={aiDone?"Ergonomic Office Chairs - Grade A":""} placeholder="e.g. Ergonomic Office Chairs" /></Field>
            <Field label="Category *"><select className={IP}><option>Furniture</option><option>IT Hardware</option><option>Logistics</option><option>Office Supplies</option></select></Field>
            <Field label="Quantity *"><input className={IP} type="number" defaultValue={aiDone?200:undefined} /></Field>
            <Field label="Unit of Measurement"><input className={IP} placeholder="units" defaultValue={aiDone?"units":""} /></Field>
            <Field label="Delivery Location"><input className={IP} placeholder="City, State" defaultValue={aiDone?"Mumbai, MH":""} /></Field>
            <Field label="Delivery Deadline"><input className={IP} type="date" /></Field>
            <Field label="Submission Deadline"><input className={IP} type="date" /></Field>
            <Field label="Description" full><textarea rows={3} className="w-full rounded-lg border bg-white p-3 text-sm" /></Field>
            <Field label="Specifications" full><textarea rows={3} className="w-full rounded-lg border bg-white p-3 text-sm" /></Field>
            <Field label="Budget Min (₹)"><input className={IP} type="number" /></Field>
            <Field label="Budget Max (₹)"><input className={IP} type="number" /></Field>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold text-heading mb-4">Distribution</h3>
          <div className="space-y-2">
            {[["open","Open RFQ","Publish to all eligible vendors"],["targeted","Targeted RFQ","Send to selected vendors"]].map(([v,l,d]) => (
              <label key={v} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer ${distribution===v?"border-primary bg-accent":"bg-card"}`}>
                <input type="radio" name="dist" checked={distribution===v} onChange={()=>setDistribution(v as any)} className="mt-1" />
                <div><p className="text-sm font-semibold text-heading">{l}</p><p className="text-xs text-body">{d}</p></div>
              </label>
            ))}
          </div>
          {distribution === "targeted" && <p className="mt-3 text-xs text-mute">Use the Vendor Search page to add vendors to this RFQ before sending.</p>}
        </div>

        <div className="flex justify-end gap-2"><button type="button" className="h-10 rounded-lg border bg-card px-4 text-xs font-semibold text-heading">Save Draft</button><button type="submit" className="h-10 rounded-lg bg-gradient-primary px-5 text-xs font-semibold text-white shadow-card">Send RFQ</button></div>
      </form>
    </div>
  );
}
const IP = "h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]";
function Field({label, children, full}: any) { return <div className={full?"md:col-span-2":""}><label className="mb-1.5 block text-xs font-semibold text-heading">{label}</label>{children}</div>; }
