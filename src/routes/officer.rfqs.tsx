import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { rfqs } from "@/lib/mock-data";

export const Route = createFileRoute("/officer/rfqs")({ component: () => (
  <div>
    <PageHeader title="My RFQs" subtitle="All RFQs you've created or are managing."
      actions={<Link to="/officer/rfqs/create" className="h-10 inline-flex items-center rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card">+ New RFQ</Link>} />
    <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="text-left label-tiny bg-page"><th className="px-5 py-3">RFQ</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Quotes</th><th className="px-5 py-3">Deadline</th><th className="px-5 py-3">Status</th></tr></thead>
        <tbody>{rfqs.map((r,i) => (
          <tr key={r.id} className={`border-t hover:bg-[#F0F4F8] ${i%2===0?"bg-page/40":""}`}>
            <td className="px-5 py-3"><Link to="/officer/rfqs/$id" params={{id:r.id}} className="font-semibold text-heading hover:text-primary">{r.title}</Link><p className="text-xs text-mute">{r.id}</p></td>
            <td className="px-5 py-3 text-body">{r.category}</td><td className="px-5 py-3 text-body">{r.type}</td><td className="px-5 py-3 font-semibold text-heading">{r.quotesReceived}</td><td className="px-5 py-3 text-body">{r.deadline}</td><td className="px-5 py-3"><StatusBadge status={r.status}/></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  </div>
)});
