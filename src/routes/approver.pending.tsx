import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { usePendingApprovals } from "@/lib/queries";
import { Clock, MessageSquare, Globe, Target } from "lucide-react";
import type { RFQ } from "@/lib/types";

export const Route = createFileRoute("/approver/pending")({ component: PendingApprovals });

function PendingApprovals() {
  const { data: rfqs = [], isLoading } = usePendingApprovals();

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const daysAgo = (d: string) => {
    const diff = Math.round((Date.now() - new Date(d).getTime()) / 86400000);
    return diff === 0 ? "today" : `${diff}d ago`;
  };

  return (
    <div>
      <PageHeader
        title="Pending Approvals"
        subtitle="Closed RFQs forwarded by officers — review vendor quotations and issue purchase orders."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (rfqs as RFQ[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border bg-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-heading">No pending approvals</p>
          <p className="text-xs text-mute mt-1 max-w-xs text-center">
            Approvals will appear here once officers close their RFQs or submission deadlines pass.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(rfqs as RFQ[]).map((r) => (
            <div key={r.id} className="rounded-2xl border bg-card p-5 shadow-card hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start gap-4">
                {/* Left: RFQ info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-heading">{r.title}</p>
                    <StatusBadge status={r.status?.toUpperCase()} />
                    {r.distribution_type === "open"
                      ? <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-[#EFF6FF] text-[#0570DE]"><Globe className="h-2.5 w-2.5" /> Open</span>
                      : <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-[#EEF2FF] text-[#635BFF]"><Target className="h-2.5 w-2.5" /> Targeted</span>
                    }
                  </div>
                  <p className="text-xs text-mute mb-3 line-clamp-2">{(r as any).description || "No description."}</p>

                  <div className="flex flex-wrap gap-4 text-xs">
                    <div>
                      <p className="label-tiny">Category</p>
                      <p className="font-semibold text-heading mt-0.5">{r.category}</p>
                    </div>
                    <div>
                      <p className="label-tiny">Submission Deadline</p>
                      <p className="font-semibold text-heading mt-0.5">{fmt(r.submission_deadline)}</p>
                    </div>
                    <div>
                      <p className="label-tiny">Delivery Deadline</p>
                      <p className="font-semibold text-heading mt-0.5">{fmt(r.delivery_deadline)}</p>
                    </div>
                    <div>
                      <p className="label-tiny">Submitted By</p>
                      <p className="font-semibold text-heading mt-0.5">{(r as any).users?.full_name ?? "Officer"}</p>
                    </div>
                    <div>
                      <p className="label-tiny">Forwarded</p>
                      <p className="font-semibold text-heading mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-mute" />
                        {daysAgo(r.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Quotes count + action */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-heading">{r.quotes_received ?? 0}</p>
                    <p className="text-[10px] font-semibold text-mute uppercase tracking-wider">Quote{(r.quotes_received ?? 0) !== 1 ? "s" : ""}</p>
                  </div>
                  <Link to="/approver/compare/$rfqId" params={{ rfqId: r.id }}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90">
                    Review & Decide →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
