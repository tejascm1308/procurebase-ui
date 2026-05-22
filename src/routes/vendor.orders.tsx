import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { orders } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/orders")({ component: VendorOrders });

function VendorOrders() {
  const [tab, setTab] = useState<"active" | "completed">("active");
  const list = tab === "active" ? orders.filter((o) => o.status !== "DELIVERED") : orders.filter((o) => o.status === "DELIVERED");
  return (
    <div>
      <PageHeader title="Orders" subtitle="Track active and completed purchase orders." />
      <div className="mb-5 flex gap-1 rounded-lg border bg-card p-1 w-fit shadow-card">
        {[["active","Active"],["completed","Completed"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k as any)} className={`rounded-md px-4 py-1.5 text-xs font-semibold ${tab === k ? "bg-gradient-primary text-white" : "text-body"}`}>{l}</button>
        ))}
      </div>
      <div className="space-y-3">
        {list.map((o) => (
          <div key={o.id} className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs text-mute">{o.poNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <h3 className="text-base font-semibold text-heading">{o.itemSummary}</h3>
                <p className="mt-1 text-xs text-body">{o.organization} • Deliver by {o.deliveryDeadline}</p>
                <p className="mt-2 text-lg font-bold text-heading">₹{o.amount.toLocaleString("en-IN")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {o.status === "ISSUED" && <button onClick={() => toast.success("Order moved to In Progress")} className="h-9 rounded-lg bg-gradient-primary px-3 text-xs font-semibold text-white shadow-card">Mark In Progress</button>}
                {o.status === "IN_PROGRESS" && <button onClick={() => toast.success("Order marked dispatched")} className="h-9 rounded-lg bg-gradient-primary px-3 text-xs font-semibold text-white shadow-card">Mark Dispatched</button>}
                {o.status === "DISPATCHED" && <button onClick={() => toast.success("Order marked delivered")} className="h-9 rounded-lg bg-gradient-primary px-3 text-xs font-semibold text-white shadow-card">Mark Delivered</button>}
                <button onClick={() => toast.success("Invoice uploaded")} className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-card px-3 text-xs font-semibold text-heading hover:bg-secondary"><Upload className="h-3.5 w-3.5" /> Upload Invoice</button>
                <Link to="/vendor/orders/$id" params={{ id: o.id }} className="inline-flex h-9 items-center rounded-lg border bg-card px-3 text-xs font-semibold text-heading hover:bg-secondary">View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
