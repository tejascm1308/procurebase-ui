import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useRFQs } from "@/lib/queries";
import { Loader2, FileText } from "lucide-react";
import type { RFQ } from "@/lib/types";

export const Route = createFileRoute("/head/rfqs")({ component: HeadRFQs });

function HeadRFQs() {
  const { data: rfqs = [], isLoading } = useRFQs();

  return (
    <div>
      <PageHeader title="All RFQs" subtitle="Full visibility across all requests for quotation in your organization." />
      {isLoading ? <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <div className="rounded-2xl border bg-card shadow-card">
          {(rfqs as RFQ[]).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="h-10 w-10 text-mute mb-3" />
              <p className="text-sm font-semibold text-heading">No RFQs yet</p>
              <p className="text-xs text-mute mt-1">RFQs created by your officers will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b label-tiny text-left">
                <th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Deadline</th><th className="px-5 py-3">Budget</th><th className="px-5 py-3">Status</th>
              </tr></thead>
              <tbody>
                {(rfqs as RFQ[]).map(r => (
                  <tr key={r.id} className="border-t hover:bg-[#F0F4F8]">
                    <td className="px-5 py-3 font-semibold text-heading max-w-[220px] truncate">{r.title}</td>
                    <td className="px-5 py-3 text-body text-xs">{r.category || "—"}</td>
                    <td className="px-5 py-3 text-body">{r.submission_deadline || "—"}</td>
                    <td className="px-5 py-3 text-body">{r.budget_max ? `₹${r.budget_max.toLocaleString("en-IN")}` : "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status?.toUpperCase()} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
