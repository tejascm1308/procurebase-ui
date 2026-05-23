import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { useEscalations } from "@/lib/queries";
import { AlertOctagon, ChevronRight, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/app/StatusBadge";
import type { RFQ } from "@/lib/types";

export const Route = createFileRoute("/head/escalations")({ component: HeadEscalations });

function HeadEscalations() {
  const { data: escalations = [], isLoading } = useEscalations();

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div>
      <PageHeader title="Escalations" subtitle="RFQs escalated by the approver for your final decision." />
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (escalations as RFQ[]).length === 0 ? (
        <div className="rounded-2xl border bg-card p-16 text-center shadow-card">
          <AlertOctagon className="mx-auto h-10 w-10 text-mute mb-3" />
          <p className="text-sm font-semibold text-heading">No escalations</p>
          <p className="text-xs text-mute mt-1">All RFQs are within normal approval flow. 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(escalations as RFQ[]).map(e => (
            <div key={e.id} className="rounded-2xl border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-heading">{e.title}</p>
                    <StatusBadge status="ESCALATED" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-mute">
                    <span>📦 {e.category}</span>
                    <span>🏷️ Budget: {e.budget_max ? `₹${e.budget_max.toLocaleString("en-IN")}` : "Not disclosed"}</span>
                    <span>📅 Delivery: {fmt(e.delivery_deadline)}</span>
                    <span>🗳️ {e.quotes_received ?? 0} quotation(s) received</span>
                  </div>
                </div>
                <Link to="/head/escalation-review/$rfqId" params={{ rfqId: e.id }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90 shrink-0">
                  Review <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
