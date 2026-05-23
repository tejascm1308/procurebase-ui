import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox, FileText, Package, CheckCircle2, Star, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/KPICard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useRFQs, useMyQuotations, useMyOrders, useMyVendorProfile } from "@/lib/queries";
import type { PurchaseOrder, Quotation, RFQ } from "@/lib/types";

export const Route = createFileRoute("/vendor/dashboard")({ component: VendorDashboard });

function VendorDashboard() {
  const { data: profile }            = useMyVendorProfile();
  const { data: rfqs = [] }   = useRFQs();
  const { data: quotes = [] } = useMyQuotations();
  const { data: orders = [] } = useMyOrders();

  const activeOrders    = (orders as PurchaseOrder[]).filter((o) => o.status !== "delivered");
  const completedOrders = (orders as PurchaseOrder[]).filter((o) => o.status === "delivered");
  const pendingQuotes   = (quotes as Quotation[]).filter((q) => q.status === "submitted");
  const newRfqs         = (rfqs as RFQ[]).filter((r) => r.status === "sent" || r.status === "open");

  const status = profile?.status ?? "registered";
  const isVerified = status === "verified";

  return (
    <div>
      <PageHeader eyebrow="Vendor" title={`Welcome back, ${profile?.legal_name?.split(" ")[0] ?? "there"}`} subtitle="Here's what's happening across your active business." />

      {!isVerified && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-card" style={{ borderColor: "#FCD34D" }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "#FFFBEB" }}>
            <AlertTriangle className="h-4.5 w-4.5" style={{ color: "#D97706" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-heading">Profile Status: {status.toUpperCase()}</p>
            <p className="text-xs text-body mt-0.5">
              {status === "pending_approval" ? "Your profile is under review. We typically respond within 2 business days." : "Please complete your profile to start receiving RFQs."}
            </p>
          </div>
          <Link to="/vendor/profile" className="rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold text-heading hover:bg-secondary">View Profile</Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard icon={Inbox}        label="New RFQs"         value={String(newRfqs.length)}        trend="Available now"     tone="blue" />
        <KPICard icon={FileText}     label="Pending Quotes"   value={String(pendingQuotes.length)}  trend="Awaiting response" tone="amber" />
        <KPICard icon={Package}      label="Active Orders"    value={String(activeOrders.length)}   trend="In progress"       tone="violet" />
        <KPICard icon={CheckCircle2} label="Completed Orders" value={String(completedOrders.length)} trend="Total delivered"  tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <p className="label-tiny">Average Rating</p>
          <div className="mt-4 flex items-center gap-3">
            <p className="text-4xl font-extrabold text-heading">{profile?.avg_rating?.toFixed(1) ?? "–"}</p>
            <Star className="h-7 w-7 fill-[#F59E0B] text-[#F59E0B]" />
          </div>
          <p className="mt-1 text-xs text-mute">from {profile?.total_ratings ?? 0} reviews</p>
        </div>

        <div className="lg:col-span-2 rounded-2xl border bg-card shadow-card">
          <div className="flex items-center justify-between border-b p-5">
            <h3 className="text-sm font-semibold text-heading">Recent RFQs</h3>
            <Link to="/vendor/rfqs" className="text-xs font-semibold text-primary hover:underline">View all →</Link>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left label-tiny">
              <th className="px-5 py-2.5">RFQ</th><th className="px-5 py-2.5">Type</th><th className="px-5 py-2.5">Deadline</th><th className="px-5 py-2.5">Status</th>
            </tr></thead>
            <tbody>
              {(rfqs as RFQ[]).slice(0, 4).map((r, i) => (
                <tr key={r.id} className={`border-t hover:bg-[#F0F4F8] ${i % 2 === 0 ? "bg-page/40" : ""}`}>
                  <td className="px-5 py-3">
                    <Link to="/vendor/rfqs/$id" params={{ id: r.id }} className="font-semibold text-heading hover:text-primary">{r.title}</Link>
                    <p className="text-xs text-mute">{r.id.slice(0, 8)}…</p>
                  </td>
                  <td className="px-5 py-3 text-body">{r.distribution_type}</td>
                  <td className="px-5 py-3 text-body">{r.submission_deadline}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status.toUpperCase()} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b p-5">
          <h3 className="text-sm font-semibold text-heading">Recent Quotations</h3>
          <Link to="/vendor/quotations" className="text-xs font-semibold text-primary hover:underline">View all →</Link>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left label-tiny">
            <th className="px-5 py-2.5">Quote ID</th><th className="px-5 py-2.5">RFQ</th><th className="px-5 py-2.5">Submitted</th><th className="px-5 py-2.5">Amount</th><th className="px-5 py-2.5">Status</th>
          </tr></thead>
          <tbody>
            {(quotes as Quotation[]).slice(0, 4).map((q, i) => (
              <tr key={q.id} className={`border-t hover:bg-[#F0F4F8] ${i % 2 === 0 ? "bg-page/40" : ""}`}>
                <td className="px-5 py-3 font-mono text-xs text-body">{q.id.slice(0, 8)}…</td>
                <td className="px-5 py-3 text-heading font-medium">{q.rfqs?.title ?? "—"}</td>
                <td className="px-5 py-3 text-body">{q.created_at.slice(0, 10)}</td>
                <td className="px-5 py-3 font-semibold text-heading">₹{q.total_amount.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3"><StatusBadge status={q.status.toUpperCase()} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
