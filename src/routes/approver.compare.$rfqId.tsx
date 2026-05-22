import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, ShieldAlert, Loader2, BadgeCheck, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { rfqs, quotations } from "@/lib/mock-data";

export const Route = createFileRoute("/approver/compare/$rfqId")({ component: Compare });

function Compare() {
  const { rfqId } = useParams({ from: "/approver/compare/$rfqId" });
  const rfq = rfqs.find(r => r.id === rfqId) ?? rfqs[0];
  const quotes = quotations.filter(q => q.rfqId === rfq.id);
  const [scored, setScored] = useState(false); const [scoring, setScoring] = useState(false);
  const [risk, setRisk] = useState<Record<string, "LOW"|"MEDIUM"|"HIGH" | null>>({});
  const [decision, setDecision] = useState(""); const [selected, setSelected] = useState("");

  const minPrice = Math.min(...quotes.map(q=>q.totalAmount));
  const minDelivery = Math.min(...quotes.map(q=>q.deliveryDays));
  const maxRating = Math.max(...quotes.map(q=>q.rating));

  const runAI = async () => { setScoring(true); await new Promise(r=>setTimeout(r,1400)); setScoring(false); setScored(true); };
  const runRisk = async (id: string) => { setRisk(p=>({...p,[id]:null})); await new Promise(r=>setTimeout(r,900)); setRisk(p=>({...p,[id]:["LOW","MEDIUM","HIGH"][Math.floor(Math.random()*3)] as any})); };
  const submit = () => { if(!selected||!decision) return toast.error("Select a vendor and decision"); toast.success(`Decision recorded: ${decision}`); };

  const scores = scored ? quotes.map((q,i)=>({id:q.id,score: [82,91,68][i] ?? 70 })) : [];
  const ranked = [...scores].sort((a,b)=>b.score-a.score);
  const recommended = scored ? quotes.find(q=>q.id===ranked[0]?.id) : null;

  return (
    <div>
      <Link to="/approver/pending" className="text-xs font-semibold text-primary hover:underline">← Back to pending</Link>
      <PageHeader eyebrow={rfq.id} title={rfq.title} subtitle={rfq.description} actions={<StatusBadge status={rfq.status}/>} />

      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={runAI} disabled={scoring} className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card disabled:opacity-60">
          {scoring ? <><Loader2 className="h-4 w-4 animate-spin"/> Analyzing…</> : <><Sparkles className="h-4 w-4"/> AI Smart Scoring</>}
        </button>
      </div>

      <div className="mb-6 overflow-x-auto rounded-2xl border bg-card shadow-card">
        <table className="w-full text-sm min-w-[700px]">
          <thead><tr className="text-left label-tiny bg-page"><th className="px-4 py-3">Attribute</th>{quotes.map(q => <th key={q.id} className="px-4 py-3">{q.vendorName}</th>)}</tr></thead>
          <tbody>
            <Row label="Verified">{quotes.map(q => <span key={q.id} className="inline-flex items-center gap-1 text-[#0E9F6E] text-xs font-semibold"><BadgeCheck className="h-3.5 w-3.5"/>Verified</span>)}</Row>
            <Row label="Unit Price">{quotes.map(q => <span key={q.id}>₹{q.unitPrice.toLocaleString("en-IN")}</span>)}</Row>
            <Row label="Total Amount">{quotes.map(q => <span key={q.id} className={q.totalAmount===minPrice?"px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#065F46] font-bold":"font-semibold text-heading"}>₹{q.totalAmount.toLocaleString("en-IN")}</span>)}</Row>
            <Row label="Delivery">{quotes.map(q => <span key={q.id} className={q.deliveryDays===minDelivery?"px-2 py-0.5 rounded-md bg-[#ECFEFF] text-[#155E75] font-bold":""}>{q.deliveryDays} days</span>)}</Row>
            <Row label="Payment Terms">{quotes.map(q => <span key={q.id}>{q.paymentTerms}</span>)}</Row>
            <Row label="Warranty">{quotes.map(q => <span key={q.id}>{q.warranty}</span>)}</Row>
            <Row label="Rating">{quotes.map(q => <span key={q.id} className={q.rating===maxRating?"px-2 py-0.5 rounded-md bg-[#F5F3FF] text-[#5B21B6] font-bold":""}>⭐ {q.rating}</span>)}</Row>
            <Row label="Docs">{quotes.map(q => <span key={q.id}>{q.documents} attached</span>)}</Row>
            {scored && <Row label="AI Score">{quotes.map((q,i) => { const s = scores.find(x=>x.id===q.id)!.score; return (
              <div key={q.id}><div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-primary" style={{width:`${s}%`}}/></div><p className="mt-1 text-xs font-bold text-heading">{s}/100</p></div>
            );})}</Row>}
            <Row label="Risk">{quotes.map(q => (
              <div key={q.id}>{risk[q.id] === undefined && <button onClick={()=>runRisk(q.id)} className="text-xs font-semibold text-primary hover:underline">Check Risk</button>}{risk[q.id] === null && <Loader2 className="h-4 w-4 animate-spin text-mute"/>}{risk[q.id] && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{background:risk[q.id]==="LOW"?"#ECFDF5":risk[q.id]==="MEDIUM"?"#FFFBEB":"#FFF1F2",color:risk[q.id]==="LOW"?"#065F46":risk[q.id]==="MEDIUM"?"#92400E":"#9F1239"}}>{risk[q.id]}</span>}</div>
            ))}</Row>
          </tbody>
        </table>
      </div>

      {scored && recommended && (
        <div className="mb-6 rounded-2xl border bg-gradient-soft p-6 shadow-card animate-fade-in-up" style={{borderColor:"#635BFF"}}>
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-1"/>
            <div>
              <p className="label-tiny text-primary">AI Recommendation</p>
              <p className="mt-1 text-base font-bold text-heading">{recommended.vendorName} — Best balance of price, delivery, and rating.</p>
              <p className="mt-1 text-xs text-body">₹{recommended.totalAmount.toLocaleString("en-IN")} · {recommended.deliveryDays} days · ⭐ {recommended.rating}</p>
              <p className="mt-3 text-[11px] text-mute italic">AI suggestion for decision support only. Final decision is yours.</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <h3 className="text-sm font-semibold text-heading mb-4">Your Decision</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label-tiny mb-2 block">Select Vendor</label>
            <div className="space-y-2">{quotes.map(q => (
              <label key={q.id} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer ${selected===q.id?"border-primary bg-accent":""}`}>
                <input type="radio" checked={selected===q.id} onChange={()=>setSelected(q.id)} />
                <span className="text-sm font-semibold text-heading flex-1">{q.vendorName}</span>
                <span className="text-xs text-body">₹{q.totalAmount.toLocaleString("en-IN")}</span>
              </label>
            ))}</div>
          </div>
          <div><label className="label-tiny mb-2 block">Decision</label>
            <select value={decision} onChange={e=>setDecision(e.target.value)} className="h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]">
              <option value="">— Select —</option><option>Approve</option><option>Escalate to Head</option><option>Return for Re-evaluation</option>
            </select>
            <label className="label-tiny mb-2 mt-4 block">Notes</label>
            <textarea rows={3} className="w-full rounded-lg border bg-white p-3 text-sm" placeholder="Optional notes…" />
            <button onClick={submit} className="mt-4 h-10 w-full rounded-lg bg-gradient-primary text-xs font-semibold text-white shadow-card">Confirm Decision</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({label, children}: {label:string;children:React.ReactNode[]}) {
  return <tr className="border-t hover:bg-page"><td className="px-4 py-3 font-semibold text-mute text-xs uppercase tracking-wide">{label}</td>{children.map((c,i)=><td key={i} className="px-4 py-3 text-sm text-heading">{c}</td>)}</tr>;
}
