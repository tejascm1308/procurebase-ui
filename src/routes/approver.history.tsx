import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { useApprovalHistory } from "@/lib/queries";
import { ChevronRight, FileText } from "lucide-react";

export const Route = createFileRoute("/approver/history")({ component: ApprovalHistory });

const EVENT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  QUOTE_APPROVED:     { label: "Approved",   color: "#065F46", bg: "#ECFDF5" },
  QUOTE_REJECTED:     { label: "Rejected",   color: "#9F1239", bg: "#FFF1F2" },
  APPROVAL_ESCALATED: { label: "Escalated",  color: "#92400E", bg: "#FFFBEB" },
  APPROVAL_RETURNED:  { label: "Returned",   color: "#1E40AF", bg: "#EFF6FF" },
};

function EventBadge({ type }: { type: string }) {
  const cfg = EVENT_LABELS[type] ?? { label: type.replace(/_/g, " "), color: "#374151", bg: "#F3F4F6" };
  return (
    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
      style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

function ApprovalHistory() {
  const { data: logs = [], isLoading } = useApprovalHistory();

  return (
    <div>
      <PageHeader title="Approval History" subtitle="All past approval decisions recorded on ProcuBase." />
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (logs as any[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-16 text-center">
          <FileText className="h-8 w-8 text-mute mb-2" />
          <p className="text-sm font-semibold text-heading">No approval history yet</p>
          <p className="text-xs text-mute mt-1">Decisions you record will appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b label-tiny text-left bg-[#F8FAFC]">
                <th className="px-5 py-3">Decision</th>
                <th className="px-5 py-3">RFQ</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Notes</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(logs as any[]).map((l) => {
                const rfqId    = l.rfq_id;
                const rfqTitle = l.rfq_title ?? "—";
                const notes    = (l.metadata as any)?.notes;
                return (
                  <tr key={l.id} className="border-t hover:bg-[#F0F4F8] transition-colors">
                    <td className="px-5 py-3">
                      <EventBadge type={l.event_type} />
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-heading text-xs">{rfqTitle}</p>
                      {rfqId && <p className="font-mono text-[10px] text-mute">{rfqId.slice(0, 8)}…</p>}
                    </td>
                    <td className="px-5 py-3 text-body capitalize">{l.actor_role}</td>
                    <td className="px-5 py-3 text-body text-xs max-w-[200px] truncate">
                      {notes ?? <span className="text-mute">—</span>}
                    </td>
                    <td className="px-5 py-3 text-mute text-xs whitespace-nowrap">
                      {l.created_at.slice(0, 19).replace("T", " ")}
                    </td>
                    <td className="px-5 py-3">
                      {rfqId && (
                        <Link to="/approver/compare/$rfqId" params={{ rfqId }}
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold text-heading hover:bg-secondary transition-colors">
                          View <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
