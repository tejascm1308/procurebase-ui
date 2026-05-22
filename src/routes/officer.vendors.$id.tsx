import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { vendors } from "@/lib/mock-data";
import { BadgeCheck, ShieldOff, Star } from "lucide-react";

export const Route = createFileRoute("/officer/vendors/$id")({ component: () => {
  const { id } = useParams({ from: "/officer/vendors/$id" });
  const v = vendors.find(x => x.id === id) ?? vendors[0];
  return (
    <div>
      <Link to="/officer/vendors" className="text-xs font-semibold text-primary hover:underline">← Back to vendors</Link>
      <PageHeader eyebrow={v.id} title={v.name} subtitle={v.location} actions={<><StatusBadge status={v.status}/><button className="h-10 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card">Request Quotation</button></>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {[
            { t: "Business Identity", items: [["Legal Name", v.name], ["Categories", v.categories.join(", ")], ["Completed Orders", v.completedOrders.toString()]] },
            { t: "Tax & Legal", items: [["GSTIN", v.gstin], ["PAN", "XXXXXX" + v.pan.slice(-4)]] },
            { t: "Contact", items: [["Email", v.email], ["Location", v.location]] },
          ].map(s => (
            <div key={s.t} className="rounded-2xl border bg-card p-6 shadow-card">
              <h3 className="text-sm font-semibold text-heading mb-4">{s.t}</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">{s.items.map(([k,val]) => <div key={k}><p className="label-tiny">{k}</p><p className="mt-1 font-semibold text-heading">{val}</p></div>)}</dl>
            </div>
          ))}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold text-heading mb-2 flex items-center gap-2"><ShieldOff className="h-4 w-4 text-mute"/> Bank Details</h3>
            <p className="text-xs text-mute">Restricted — bank details are not visible to organizations.</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold text-heading mb-3">Rating & Reviews</h3>
          <div className="flex items-center gap-3 mb-4"><p className="text-4xl font-extrabold text-heading">{v.rating}</p><Star className="h-6 w-6 fill-[#F59E0B] text-[#F59E0B]" /></div>
          <p className="text-xs text-mute mb-4">{v.reviews} reviews · {v.verified ? <span className="text-[#0E9F6E] font-semibold inline-flex items-center gap-1"><BadgeCheck className="h-3 w-3"/> Verified</span> : "Unverified"}</p>
          <div className="space-y-3">
            {[["Tech Corp India","Excellent quality and on-time delivery.","5"],["Globex Industries","Great vendor, responsive support.","4"]].map(([o,r,s],i) => (
              <div key={i} className="rounded-lg border bg-page p-3"><p className="text-xs font-semibold text-heading">{o}</p><p className="text-[10px] text-[#F59E0B]">{"★".repeat(Number(s))}</p><p className="mt-1 text-xs text-body">{r}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}});
