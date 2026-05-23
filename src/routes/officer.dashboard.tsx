import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/KPICard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { CheckCircle2, Clock, FileText, ShoppingBag } from "lucide-react";
import { useOrgOrders, useRFQs } from "@/lib/queries";
import type { PurchaseOrder, RFQ } from "@/lib/types";

export const Route = createFileRoute("/officer/dashboard")({ component: OfficerDashboard });

function OfficerDashboard() {
  const navigate = useNavigate();
  const { data: orders = [] } = useOrgOrders();
  const { data: rfqs = [] }   = useRFQs();

  const activeOrders    = (orders as PurchaseOrder[]).filter(o => o.status !== "delivered" && o.status !== "cancelled");
  const completedOrders = (orders as PurchaseOrder[]).filter(o => o.status === "delivered");
  const draftRFQs       = (rfqs as RFQ[]).filter(r => r.status === "draft");
  const sentRFQs        = (rfqs as RFQ[]).filter(r => r.status === "sent" || r.status === "under_review");

  return (
    <div>
      <PageHeader eyebrow="Officer" title="Procurement Overview" subtitle="Track your RFQs and active purchase orders." />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard icon={FileText}     label="Active RFQs"    value={String(sentRFQs.length)}        trend="Awaiting quotes"  tone="violet" />
        <KPICard icon={FileText}     label="Drafts"         value={String(draftRFQs.length)}       trend="Not sent yet"     tone="amber" />
        <KPICard icon={Clock}        label="Active Orders"  value={String(activeOrders.length)}    trend="In progress"      tone="blue" />
        <KPICard icon={CheckCircle2} label="Completed"      value={String(completedOrders.length)} trend="Delivered"        tone="green" />
      </div>

      {/* Recent Purchase Orders */}
      <div className="rounded-2xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b p-5">
          <h3 className="text-sm font-semibold text-heading">Recent Purchase Orders</h3>
          <Link to="/officer/rfqs" className="text-xs font-semibold text-primary hover:underline">View all RFQs →</Link>
        </div>
        {(orders as PurchaseOrder[]).length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <ShoppingBag className="h-8 w-8 text-mute mb-3" />
            <p className="text-sm font-semibold text-heading">No orders yet</p>
            <p className="text-xs text-mute mt-1 mb-4">Once a quote is approved, a purchase order will appear here.</p>
            <button onClick={() => navigate({ to: "/officer/rfqs/create" })}
              className="inline-flex h-9 items-center rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90">
              Create your first RFQ →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b label-tiny text-left bg-[#F8FAFC]">
              <th className="px-5 py-3">PO Number</th>
              <th className="px-5 py-3">Vendor</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Deadline</th>
              <th className="px-5 py-3">Status</th>
            </tr></thead>
            <tbody>
              {(orders as PurchaseOrder[]).slice(0, 8).map(o => (
                <tr key={o.id} className="border-t hover:bg-[#F0F4F8]">
                  <td className="px-5 py-3 font-mono text-xs text-heading">{o.po_number}</td>
                  <td className="px-5 py-3 font-semibold text-heading">{(o as any).vendors?.legal_name ?? "—"}</td>
                  <td className="px-5 py-3 text-body">₹{o.total_amount?.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-body">{o.delivery_deadline}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status.toUpperCase()} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
