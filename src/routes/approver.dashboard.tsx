import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { usePendingApprovals, useApprovalHistory } from "@/lib/queries";
import { ClipboardCheck, AlertOctagon, CheckCircle2, Clock } from "lucide-react";
import { KPICard } from "@/components/app/KPICard";
import type { RFQ } from "@/lib/types";

export const Route = createFileRoute("/approver/dashboard")({ component: ApproverDashboard });

function ApproverDashboard() {
  const { data: pending = [] } = usePendingApprovals();
  const { data: history = [] } = useApprovalHistory();
  const escalated = (pending as RFQ[]).filter(r => r.status === "escalated");

  return (
    <div>
      <PageHeader eyebrow="Approver" title="Approval Center" subtitle="Pending decisions across all RFQs assigned to you." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard icon={ClipboardCheck} label="Pending"      value={String((pending as RFQ[]).length)}      tone="amber" />
        <KPICard icon={AlertOctagon}   label="Escalated"    value={String(escalated.length)}               tone="rose" />
        <KPICard icon={CheckCircle2}   label="Decisions"    value={String(history.length)}                  tone="green" />
        <KPICard icon={Clock}          label="Avg Decision" value="—"                                        tone="blue" />
      </div>
      <div className="rounded-2xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b p-5">
          <h3 className="text-sm font-semibold text-heading">Pending Queue</h3>
          <Link to="/approver/pending" className="text-xs font-semibold text-primary">View all →</Link>
        </div>
        <div className="divide-y">
          {(pending as RFQ[]).length === 0 && <p className="p-5 text-sm text-mute">No pending approvals.</p>}
          {(pending as RFQ[]).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div><p className="font-semibold text-heading">{r.title}</p><p className="text-xs text-mute">{r.id.slice(0, 8)}… · {r.quotes_received ?? 0} quotes</p></div>
              <StatusBadge status={r.status.toUpperCase()} />
              <Link to="/approver/compare/$rfqId" params={{ rfqId: r.id }} className="h-10 inline-flex items-center rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card">Review Quotes</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
