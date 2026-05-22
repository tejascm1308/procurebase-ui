import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Clock } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { quotations } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/quotations/$id")({ component: QuoteDetail });

function QuoteDetail() {
  const { id } = useParams({ from: "/vendor/quotations/$id" });
  const q = quotations.find((x) => x.id === id) ?? quotations[0];
  return (
    <div>
      <Link to="/vendor/quotations" className="text-xs font-semibold text-primary hover:underline">← All quotations</Link>
      <PageHeader eyebrow={q.id} title={q.rfqTitle} subtitle={`Submitted to ${q.vendorName ? "—" : ""}`}
        actions={<><StatusBadge status={q.status} /><button onClick={() => toast.success("Edit mode enabled")} className="rounded-lg border bg-card px-3 h-10 text-xs font-semibold text-heading hover:bg-secondary">Edit Quotation</button><button onClick={() => toast.error("Quotation withdrawn")} className="rounded-lg border h-10 px-3 text-xs font-semibold" style={{ borderColor: "#FDA4AF", background: "#FFF1F2", color: "#9F1239" }}>Withdraw</button></>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold text-heading mb-4">Quotation Details</h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Unit Price", `₹${q.unitPrice.toLocaleString("en-IN")}`],
              ["Quantity", q.quantity.toString()],
              ["Total Amount", `₹${q.totalAmount.toLocaleString("en-IN")}`],
              ["Delivery Timeline", `${q.deliveryDays} days`],
              ["Payment Terms", q.paymentTerms],
              ["Warranty", q.warranty],
              ["Validity", q.validity],
              ["Documents", `${q.documents} attached`],
            ].map(([k, v]) => (
              <div key={k}><p className="label-tiny">{k}</p><p className="mt-1 text-sm font-semibold text-heading">{v}</p></div>
            ))}
          </dl>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h3 className="text-sm font-semibold text-heading mb-4">Status Timeline</h3>
          <ol className="space-y-4">
            {[
              ["Submitted", q.submittedAt, true],
              ["Under Review", "In progress", true],
              ["Decision", "Pending", q.status === "SELECTED" || q.status === "REJECTED"],
            ].map(([t, d, done], i) => (
              <li key={i} className="flex items-start gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? "bg-[#ECFDF5] text-[#0E9F6E]" : "bg-secondary text-mute"}`}>
                  {done ? <Check className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                </div>
                <div><p className="text-sm font-semibold text-heading">{t}</p><p className="text-xs text-mute">{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
