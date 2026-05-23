import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useRFQs } from "@/lib/queries";
import { useState } from "react";
import { Globe, Target, FileEdit, Plus, Loader2, ChevronRight } from "lucide-react";
import type { RFQ } from "@/lib/types";

export const Route = createFileRoute("/officer/rfqs/")({ component: OfficerRFQs });

type Tab = "all" | "open" | "targeted" | "draft";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "all",      label: "All RFQs",  icon: FileEdit },
  { id: "open",     label: "Open",      icon: Globe },
  { id: "targeted", label: "Targeted",  icon: Target },
  { id: "draft",    label: "Drafts",    icon: FileEdit },
];

function TypeBadge({ type }: { type: string }) {
  return type === "open" ? (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#EFF6FF", color: "#0570DE" }}>
      <Globe className="h-2.5 w-2.5" /> Open
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#EEF2FF", color: "#635BFF" }}>
      <Target className="h-2.5 w-2.5" /> Targeted
    </span>
  );
}

function OfficerRFQs() {
  const [tab, setTab] = useState<Tab>("all");
  const { data: rfqs = [], isLoading } = useRFQs();
  const navigate = useNavigate();

  const all = rfqs as RFQ[];
  const filtered = tab === "all" ? all
    : tab === "open"     ? all.filter(r => r.distribution_type === "open"     && r.status !== "draft")
    : tab === "targeted" ? all.filter(r => r.distribution_type === "targeted" && r.status !== "draft")
    :                      all.filter(r => r.status === "draft");

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div>
      <PageHeader
        title="RFQs"
        subtitle="Create and manage your organization's requests for quotation."
        actions={
          <button onClick={() => navigate({ to: "/officer/rfqs/create" })}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-5 text-sm font-semibold text-white shadow-card hover:opacity-90">
            <Plus className="h-4 w-4" /> New RFQ
          </button>
        }
      />

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border bg-card p-1 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${tab === t.id ? "bg-gradient-primary text-white shadow-sm" : "text-body hover:text-heading"}`}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            <span className={`rounded-full px-1.5 text-[10px] font-bold ${tab === t.id ? "bg-white/20 text-white" : "bg-secondary text-mute"}`}>
              {t.id === "all" ? all.length
                : t.id === "open"     ? all.filter(r => r.distribution_type === "open"     && r.status !== "draft").length
                : t.id === "targeted" ? all.filter(r => r.distribution_type === "targeted" && r.status !== "draft").length
                :                       all.filter(r => r.status === "draft").length}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border bg-card py-16 text-center shadow-card">
          <p className="text-sm font-semibold text-heading">No RFQs here yet</p>
          <p className="text-xs text-mute mt-1 mb-4">Create a new RFQ or switch tabs to see others.</p>
          <button onClick={() => navigate({ to: "/officer/rfqs/create" })}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> Create RFQ
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b label-tiny text-left bg-[#F8FAFC]">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Quotes</th>
                <th className="px-5 py-3">Submission Deadline</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t hover:bg-[#F0F4F8] transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-heading">{r.title}</p>
                    <p className="text-[11px] text-mute">{r.id.slice(0, 8)}…</p>
                  </td>
                  <td className="px-5 py-3"><TypeBadge type={r.distribution_type || "open"} /></td>
                  <td className="px-5 py-3 text-body text-xs">{r.category}</td>
                  <td className="px-5 py-3 font-semibold text-heading">{r.quotes_received ?? 0}</td>
                  <td className="px-5 py-3 text-body text-xs">{fmt(r.submission_deadline)}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status.toUpperCase()} /></td>
                  <td className="px-5 py-3">
                    <Link to="/officer/rfqs/$id" params={{ id: r.id }}
                      className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold text-heading hover:bg-secondary">
                      View <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
