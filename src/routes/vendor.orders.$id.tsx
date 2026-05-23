import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useMyOrder, useUpdateOrderStatus, useUploadInvoice } from "@/lib/queries";
import { useRef } from "react";

export const Route = createFileRoute("/vendor/orders/$id")({ component: OrderDetail });

const STATUS_FLOW: Record<string, string> = {
  issued: "in_progress", in_progress: "dispatched", dispatched: "delivered",
};

function OrderDetail() {
  const { id } = useParams({ from: "/vendor/orders/$id" });
  const { data: order, isLoading } = useMyOrder(id);
  const updateMutation  = useUpdateOrderStatus();
  const invoiceMutation = useUploadInvoice();
  const fileRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!order) return <p className="text-sm text-mute p-8">Order not found.</p>;

  const advance = async () => {
    const next = STATUS_FLOW[order.status];
    if (next) await updateMutation.mutateAsync({ poId: id, new_status: next });
  };

  const uploadInvoice = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    await invoiceMutation.mutateAsync({ poId: id, form });
  };

  return (
    <div>
      <Link to="/vendor/orders" className="text-xs font-semibold text-primary hover:underline">← Back to Orders</Link>
      <PageHeader eyebrow={order.po_number} title={order.rfqs?.title ?? "Purchase Order"} subtitle={`From: ${order.organizations?.name}`}
        actions={<><StatusBadge status={order.status?.toUpperCase()} />
          {STATUS_FLOW[order.status] && (
            <button onClick={advance} disabled={updateMutation.isPending} className="h-10 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90 disabled:opacity-60">
              Mark as {STATUS_FLOW[order.status]?.replace("_", " ")}
            </button>
          )}
        </>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold text-heading mb-4">Order Details</h3>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ["PO Number", order.po_number], ["Total Amount", `₹${order.total_amount?.toLocaleString("en-IN")}`],
                ["Delivery Deadline", order.delivery_deadline], ["Status", order.status],
                ["Unit Price", `₹${order.quotations?.unit_price?.toLocaleString("en-IN")}`],
                ["Quantity", order.quotations?.quantity],
              ].map(([k, v]) => (
                <div key={k as string}><p className="label-tiny">{k}</p><p className="mt-1 font-semibold text-heading">{v}</p></div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="text-sm font-semibold text-heading mb-4">Invoices</h3>
            {(order.invoices || []).length === 0 && <p className="text-xs text-mute">No invoices uploaded yet.</p>}
            {(order.invoices || []).map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b">
                <p className="text-sm text-heading">{inv.file_name}</p>
                {inv.signed_url && <a href={inv.signed_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline">View</a>}
              </div>
            ))}
            <div className="mt-4">
              <input ref={fileRef} type="file" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadInvoice(e.target.files[0])} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={invoiceMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-secondary py-3 text-xs font-semibold text-mute hover:border-primary hover:bg-accent/30 hover:text-primary transition disabled:opacity-60">
                {invoiceMutation.isPending
                  ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> Uploading…</>
                  : <>📎 Upload Invoice <span className="font-normal text-mute/70">(PDF, Word, Image — any type)</span></>}
              </button>
            </div>
          </div>
        </div>
        <aside>
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <p className="label-tiny">Buyer Organization</p>
            <p className="font-semibold text-heading mt-2">{order.organizations?.name}</p>
            <p className="text-xs text-mute mt-0.5">{order.organizations?.email}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
