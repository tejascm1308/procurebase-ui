import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox, Globe, Target, Clock } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { useRFQs } from "@/lib/queries";
import type { RFQ } from "@/lib/types";

export const Route = createFileRoute("/vendor/rfqs/")({ component: VendorRFQs });


type Tab = "open" | "targeted";

function DeadlineTag({ date }: { date: string }) {
  if (!date) return null;
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  const urgent = days <= 3;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${urgent ? "bg-red-50 text-red-600" : "bg-[#FFF8E1] text-[#F59E0B]"}`}>
      <Clock className="h-2.5 w-2.5" />
      {days <= 0 ? "Expired" : `${days}d left`}
    </span>
  );
}

function RFQRow({ r }: { r: RFQ }) {
  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";
  const isClosed = !["sent"].includes(r.status);
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-5 shadow-card transition-shadow ${isClosed ? "bg-[#F8FAFC] border-dashed opacity-80" : "bg-card hover:shadow-md"}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-heading">{r.title}</p>
          {r.distribution_type === "targeted" && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-[#EEF2FF] text-[#635BFF]">For You</span>
          )}
          {isClosed && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] border">CLOSED</span>
          )}
        </div>
        <p className="text-xs text-mute mb-3 line-clamp-2">{r.description || "No description provided"}</p>
        <div className="flex flex-wrap gap-3 text-xs text-body">
          <span className="font-medium">{r.category}</span>
          <span className="text-mute">·</span>
          <span>{r.quantity} {r.unit_of_measurement}</span>
          {r.budget_max && <><span className="text-mute">·</span><span className="font-semibold text-heading">Budget: ₹{r.budget_max.toLocaleString("en-IN")}</span></>}
          <span className="text-mute">·</span>
          <span>Deliver by {fmt(r.delivery_deadline)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        {!isClosed && <DeadlineTag date={r.submission_deadline} />}
        {isClosed ? (
          <Link to="/vendor/rfqs/$id" params={{ id: r.id }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-4 text-xs font-semibold text-mute hover:text-heading hover:bg-secondary transition-colors">
            View Details →
          </Link>
        ) : (
          <Link to="/vendor/rfqs/$id" params={{ id: r.id }}
            className="inline-flex h-9 items-center rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90">
            View →
          </Link>
        )}
      </div>
    </div>
  );
}

function VendorRFQs() {
  const [tab, setTab] = useState<Tab>("open");
  const { data: rfqs = [], isLoading } = useRFQs();

  const all           = rfqs as RFQ[];
  const openRFQs      = all.filter(r => r.distribution_type === "open");
  const targetedRFQs  = all.filter(r => r.distribution_type === "targeted");
  const shown = tab === "open" ? openRFQs : targetedRFQs;

  return (
    <div>
      <PageHeader title="RFQ Inbox" subtitle="Respond to open market requests or vendor-specific quote requests." />

      <div className="mb-6 flex gap-1 rounded-xl border bg-card p-1 w-fit">
        {([
          { id: "open" as Tab,     label: "Open Requests",   icon: Globe,   count: openRFQs.length },
          { id: "targeted" as Tab, label: "Sent to You",     icon: Target,  count: targetedRFQs.length },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${tab === t.id ? "bg-gradient-primary text-white shadow-sm" : "text-body hover:text-heading"}`}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            <span className={`rounded-full px-1.5 text-[10px] font-bold ${tab === t.id ? "bg-white/20 text-white" : "bg-secondary text-mute"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <p className="mb-4 text-xs text-mute">
        {tab === "open"
          ? "These RFQs are open to all verified vendors. Submit your best quote before the deadline."
          : "These RFQs were sent directly to you by a procurement officer. Respond promptly to win the order."}
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border bg-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent mb-4">
            <Inbox className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-semibold text-heading">
            {tab === "open" ? "No open requests right now" : "No targeted requests for you"}
          </p>
          <p className="text-xs text-mute mt-1">Check back soon — new RFQs will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map(r => <RFQRow key={r.id} r={r} />)}
        </div>
      )}
    </div>
  );
}
