import { createFileRoute, Link } from "@tanstack/react-router";
import { Files, FileCheck, Clock, CheckCircle2, FilePlus2, Search, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/KPICard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { rfqs } from "@/lib/mock-data";

export const Route = createFileRoute("/officer/dashboard")({ component: Dash });

function Dash() {
  return (
    <div>
      <PageHeader eyebrow="Procurement Officer" title="Procurement Overview" subtitle="Active requests, vendor responses, and pending decisions." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard icon={Files} label="Active RFQs" value="12" trend="+2 this week" tone="blue" />
        <KPICard icon={FileCheck} label="Quotes Received" value="47" trend="+8 today" tone="violet" />
        <KPICard icon={Clock} label="Pending Decisions" value="6" trend="3 high priority" tone="amber" />
        <KPICard icon={CheckCircle2} label="Completed" value="158" trend="₹8.4Cr value" tone="green" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {[
          { to: "/officer/rfqs/create", icon: FilePlus2, label: "Create Manual RFQ" },
          { to: "/officer/rfqs/create", icon: Sparkles, label: "Generate with AI" },
          { to: "/officer/vendors", icon: Search, label: "Search Vendors" },
        ].map((a) => (
          <Link key={a.label} to={a.to} className="rounded-2xl border bg-card p-5 shadow-card transition hover:shadow-card-hover">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent"><a.icon className="h-5 w-5 text-primary" /></div>
            <p className="mt-4 text-sm font-semibold text-heading">{a.label}</p>
          </Link>
        ))}
      </div>
      <div className="rounded-2xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b p-5"><h3 className="text-sm font-semibold text-heading">My Recent RFQs</h3><Link to="/officer/rfqs" className="text-xs font-semibold text-primary hover:underline">View all →</Link></div>
        <table className="w-full text-sm">
          <thead><tr className="text-left label-tiny"><th className="px-5 py-2.5">RFQ</th><th className="px-5 py-2.5">Type</th><th className="px-5 py-2.5">Quotes</th><th className="px-5 py-2.5">Deadline</th><th className="px-5 py-2.5">Status</th></tr></thead>
          <tbody>{rfqs.slice(0,5).map((r,i) => (
            <tr key={r.id} className={`border-t hover:bg-[#F0F4F8] ${i%2===0 ? "bg-page/40" : ""}`}>
              <td className="px-5 py-3"><Link to="/officer/rfqs/$id" params={{id: r.id}} className="font-semibold text-heading hover:text-primary">{r.title}</Link><p className="text-xs text-mute">{r.id}</p></td>
              <td className="px-5 py-3 text-body">{r.type}</td><td className="px-5 py-3 font-semibold text-heading">{r.quotesReceived}</td><td className="px-5 py-3 text-body">{r.deadline}</td><td className="px-5 py-3"><StatusBadge status={r.status} /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
