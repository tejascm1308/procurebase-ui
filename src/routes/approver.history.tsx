import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { rfqs } from "@/lib/mock-data";
export const Route = createFileRoute("/approver/history")({ component: () => (
  <div><PageHeader title="Approval History" subtitle="Past decisions and outcomes." />
  <div className="rounded-2xl border bg-card shadow-card overflow-hidden"><table className="w-full text-sm"><thead><tr className="bg-page label-tiny text-left"><th className="px-5 py-3">RFQ</th><th className="px-5 py-3">Decision</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{rfqs.filter(r=>r.status==="APPROVED"||r.status==="CLOSED").map((r,i)=>(<tr key={r.id} className={`border-t ${i%2===0?"bg-page/40":""}`}><td className="px-5 py-3 font-semibold text-heading">{r.title}</td><td className="px-5 py-3 text-body">Approved</td><td className="px-5 py-3 text-body">{r.createdAt}</td><td className="px-5 py-3"><StatusBadge status={r.status}/></td></tr>))}</tbody></table></div></div>
)});
