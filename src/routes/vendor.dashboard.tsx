import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox, FileText, Package, CheckCircle2, Star, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/KPICard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { rfqs, quotations } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/dashboard")({ component: VendorDashboard });

function VendorDashboard() {
  return (
    <div>
      <PageHeader eyebrow="Vendor" title="Welcome back, Rajesh" subtitle="Here's what's happening across your active business." />

      {/* Status banner */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-card" style={{ borderColor: "#FCD34D" }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "#FFFBEB" }}>
          <AlertTriangle className="h-4.5 w-4.5" style={{ color: "#D97706" }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-heading">Profile Status: PENDING_APPROVAL</p>
          <p className="text-xs text-body mt-0.5">Your profile is under review by the platform team. We typically respond within 2 business days.</p>
        </div>
        <Link to="/vendor/profile" className="rounded-lg border bg-card px-3 py-1.5 text-xs font-semibold text-heading hover:bg-secondary">View Profile</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard icon={Inbox} label="New RFQs" value="7" trend="+2 today" tone="blue" />
        <KPICard icon={FileText} label="Pending Quotes" value="3" trend="2 due this week" tone="amber" />
        <KPICard icon={Package} label="Active Orders" value="4" trend="₹14.2L value" tone="violet" />
        <KPICard icon={CheckCircle2} label="Completed Orders" value="87" trend="+5 this month" tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <p className="label-tiny">Average Rating</p>
          <div className="mt-4 flex items-center gap-3">
            <p className="text-4xl font-extrabold text-heading">4.7</p>
            <Star className="h-7 w-7 fill-[#F59E0B] text-[#F59E0B]" />
          </div>
          <p className="mt-1 text-xs text-mute">from 124 reviews</p>
          <div className="mt-4 space-y-1.5">
            {[5,4,3,2,1].map((s, i) => {
              const pcts = [78, 16, 4, 1, 1];
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-mute">{s}★</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full" style={{ width: `${pcts[i]}%`, background: "#635BFF" }} />
                  </div>
                  <span className="w-8 text-right text-mute">{pcts[i]}%</span>
                </div>
              );
            })}
          </div>
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
              {rfqs.slice(0, 4).map((r, i) => (
                <tr key={r.id} className={`border-t hover:bg-[#F0F4F8] ${i % 2 === 0 ? "bg-page/40" : ""}`}>
                  <td className="px-5 py-3">
                    <Link to="/vendor/rfqs/$id" params={{ id: r.id }} className="font-semibold text-heading hover:text-primary">{r.title}</Link>
                    <p className="text-xs text-mute">{r.id}</p>
                  </td>
                  <td className="px-5 py-3 text-body">{r.type}</td>
                  <td className="px-5 py-3 text-body">{r.deadline}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
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
            {quotations.map((q, i) => (
              <tr key={q.id} className={`border-t hover:bg-[#F0F4F8] ${i % 2 === 0 ? "bg-page/40" : ""}`}>
                <td className="px-5 py-3 font-mono text-xs text-body">{q.id}</td>
                <td className="px-5 py-3 text-heading font-medium">{q.rfqTitle}</td>
                <td className="px-5 py-3 text-body">{q.submittedAt}</td>
                <td className="px-5 py-3 font-semibold text-heading">₹{q.totalAmount.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3"><StatusBadge status={q.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
