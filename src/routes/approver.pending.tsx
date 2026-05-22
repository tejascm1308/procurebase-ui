import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { rfqs } from "@/lib/mock-data";

export const Route = createFileRoute("/approver/pending")({ component: () => (
  <div>
    <PageHeader title="Pending Approvals" subtitle="Quote sets awaiting your decision." />
    <div className="grid gap-4 md:grid-cols-2">
      {rfqs.filter(r => r.status==="UNDER_REVIEW" || r.status==="SENT").map(r => (
        <div key={r.id} className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2"><span className="font-mono text-xs text-mute">{r.id}</span><StatusBadge status={r.status}/></div>
          <h3 className="text-base font-bold text-heading">{r.title}</h3>
          <p className="mt-1 text-xs text-body">{r.category} · Deadline {r.deadline}</p>
          <div className="mt-3 flex items-end justify-between">
            <div><p className="label-tiny">Quotes Received</p><p className="text-2xl font-bold text-heading">{r.quotesReceived}</p></div>
            <Link to="/approver/compare/$rfqId" params={{rfqId:r.id}} className="h-10 inline-flex items-center rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card">Review Quotes</Link>
          </div>
        </div>
      ))}
    </div>
  </div>
)});
