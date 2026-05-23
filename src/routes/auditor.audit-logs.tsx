import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuditLogs } from "@/lib/queries";
import type { AuditLog } from "@/lib/types";
import { FileText, Filter, X } from "lucide-react";

export const Route = createFileRoute("/auditor/audit-logs")({ component: AuditLogsPage });

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return iso; }
}

const EVENT_COLORS: Record<string, string> = {
  MEMBER_LOGIN: "#635BFF", MEMBER_LOGOUT: "#94A3B8", MEMBER_INVITED: "#0570DE",
  RFQ_CREATED: "#10B981", RFQ_SENT: "#10B981", RFQ_CLOSED: "#64748B",
  APPROVAL_APPROVED: "#10B981", APPROVAL_ESCALATED: "#F59E0B", APPROVAL_REJECTED: "#EF4444",
  PO_GENERATED: "#635BFF", ANOMALY_DETECTED: "#EF4444", ANOMALY_REVIEWED: "#10B981",
  AI_SCORING_REQUESTED: "#8B5CF6", AI_SCORE_REQUESTED: "#8B5CF6", AI_RISK_ASSESSED: "#8B5CF6",
  VENDOR_RATED: "#F59E0B", ORDER_STATUS_UPDATED: "#0570DE",
  INVOICE_UPLOADED: "#0570DE", QUOTATION_SUBMITTED: "#635BFF", RFQ_SCAN: "#F59E0B",
};
function evtColor(t: string) { return EVENT_COLORS[t] ?? "#94A3B8"; }

// Events excluded from the audit log view (session management, not procurement)
const SESSION_EVENTS = new Set(["MEMBER_LOGIN", "MEMBER_LOGOUT"]);

// Only procurement-relevant actions shown in the dropdown
const ALL_ACTIONS = [
  "MEMBER_INVITED",
  "RFQ_CREATED","RFQ_SENT","RFQ_CLOSED","QUOTATION_SUBMITTED",
  "APPROVAL_APPROVED","APPROVAL_ESCALATED","APPROVAL_REJECTED",
  "PO_GENERATED","ORDER_STATUS_UPDATED","INVOICE_UPLOADED",
  "ANOMALY_DETECTED","ANOMALY_REVIEWED","RFQ_SCAN",
  "AI_SCORE_REQUESTED","AI_RISK_ASSESSED","AI_ANOMALY_SCAN",
  "VENDOR_RATED","VENDOR_STATUS_CHANGED",
];
const ALL_ENTITIES = ["user","rfq","quotation","purchase_order","vendor","anomaly","invoice","org","ai_task"];

function AuditLogsPage() {
  const [actorName,   setActorName]   = useState("");
  const [action,      setAction]      = useState("");
  const [entityType,  setEntityType]  = useState("");
  const [fromDate,    setFromDate]    = useState("");
  const [toDate,      setToDate]      = useState("");
  const [applied,     setApplied]     = useState<Record<string, string>>({});

  const { data: rawLogs = [], isLoading } = useAuditLogs({
    actor_name:  applied.actorName  || undefined,
    event_type:  applied.action     || undefined,
    entity_type: applied.entityType || undefined,
    from_date:   applied.fromDate   || undefined,
    to_date:     applied.toDate     || undefined,
    page_size:   100,
  });

  // Filter out session-management events unless a specific action is selected
  const logs = applied.action
    ? (rawLogs as AuditLog[])
    : (rawLogs as AuditLog[]).filter(l => !SESSION_EVENTS.has(l.event_type));

  const apply = () => setApplied({ actorName, action, entityType, fromDate, toDate });
  const clear = () => { setActorName(""); setAction(""); setEntityType(""); setFromDate(""); setToDate(""); setApplied({}); };
  const isFiltered = Object.values(applied).some(Boolean);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-heading">Audit Logs</h1>
        <p className="text-sm text-mute mt-0.5">Complete event stream — use filters below to narrow the view</p>
      </div>

      {/* Filter Panel */}
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-mute" />
          <span className="text-sm font-semibold text-heading">Filters</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-5">
          <div>
            <label className="label-tiny mb-1">Actor Name</label>
            <input value={actorName} onChange={e => setActorName(e.target.value)}
              placeholder="e.g. Varsha"
              className="h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
          </div>
          <div>
            <label className="label-tiny mb-1">Action</label>
            <select value={action} onChange={e => setAction(e.target.value)}
              className="h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:border-primary">
              <option value="">All Actions</option>
              {ALL_ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="label-tiny mb-1">Entity Type</label>
            <select value={entityType} onChange={e => setEntityType(e.target.value)}
              className="h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:border-primary">
              <option value="">All Entities</option>
              {ALL_ENTITIES.map(e => <option key={e} value={e}>{e.replace(/_/g, " ").toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="label-tiny mb-1">Date From</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="label-tiny mb-1">Date To</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="h-9 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={apply}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white hover:opacity-90">
            <Filter className="h-3.5 w-3.5" /> Apply Filters
          </button>
          {isFiltered && (
            <button onClick={clear}
              className="inline-flex h-9 items-center gap-2 rounded-lg border px-4 text-xs font-semibold text-body hover:bg-secondary">
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
          {isFiltered && (
            <span className="text-xs text-mute ml-auto">Showing filtered results · {logs.length} total</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <FileText className="h-8 w-8 text-mute" />
            <p className="text-sm text-mute">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-[#F8FAFC] text-left">
                  {["Timestamp","Actor","Role","Action","Entity","Entity ID","Description"].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold text-mute uppercase tracking-wider text-[11px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {(logs as AuditLog[]).map(l => (
                  <tr key={l.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-2.5 text-mute whitespace-nowrap">{fmtTime(l.created_at)}</td>
                    <td className="px-4 py-2.5 font-semibold text-heading whitespace-nowrap">{l.actor_name || "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {l.actor_role && (
                        <span className="rounded-full bg-[#EEF2FF] text-primary px-2 py-0.5 text-[10px] font-bold uppercase">
                          {l.actor_role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: evtColor(l.event_type) }}>
                        {l.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-body uppercase text-[11px]">{l.entity_type || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-mute max-w-[90px] truncate" title={l.entity_id || ""}>
                      {l.entity_id ? l.entity_id.slice(0, 8) + "…" : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-body max-w-xs">{l.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
