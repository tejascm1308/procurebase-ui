import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCheck, Clock, AlertOctagon, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { KPICard } from "@/components/app/KPICard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { rfqs } from "@/lib/mock-data";

export const Route = createFileRoute("/approver/dashboard")({ component: () => (
  <div>
    <PageHeader eyebrow="Approver" title="Approval Center" subtitle="Pending decisions across all RFQs assigned to you." />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <KPICard icon={ClipboardCheck} label="Pending" value="6" tone="amber" />
      <KPICard icon={Clock} label="Avg Decision Time" value="1.2d" tone="blue" />
      <KPICard icon={AlertOctagon} label="Escalated" value="2" tone="rose" />
      <KPICard icon={CheckCircle2} label="Decisions (30d)" value="42" tone="green" />
    </div>
    <div className="rounded-2xl border bg-card shadow-card">
      <div className="flex items-center justify-between border-b p-5"><h3 className="text-sm font-semibold text-heading">Pending Queue</h3><Link to="/approver/pending" className="text-xs font-semibold text-primary">View all →</Link></div>
      <div className="divide-y">{rfqs.filter(r => r.status==="UNDER_REVIEW").map(r => (
        <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div><p className="font-semibold text-heading">{r.title}</p><p className="text-xs text-mute">{r.id} · {r.quotesReceived} quotes</p></div>
          <StatusBadge status={r.status}/>
          <Link to="/approver/compare/$rfqId" params={{rfqId:r.id}} className="h-10 inline-flex items-center rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card">Review Quotes</Link>
        </div>
      ))}</div>
    </div>
  </div>
)});
