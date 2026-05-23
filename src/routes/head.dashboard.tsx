import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/KPICard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { AlertTriangle, CheckCircle2, Clock, Users2, Star, Building2, ArrowRight } from "lucide-react";
import { usePendingApprovals, useEscalations, useOrgOrders, useTeam, useRFQs, useOrgProfile } from "@/lib/queries";
import type { PurchaseOrder, RFQ, TeamMember } from "@/lib/types";

export const Route = createFileRoute("/head/dashboard")({ component: HeadDashboard });

function HeadDashboard() {
  const { data: pending = [] }     = usePendingApprovals();
  const { data: escalations = [] } = useEscalations();
  const { data: orders = [] }      = useOrgOrders();
  const { data: team = [] }        = useTeam();
  const { data: rfqs = [] }        = useRFQs();
  const { data: org }              = useOrgProfile();

  const activeOrders    = (orders as PurchaseOrder[]).filter(o => o.status !== "delivered" && o.status !== "cancelled");
  const completedOrders = (orders as PurchaseOrder[]).filter(o => o.status === "delivered");
  const approvers       = (team as TeamMember[]).filter(m => m.role === "approver").length;
  const officers        = (team as TeamMember[]).filter(m => m.role === "officer").length;
  const auditors        = (team as TeamMember[]).filter(m => m.role === "auditor").length;

  // Vendors involved in our procurement — deduplicated from orders
  const vendorMap = new Map<string, { name: string; rating: number; latestStatus: string; ordersCount: number }>();
  (orders as PurchaseOrder[]).forEach(o => {
    if (!o.vendor_id) return;
    const vName   = (o as any).vendors?.legal_name ?? "Unknown Vendor";
    const vRating = (o as any).vendors?.avg_rating  ?? 0;
    if (!vendorMap.has(o.vendor_id)) {
      vendorMap.set(o.vendor_id, { name: vName, rating: vRating, latestStatus: o.status, ordersCount: 1 });
    } else {
      const ex = vendorMap.get(o.vendor_id)!;
      ex.ordersCount += 1;
      if (["in_progress", "dispatched", "issued"].includes(o.status)) ex.latestStatus = o.status;
    }
  });
  const procurementVendors = Array.from(vendorMap.entries());

  return (
    <div>
      <PageHeader eyebrow="Procurement Head" title={`${org?.name || "Your"} Overview`} subtitle="Monitor your team, RFQs, approvals, and purchase orders." />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard icon={AlertTriangle}  label="Pending Approvals" value={String((pending as RFQ[]).length)}     trend="Awaiting decision" tone="amber" />
        <KPICard icon={AlertTriangle}  label="Escalations"       value={String((escalations as RFQ[]).length)} trend="Need your review"  tone="violet" />
        <KPICard icon={Clock}          label="Active Orders"      value={String(activeOrders.length)}           trend="In progress"       tone="blue" />
        <KPICard icon={CheckCircle2}   label="Completed Orders"   value={String(completedOrders.length)}        trend="Delivered"         tone="green" />
      </div>

      {/* 3-column summary row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">

        {/* Team — simplified: count + role breakdown only */}
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-heading">Team</h3>
            <Link to="/head/team" className="text-xs font-semibold text-primary hover:underline">Manage →</Link>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <Users2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-heading">{(team as TeamMember[]).length}</p>
              <p className="text-xs text-mute">Members</p>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            {([ ["Approvers", approvers, "#635BFF"], ["Officers", officers, "#0570DE"], ["Auditors", auditors, "#0E9F6E"] ] as [string, number, string][]).map(([label, count, color]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-body">{label}</span>
                <span className="font-bold" style={{ color }}>{count}</span>
              </div>
            ))}
          </div>
          {(team as TeamMember[]).length === 0 && (
            <p className="mt-3 text-xs text-mute">No members yet. <Link to="/head/team" className="text-primary hover:underline">Add members →</Link></p>
          )}
        </div>

        {/* RFQs */}
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-heading">RFQs</h3>
            <Link to="/head/rfqs" className="text-xs font-semibold text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {(rfqs as RFQ[]).slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between text-xs border-b pb-2">
                <span className="font-semibold text-heading truncate max-w-[160px]">{r.title}</span>
                <StatusBadge status={r.status?.toUpperCase()} />
              </div>
            ))}
            {(rfqs as RFQ[]).length === 0 && <p className="text-xs text-mute">No RFQs yet.</p>}
          </div>
        </div>

        {/* Escalations */}
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-heading">Escalations</h3>
            <Link to="/head/escalations" className="text-xs font-semibold text-primary hover:underline">View all →</Link>
          </div>
          {(escalations as RFQ[]).length === 0
            ? <p className="text-xs text-mute mt-4">No escalations pending. 🎉</p>
            : (escalations as RFQ[]).slice(0, 5).map(e => (
              <div key={e.id} className="flex items-center justify-between text-xs border-b pb-2 mb-2">
                <span className="font-semibold text-heading truncate max-w-[160px]">{e.title}</span>
                <StatusBadge status="ESCALATED" />
              </div>
            ))
          }
        </div>
      </div>

      {/* Vendors in Procurement */}
      <div className="rounded-2xl border bg-card shadow-card mb-6">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h3 className="text-sm font-semibold text-heading">Vendors in Your Procurement</h3>
            <p className="text-xs text-mute mt-0.5">Only vendors with active or completed orders in your organization</p>
          </div>
          <Link to="/head/vendors" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {procurementVendors.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Building2 className="h-8 w-8 text-mute mb-2" />
            <p className="text-sm font-semibold text-heading">No vendors engaged yet</p>
            <p className="text-xs text-mute mt-1">Once your officers approve quotes and issue POs, vendors will appear here.</p>
          </div>
        ) : (
          <div className="divide-y">
            {procurementVendors.slice(0, 6).map(([vid, v]) => (
              <div key={vid} className="flex items-center gap-4 px-5 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#635BFF] to-[#0570DE] text-xs font-bold text-white">
                  {v.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-heading truncate">{v.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-mute">{v.rating?.toFixed(1) ?? "—"} · {v.ordersCount} order{v.ordersCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <StatusBadge status={v.latestStatus?.toUpperCase()} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent purchase orders */}
      <div className="rounded-2xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b p-5">
          <h3 className="text-sm font-semibold text-heading">Recent Purchase Orders</h3>
        </div>
        {(orders as PurchaseOrder[]).length === 0 ? (
          <p className="p-8 text-sm text-mute text-center">No purchase orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b label-tiny text-left">
              <th className="px-5 py-3">PO Number</th><th className="px-5 py-3">Vendor</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th>
            </tr></thead>
            <tbody>
              {(orders as PurchaseOrder[]).slice(0, 8).map(o => (
                <tr key={o.id} className="border-t hover:bg-[#F0F4F8]">
                  <td className="px-5 py-3 font-mono text-xs text-heading">{o.po_number}</td>
                  <td className="px-5 py-3 font-semibold text-heading">{(o as any).vendors?.legal_name ?? "—"}</td>
                  <td className="px-5 py-3 text-body">₹{o.total_amount?.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status?.toUpperCase()} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
