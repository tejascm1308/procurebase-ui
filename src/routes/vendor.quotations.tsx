import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { quotations } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/quotations")({ component: VendorQuotations });

const TABS = ["All", "DRAFT", "UNDER_REVIEW", "SELECTED", "REJECTED", "WITHDRAWN"] as const;

function VendorQuotations() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const list = tab === "All" ? quotations : quotations.filter((q) => q.status === tab);
  return (
    <div>
      <PageHeader title="My Quotations" subtitle="All quotes you've submitted to organizations on the platform." />
      <div className="mb-5 flex flex-wrap gap-1 rounded-lg border bg-card p-1 w-fit shadow-card">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${tab === t ? "bg-gradient-primary text-white shadow-card" : "text-body hover:text-heading"}`}>{t.replaceAll("_"," ")}</button>
        ))}
      </div>
      <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left label-tiny bg-page">
            <th className="px-5 py-3">Quote ID</th><th className="px-5 py-3">RFQ</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th>
          </tr></thead>
          <tbody>
            {list.map((q, i) => (
              <tr key={q.id} className={`border-t hover:bg-[#F0F4F8] ${i % 2 === 0 ? "bg-page/40" : ""}`}>
                <td className="px-5 py-3 font-mono text-xs text-body">{q.id}</td>
                <td className="px-5 py-3 font-medium text-heading">{q.rfqTitle}</td>
                <td className="px-5 py-3 text-body">{q.submittedAt}</td>
                <td className="px-5 py-3 font-semibold text-heading">₹{q.totalAmount.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3"><StatusBadge status={q.status} /></td>
                <td className="px-5 py-3 text-right"><Link to="/vendor/quotations/$id" params={{ id: q.id }} className="text-xs font-semibold text-primary hover:underline">View →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
