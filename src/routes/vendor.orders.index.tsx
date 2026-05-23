import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useMyOrders, useUpdateOrderStatus } from "@/lib/queries";
import { Package } from "lucide-react";
import type { PurchaseOrder } from "@/lib/types";

export const Route = createFileRoute("/vendor/orders/")({ component: VendorOrders });

const STATUS_FLOW: Record<string, string> = {
  issued: "in_progress", in_progress: "dispatched", dispatched: "delivered",
};

function VendorOrders() {
  const { data: orders = [], isLoading } = useMyOrders();
  const updateMutation = useUpdateOrderStatus();

  const advance = async (po: PurchaseOrder) => {
    const next = STATUS_FLOW[po.status];
    if (next) await updateMutation.mutateAsync({ poId: po.id, new_status: next });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div>
      <PageHeader title="My Orders" subtitle="Track purchase orders and update fulfillment status." />
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border bg-card">
          <Package className="h-10 w-10 text-mute mb-3" />
          <p className="text-sm font-semibold text-heading">No orders yet</p>
          <p className="text-xs text-mute mt-1">When your quotation is approved, you'll see the purchase order here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(orders as PurchaseOrder[]).map((o) => (
            <div key={o.id} className="rounded-2xl border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-heading">{o.po_number}</p>
                  <p className="text-sm text-body mt-0.5">{o.rfqs?.title ?? "—"}</p>
                  <p className="text-xs text-mute mt-0.5">Issued by: {o.organizations?.name}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={o.status.toUpperCase()} />
                  <p className="text-sm font-bold text-heading mt-1">₹{o.total_amount.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="text-xs text-mute mb-3">Delivery by: <b>{o.delivery_deadline}</b></div>
              <div className="flex gap-2">
                {STATUS_FLOW[o.status] && (
                  <button onClick={() => advance(o)} disabled={updateMutation.isPending}
                    className="h-9 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card disabled:opacity-60">
                    Mark as {STATUS_FLOW[o.status].replace("_", " ")}
                  </button>
                )}
                <Link to="/vendor/orders/$id" params={{ id: o.id }} className="h-9 rounded-lg border bg-white px-3 text-xs font-semibold text-heading hover:bg-secondary flex items-center">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
