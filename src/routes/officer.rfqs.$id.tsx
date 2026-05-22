import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { rfqs, quotations } from "@/lib/mock-data";

export const Route = createFileRoute("/officer/rfqs/$id")({ component: () => {
  const { id } = useParams({ from: "/officer/rfqs/$id" });
  const rfq = rfqs.find(r => r.id === id) ?? rfqs[0];
  const quotes = quotations.filter(q => q.rfqId === rfq.id);
  return (
    <div>
      <Link to="/officer/rfqs" className="text-xs font-semibold text-primary hover:underline">← Back to RFQs</Link>
      <PageHeader eyebrow={rfq.id} title={rfq.title} subtitle={rfq.description} actions={<StatusBadge status={rfq.status} />} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card shadow-card overflow-hidden">
          <div className="border-b p-5"><h3 className="text-sm font-semibold text-heading">Vendor Responses ({quotes.length})</h3></div>
          <table className="w-full text-sm"><thead><tr className="text-left label-tiny bg-page"><th className="px-5 py-3">Vendor</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Delivery</th><th className="px-5 py-3">Rating</th><th className="px-5 py-3">Status</th></tr></thead>
          <tbody>{quotes.map((q,i) => (
            <tr key={q.id} className={`border-t hover:bg-[#F0F4F8] ${i%2===0?"bg-page/40":""}`}>
              <td className="px-5 py-3 font-semibold text-heading">{q.vendorName}</td><td className="px-5 py-3 font-semibold">₹{q.totalAmount.toLocaleString("en-IN")}</td><td className="px-5 py-3 text-body">{q.deliveryDays} days</td><td className="px-5 py-3 text-body">⭐ {q.rating}</td><td className="px-5 py-3"><StatusBadge status={q.status}/></td>
            </tr>
          ))}</tbody></table>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold text-heading mb-4">RFQ Summary</h3>
          <dl className="space-y-3 text-sm">{[["Category",rfq.category],["Type",rfq.type],["Quantity",`${rfq.quantity} ${rfq.unit}`],["Location",rfq.location],["Deadline",rfq.deadline]].map(([k,v]) => (
            <div key={k}><p className="label-tiny">{k}</p><p className="mt-0.5 font-semibold text-heading">{v}</p></div>
          ))}</dl>
        </div>
      </div>
    </div>
  );
}});
