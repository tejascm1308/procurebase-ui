import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAnomalies, useMarkAnomalyReviewed, useAIDeepScan } from "@/lib/queries";
import type { AnomalySignal } from "@/lib/types";
import {
  Shield, CheckCircle2, Clock, Brain,
  Sparkles, AlertTriangle, TrendingUp, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";

export const Route = createFileRoute("/auditor/anomalies")({ component: AnomaliesPage });

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const SEV_STYLES: Record<string, string> = {
  HIGH:     "bg-red-50 text-red-700 border-red-200",
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
  MEDIUM:   "bg-amber-50 text-amber-700 border-amber-200",
  LOW:      "bg-green-50 text-green-700 border-green-200",
};
const SEV_BORDER: Record<string, string> = {
  HIGH: "#EF4444", CRITICAL: "#DC2626", MEDIUM: "#F59E0B", LOW: "#10B981",
};
const SEV_AI_STYLE: Record<string, string> = {
  HIGH:     "bg-red-50 border-red-200 text-red-800",
  CRITICAL: "bg-red-100 border-red-300 text-red-900",
  MEDIUM:   "bg-amber-50 border-amber-200 text-amber-800",
  LOW:      "bg-green-50 border-green-200 text-green-800",
};

const AI_EXPLANATIONS: Record<string, string> = {
  LOW_COMPETITION_AWARD:
    "This RFQ received fewer than 3 bids — below the recommended minimum. Low competition can indicate collusion, restricted vendor access, or inadequate market outreach. Review the vendor selection process and consider re-issuing with wider distribution.",
  NO_BIDS_RECEIVED:
    "This RFQ closed without any vendor submitting a quotation. This may indicate poor market outreach, unrealistic requirements, or a structural issue. Consider revising the specifications or expanding the vendor list.",
  STALE_RFQ:
    "This RFQ has been open for more than 30 days without resolution. Prolonged open RFQs may indicate procurement stalls, unresponsive vendors, or internal approval delays. Consider escalating or closing the RFQ.",
  VENDOR_DOMINANCE:
    "A single vendor has been selected across 3+ RFQs in this organisation. While this may reflect genuine capability, repeated selection without competitive bidding may indicate preference bias, price-fixing, or collusion. An independent review of the vendor selection criteria is recommended.",
};

// ── AI insight panel ─────────────────────────────────────────────────────────
function AIInsightsPanel({ data }: { data: any }) {
  const [showAll, setShowAll] = useState(false);
  if (!data) return null;

  const anomalies: any[] = data.anomalies_detected || [];
  const visible = showAll ? anomalies : anomalies.slice(0, 3);
  const healthScore: number = data.overall_health_score ?? 0;
  const healthColor = healthScore >= 70 ? "#10B981" : healthScore >= 40 ? "#F59E0B" : "#EF4444";

  const actions: any[] = data.priority_actions || [];
  const gaps: string[] = data.process_gaps || [];

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white shadow-card mt-4">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-900">AI Procurement Intelligence Report</p>
            <p className="text-[11px] text-indigo-500">Powered by MCP Tool 4 — detect_procurement_anomalies</p>
          </div>
        </div>
        {/* Health score ring */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[11px] text-mute font-semibold uppercase tracking-wide">Health Score</p>
            <p className="text-2xl font-bold" style={{ color: healthColor }}>{healthScore}<span className="text-sm font-normal text-mute">/100</span></p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {data.executive_summary && (
        <div className="px-6 py-4 border-b border-indigo-100">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5">Executive Summary</p>
          <p className="text-sm text-body leading-relaxed">{data.executive_summary}</p>
        </div>
      )}

      {/* AI-detected anomalies */}
      {anomalies.length > 0 && (
        <div className="px-6 py-4 border-b border-indigo-100">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-3">
            AI-Detected Issues ({anomalies.length})
          </p>
          <div className="space-y-3">
            {visible.map((a: any, i: number) => (
              <div key={i} className={`rounded-xl border p-3 ${SEV_AI_STYLE[a.severity] || "bg-gray-50 border-gray-200 text-gray-800"}`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold">{a.title || a.type?.replace(/_/g, " ")}</span>
                      <span className="rounded-full bg-white/60 px-2 py-px text-[10px] font-bold border">
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">{a.description}</p>
                    {a.evidence && (
                      <p className="text-[11px] mt-1 opacity-80 italic">{a.evidence}</p>
                    )}
                    {a.recommendation && (
                      <p className="text-[11px] mt-1.5 font-semibold">→ {a.recommendation}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {anomalies.length > 3 && (
            <button onClick={() => setShowAll(p => !p)}
              className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
              {showAll ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</> : <><ChevronDown className="h-3.5 w-3.5" /> Show {anomalies.length - 3} more</>}
            </button>
          )}
        </div>
      )}

      {/* Two-column: Priority Actions + Process Gaps */}
      <div className="px-6 py-4 grid grid-cols-2 gap-6 border-b border-indigo-100">
        {actions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Priority Actions
            </p>
            <ul className="space-y-2">
              {actions.slice(0, 5).map((a: any, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold mt-0.5 ${
                    a.urgency === "IMMEDIATE" ? "bg-red-100 text-red-700" :
                    a.urgency === "THIS_WEEK" ? "bg-amber-100 text-amber-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{a.urgency?.replace("_", " ")}</span>
                  <span className="text-xs text-body">{a.action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {gaps.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">Process Gaps</p>
            <ul className="space-y-1.5">
              {gaps.slice(0, 5).map((g: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-body">
                  <span className="text-amber-500 shrink-0 mt-0.5">▸</span> {g}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Spending insights */}
      {data.spending_insights && (
        <div className="px-6 py-3">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">Spending Insights</p>
          <div className="flex flex-wrap gap-4 text-xs text-body">
            {data.spending_insights.total_spend_inr != null && (
              <span>Total Spend: <strong>₹{Number(data.spending_insights.total_spend_inr).toLocaleString("en-IN")}</strong></span>
            )}
            {data.spending_insights.top_vendor_concentration_pct != null && (
              <span>Top Vendor: <strong>{data.spending_insights.top_vendor_concentration_pct}%</strong> of spend</span>
            )}
            {data.spending_insights.concentration_risk && (
              <span>Concentration Risk: <strong className={
                data.spending_insights.concentration_risk === "HIGH" ? "text-red-600" :
                data.spending_insights.concentration_risk === "MEDIUM" ? "text-amber-600" : "text-green-600"
              }>{data.spending_insights.concentration_risk}</strong></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function AnomaliesPage() {
  const { data: anomalies = [], isLoading, refetch } = useAnomalies({ reviewed: false });
  const markReviewed = useMarkAnomalyReviewed();
  const aiDeepScan   = useAIDeepScan();
  const [aiExplain, setAiExplain] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);

  const open = (anomalies as AnomalySignal[]);

  const handleAIScan = async () => {
    const result = await aiDeepScan.mutateAsync(undefined);


    setAiInsights(result);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading">Anomaly Alerts</h1>
          <p className="text-sm text-mute mt-0.5">
            Rule-based + AI-powered procurement anomaly detection.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Deep Scan (MCP Tool 4) */}
          <button onClick={handleAIScan} disabled={aiDeepScan.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 text-sm font-semibold text-white shadow-card hover:opacity-90 disabled:opacity-60 transition-opacity">
            {aiDeepScan.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> AI Analysing…</>
              : <><Sparkles className="h-4 w-4" /> AI Deep Scan</>}
          </button>
        </div>
      </div>

      {/* AI Insights panel (shown after AI scan) */}
      {aiDeepScan.isPending && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <div>
            <p className="text-sm font-bold text-indigo-800">AI is analysing your procurement data…</p>
            <p className="text-xs text-indigo-500 mt-0.5">Fetching analytics, RFQs, orders & audit logs via MCP Tool 4</p>
          </div>
        </div>
      )}
      {!aiDeepScan.isPending && aiInsights && <AIInsightsPanel data={aiInsights} />}

      {/* Rule-based anomalies list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : open.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border bg-card gap-3">
          <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-heading">No active anomalies</p>
          <p className="text-xs text-mute">Your procurement process looks clean. Run a scan to re-check.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-heading uppercase tracking-wide flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-amber-500" /> OPEN ({open.length})
          </p>
          {open.map(a => (
            <div key={a.id} className="rounded-2xl border-l-4 border bg-card shadow-card px-5 py-4"
              style={{ borderLeftColor: SEV_BORDER[a.severity] }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title + badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-heading">
                      {a.anomaly_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${SEV_STYLES[a.severity]}`}>
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-xs text-body mt-1">{a.description}</p>
                  <p className="text-[11px] text-mute mt-1.5 flex items-center gap-1">
                    <span className="uppercase font-semibold">{a.entity_type || "RFQ"}</span>
                    <span>·</span>
                    <Clock className="h-3 w-3" /> Detected {timeAgo(a.detected_at)}
                  </p>

                  {/* AI Explain expanded */}
                  {aiExplain === a.id && (
                    <div className="mt-3 rounded-xl bg-[#F5F3FF] border border-indigo-200 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-[11px] font-bold text-indigo-700">AI Explanation</span>
                      </div>
                      <p className="text-xs text-indigo-900 leading-relaxed">
                        {AI_EXPLANATIONS[a.anomaly_type] ||
                          "This procurement data shows an irregularity that deviates from expected patterns. Review the details and take appropriate corrective action."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => setAiExplain(aiExplain === a.id ? null : a.id)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors">
                    <Brain className="h-3.5 w-3.5" /> AI Explain
                  </button>
                  <button onClick={() => markReviewed.mutate(a.id)} disabled={markReviewed.isPending}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#0E9090] px-3 text-[11px] font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Reviewed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
