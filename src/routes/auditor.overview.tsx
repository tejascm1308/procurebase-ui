import { createFileRoute } from "@tanstack/react-router";
import { useAuditSummary, useAnomalies, useAuditRFQs } from "@/lib/queries";
import type { AuditLog, AnomalySignal } from "@/lib/types";
import { AlertTriangle, Activity, GitBranch, CheckCircle2, ArrowRight, ChevronRight, Clock } from "lucide-react";

export const Route = createFileRoute("/auditor/overview")({ component: AuditorOverview });

type Tab = "overview" | "audit-logs" | "rfq-timeline" | "anomalies";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
const EVENT_COLORS: Record<string, string> = {
  MEMBER_LOGIN: "#635BFF", MEMBER_LOGOUT: "#94A3B8", MEMBER_INVITED: "#0570DE",
  RFQ_CREATED: "#10B981", RFQ_SENT: "#10B981", RFQ_CLOSED: "#64748B",
  APPROVAL_APPROVED: "#10B981", APPROVAL_ESCALATED: "#F59E0B", APPROVAL_REJECTED: "#EF4444",
  PO_GENERATED: "#635BFF", ANOMALY_DETECTED: "#EF4444", ANOMALY_REVIEWED: "#10B981",
  AI_SCORING_REQUESTED: "#8B5CF6", AI_SCORE_REQUESTED: "#8B5CF6",
  VENDOR_RATED: "#F59E0B", ORDER_STATUS_UPDATED: "#0570DE", QUOTATION_SUBMITTED: "#635BFF",
};
function evtColor(t: string) { return EVENT_COLORS[t] ?? "#94A3B8"; }
const SEV_STYLES: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  LOW: "bg-green-50 text-green-700 border-green-200",
};
const SEV_BORDER: Record<string, string> = { HIGH: "#EF4444", MEDIUM: "#F59E0B", LOW: "#10B981" };
const STATUS_PILL: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  under_review: "bg-amber-50 text-amber-700 border border-amber-200",
  closed: "bg-slate-100 text-slate-600 border border-slate-200",
  sent: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  draft: "bg-slate-100 text-slate-500 border border-slate-200",
  escalated: "bg-red-50 text-red-700 border border-red-200",
};
import { useNavigate } from "@tanstack/react-router";

function AuditorOverview() {
  const { data: summary }        = useAuditSummary();
  const { data: anomalies = [] } = useAnomalies({ reviewed: false });
  const { data: rfqs = [] }      = useAuditRFQs();
  const navigate = useNavigate();

  const recentEvents: AuditLog[] = summary?.recent_events ?? [];
  const openAnomalies = (anomalies as AnomalySignal[]).slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Overview</h1>
        <p className="text-sm text-mute mt-0.5">Compliance &amp; audit snapshot for your organisation.</p>
      </div>

      {/* 3-column panel */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Anomaly Alerts */}
        <div className="rounded-2xl border bg-card shadow-card flex flex-col">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-heading">Anomaly Alerts</span>
            </div>
            <button onClick={() => navigate({ to: "/auditor/anomalies" })}
              className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 px-5 py-4">
            {openAnomalies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-xs text-mute font-medium">No active anomalies</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openAnomalies.map(a => (
                  <div key={a.id} className="rounded-xl border-l-4 border bg-[#FFFBEB] p-3"
                    style={{ borderLeftColor: SEV_BORDER[a.severity] }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-heading">{a.anomaly_type.replace(/_/g, " ")}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${SEV_STYLES[a.severity]}`}>{a.severity}</span>
                    </div>
                    <p className="text-[11px] text-body">{a.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="rounded-2xl border bg-card shadow-card flex flex-col">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-heading">Recent Events</span>
            </div>
            <button onClick={() => navigate({ to: "/auditor/audit-logs" })}
              className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
              Full log <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 divide-y overflow-y-auto max-h-80">
            {recentEvents.length === 0 && <p className="text-xs text-mute text-center py-8">No events yet</p>}
            {recentEvents.map(ev => (
              <div key={ev.id} className="px-5 py-2.5 flex gap-3 items-start">
                <div className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ background: evtColor(ev.event_type) }} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: evtColor(ev.event_type) }}>
                      {ev.event_type}
                    </span>
                    {ev.actor_name && <span className="text-[11px] font-semibold text-heading">{ev.actor_name}</span>}
                  </div>
                  <p className="text-xs text-body mt-0.5 truncate">{ev.description}</p>
                  <p className="text-[10px] text-mute mt-0.5">{timeAgo(ev.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RFQ Timelines */}
        <div className="rounded-2xl border bg-card shadow-card flex flex-col">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-heading">RFQ Timelines</span>
            </div>
            <button onClick={() => navigate({ to: "/auditor/rfq-timeline" })}
              className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
              Browse all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 divide-y overflow-y-auto max-h-80">
            {(rfqs as any[]).slice(0, 6).map((r: any) => (
              <button key={r.id} onClick={() => navigate({ to: "/auditor/rfq-timeline" })}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-secondary text-left">
                <div className="min-w-0 mr-3">
                  <p className="text-xs font-semibold text-heading truncate">{r.title}</p>
                  <p className="text-[10px] text-mute font-mono mt-0.5">{r.rfq_number}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_PILL[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {r.status?.replace("_", " ")}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-mute" />
                </div>
              </button>
            ))}
            {rfqs.length === 0 && <p className="text-xs text-mute text-center py-8">No RFQs yet</p>}
          </div>
        </div>
      </div>

      {/* Quick nav cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: "/auditor/audit-logs",   icon: Activity,    title: "Full Audit Logs",  sub: "Filter & export all events" },
          { to: "/auditor/rfq-timeline", icon: GitBranch,   title: "RFQ Timelines",    sub: "Per-RFQ procurement trail" },
          { to: "/auditor/anomalies",    icon: AlertTriangle, title: "Anomaly Alerts",  sub: "Rule-based fraud detection" },
        ].map(c => (
          <button key={c.to} onClick={() => navigate({ to: c.to as any })}
            className="rounded-2xl border bg-card p-5 shadow-card text-left hover:border-primary hover:shadow-md transition-all group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] mb-3 group-hover:bg-primary transition-colors">
              <c.icon className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
            </div>
            <p className="text-sm font-semibold text-heading">{c.title}</p>
            <p className="text-xs text-mute mt-0.5">{c.sub}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
