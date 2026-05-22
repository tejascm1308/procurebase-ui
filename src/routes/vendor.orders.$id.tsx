import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { orders } from "@/lib/mock-data";
import { Check, Clock } from "lucide-react";

export const Route = createFileRoute("/vendor/orders/$id")({ component: OrderDetail });

function OrderDetail() {
  const { id } = useParams({ from: "/vendor/orders/$id" });
  const o = orders.find((x) => x.id === id) ?? orders[0];
  const stages = ["ISSUED", "IN_PROGRESS", "DISPATCHED", "DELIVERED"];
  const idx = stages.indexOf(o.status);
  return (
    <div>
      <Link to="/vendor/orders" className="text-xs font-semibold text-primary hover:underline">← Back to orders</Link>
      <PageHeader eyebrow={o.poNumber} title={o.itemSummary} actions={<StatusBadge status={o.status} />} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold text-heading mb-4">Order Details</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[["PO Number", o.poNumber],["Organization", o.organization],["Issued", o.issuedAt],["Delivery Deadline", o.deliveryDeadline],["Amount", `₹${o.amount.toLocaleString("en-IN")}`],["Linked RFQ", o.rfqId]].map(([k,v]) => (
                <div key={k}><p className="label-tiny">{k}</p><p className="mt-1 text-sm font-semibold text-heading">{v}</p></div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold text-heading mb-4">Delivery Timeline</h3>
            <ol className="space-y-4">
              {stages.map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ${i <= idx ? "bg-[#ECFDF5] text-[#0E9F6E]" : "bg-secondary text-mute"}`}>
                    {i <= idx ? <Check className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                  </div>
                  <div><p className="text-sm font-semibold text-heading">{s.replaceAll("_"," ")}</p><p className="text-xs text-mute">{i <= idx ? "Completed" : "Pending"}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold text-heading mb-4">Invoices</h3>
          <p className="text-xs text-mute">No invoices uploaded yet.</p>
          <button className="mt-4 w-full h-10 rounded-lg bg-gradient-primary text-xs font-semibold text-white">Upload Invoice</button>
        </div>
      </div>
    </div>
  );
}
