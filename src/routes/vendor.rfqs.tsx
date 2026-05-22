import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, BadgeCheck, Clock, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { rfqs } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/rfqs")({ component: VendorRFQs });

function VendorRFQs() {
  const [tab, setTab] = useState<"targeted" | "open">("targeted");
  const list = rfqs.filter((r) => (tab === "targeted" ? r.type === "Targeted" : r.type === "Open"));
  return (
    <div>
      <PageHeader title="RFQ Inbox" subtitle="Requests for quotation from organizations on the platform." />
      <div className="mb-5 flex items-center gap-1 rounded-lg border bg-card p-1 w-fit shadow-card">
        {[["targeted","Targeted Requests"],["open","Open RFQs"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as any)} className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${tab === k ? "bg-gradient-primary text-white shadow-card" : "text-body hover:text-heading"}`}>{l}</button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <input className="h-10 w-full rounded-lg border bg-card pl-9 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" placeholder="Search by title or ID…" />
        </div>
        <select className="h-10 rounded-lg border bg-card px-3 text-sm text-heading"><option>All Categories</option><option>Furniture</option><option>IT Hardware</option><option>Logistics</option></select>
        <select className="h-10 rounded-lg border bg-card px-3 text-sm text-heading"><option>All Statuses</option><option>SENT</option><option>UNDER_REVIEW</option></select>
      </div>

      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="rounded-2xl border bg-card p-5 shadow-card transition hover:shadow-card-hover">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs text-mute">{r.id}</span>
                  <StatusBadge status={r.status} />
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-primary">{r.type}</span>
                </div>
                <h3 className="text-base font-semibold text-heading">{r.title}</h3>
                <p className="mt-1 text-sm text-body line-clamp-2">{r.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-mute">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#0E9F6E]" />
                  <span>{r.organization}</span>
                  <span>•</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">{r.category}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-body"><Clock className="h-3 w-3" /> Submit by {r.deadline}</span>
                  <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-body">Deliver by {r.deliveryDeadline}</span>
                </div>
              </div>
              <Link to="/vendor/rfqs/$id" params={{ id: r.id }} className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90">
                View & Quote <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
