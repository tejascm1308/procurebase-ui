import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useAuditRFQs, useRFQTimeline } from "@/lib/queries";
import type { AuditLog } from "@/lib/types";
import { GitBranch, Search, Clock } from "lucide-react";

export const Route = createFileRoute("/auditor/rfq-timeline")({ component: RFQTimelinePage });

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return iso; }
}

const EVENT_COLORS: Record<string, string> = {
  MEMBER_LOGIN: "#635BFF", RFQ_CREATED: "#10B981", RFQ_SENT: "#10B981", RFQ_CLOSED: "#64748B",
  APPROVAL_APPROVED: "#10B981", APPROVAL_ESCALATED: "#F59E0B", APPROVAL_REJECTED: "#EF4444",
  PO_GENERATED: "#635BFF", ANOMALY_DETECTED: "#EF4444", ANOMALY_REVIEWED: "#10B981",
  AI_SCORING_REQUESTED: "#8B5CF6", AI_SCORE_REQUESTED: "#8B5CF6",
  QUOTATION_SUBMITTED: "#635BFF", ORDER_STATUS_UPDATED: "#0570DE",
};
function evtColor(t: string) { return EVENT_COLORS[t] ?? "#94A3B8"; }

const STATUS_PILL: Record<string, string> = {
  approved:     "bg-emerald-50 text-emerald-700 border border-emerald-200",
  under_review: "bg-amber-50 text-amber-700 border border-amber-200",
  closed:       "bg-slate-100 text-slate-600 border border-slate-200",
  sent:         "bg-indigo-50 text-indigo-700 border border-indigo-200",
  draft:        "bg-slate-100 text-slate-500 border border-slate-200",
  escalated:    "bg-red-50 text-red-700 border border-red-200",
  cancelled:    "bg-red-50 text-red-800 border border-red-200",
};

function RFQTimelinePage() {
  const { data: rfqs = [], isLoading: rfqsLoading } = useAuditRFQs();
  const [search,     setSearch]     = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    (rfqs as any[]).filter((r: any) =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.rfq_number?.toLowerCase().includes(search.toLowerCase())
    ), [rfqs, search]);

  const effectiveId = selectedId ?? (filtered[0]?.id ?? "");
  const { data: timeline, isLoading: tlLoading } = useRFQTimeline(effectiveId);

  const tlRfq    = timeline?.rfq;
  const tlEvents: AuditLog[] = timeline?.events ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-heading">RFQ Timeline</h1>
        <p className="text-sm text-mute mt-0.5">Select an RFQ to view its complete procurement trail.</p>
      </div>

      <div className="flex gap-5" style={{ minHeight: "calc(100vh - 200px)" }}>
        {/* Left: RFQ list */}
        <div className="w-64 shrink-0 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mute" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search RFQs…"
              className="h-9 w-full rounded-lg border bg-white pl-8 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
          </div>
          <div className="rounded-2xl border bg-card shadow-card overflow-y-auto flex-1">
            {rfqsLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
            {filtered.map((r: any) => {
              const isSelected = effectiveId === r.id;
              return (
                <button key={r.id} onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left px-4 py-3.5 border-b transition-colors ${isSelected ? "bg-[#EEF2FF] border-l-2 border-l-primary" : "hover:bg-secondary"}`}>
                  <p className={`text-xs font-semibold truncate ${isSelected ? "text-primary" : "text-heading"}`}>{r.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-mute">{r.rfq_number}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${STATUS_PILL[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {r.status?.replace("_", " ")}
                    </span>
                  </div>
                </button>
              );
            })}
            {!rfqsLoading && filtered.length === 0 && (
              <p className="text-xs text-mute text-center py-8">No RFQs found</p>
            )}
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="flex-1 rounded-2xl border bg-card shadow-card p-6 overflow-y-auto">
          {!effectiveId && (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-mute">
              <GitBranch className="h-10 w-10" />
              <p className="text-sm">Select an RFQ to view its timeline</p>
            </div>
          )}
          {tlLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          {!tlLoading && tlRfq && (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-heading">{tlRfq.title}</h2>
                  <p className="text-xs text-mute font-mono mt-0.5">{tlRfq.rfq_number} · {tlEvents.length} events recorded</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_PILL[tlRfq.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {tlRfq.status?.replace("_", " ")}
                </span>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-[#E2E8F0]" />
                <div className="space-y-5 pl-10">
                  {tlEvents.map((ev) => {
                    const color = evtColor(ev.event_type);
                    return (
                      <div key={ev.id} className="relative">
                        <div className="absolute -left-[26px] h-4 w-4 rounded-full border-2 border-white flex items-center justify-center"
                          style={{ background: color }}>
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        </div>
                        <div className="rounded-xl border bg-[#F8FAFC] p-3.5">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-[10px] text-mute flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {fmtTime(ev.created_at)}
                            </span>
                            {ev.actor_role && (
                              <span className="rounded-full bg-[#EEF2FF] text-primary px-2 py-0.5 text-[10px] font-bold uppercase">
                                {ev.actor_role}
                              </span>
                            )}
                            {ev.actor_name && (
                              <span className="text-[11px] font-semibold text-heading">{ev.actor_name}</span>
                            )}
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white ml-auto"
                              style={{ background: color }}>
                              {ev.event_type}
                            </span>
                          </div>
                          <p className="text-xs text-body">{ev.description}</p>
                          {ev.prev_state && ev.new_state && (
                            <p className="text-[11px] text-mute mt-1">
                              <span className="font-mono bg-slate-100 px-1 rounded">{ev.prev_state}</span>
                              {" → "}
                              <span className="font-mono bg-slate-100 px-1 rounded">{ev.new_state}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {tlEvents.length === 0 && (
                    <p className="text-sm text-mute text-center py-8">No events recorded for this RFQ yet</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
