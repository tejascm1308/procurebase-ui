import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useMyQuotations, useWithdrawQuotation } from "@/lib/queries";
import { FileText } from "lucide-react";
import type { Quotation } from "@/lib/types";

export const Route = createFileRoute("/vendor/quotations")({ component: VendorQuotations });

function VendorQuotations() {
  const { data: quotes = [], isLoading } = useMyQuotations();
  const withdrawMutation = useWithdrawQuotation();

  return (
    <div>
      <PageHeader title="My Quotations" subtitle="Track all quotations you've submitted across RFQs." />
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border bg-card">
          <FileText className="h-10 w-10 text-mute mb-3" />
          <p className="text-sm font-semibold text-heading">No quotations yet</p>
          <p className="text-xs text-mute mt-1">Submit a quotation from the <Link to="/vendor/rfqs" className="text-primary hover:underline">RFQ Inbox</Link>.</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left label-tiny">
              <th className="px-5 py-3">RFQ</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Total Amount</th><th className="px-5 py-3">Delivery</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th>
            </tr></thead>
            <tbody>
              {(quotes as Quotation[]).map((q) => (
                <tr key={q.id} className="border-t hover:bg-[#F0F4F8]">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-heading">{q.rfqs?.title ?? "—"}</p>
                    <p className="text-xs text-mute font-mono">{q.id.slice(0, 8)}…</p>
                  </td>
                  <td className="px-5 py-3 text-body">{q.created_at.slice(0, 10)}</td>
                  <td className="px-5 py-3 font-semibold text-heading">₹{q.total_amount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-body">{q.delivery_days} days</td>
                  <td className="px-5 py-3"><StatusBadge status={q.status.toUpperCase()} /></td>
                  <td className="px-5 py-3 flex items-center gap-2">
                    <Link to="/vendor/rfqs/$id" params={{ id: (q as any).rfq_id }} className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-heading hover:bg-secondary">View Quote →</Link>
                    {["submitted", "draft"].includes(q.status) && (
                      <button onClick={() => withdrawMutation.mutate(q.id)} disabled={withdrawMutation.isPending} className="text-xs font-semibold text-[#DF1B41] hover:underline">Withdraw</button>
                    )}
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
