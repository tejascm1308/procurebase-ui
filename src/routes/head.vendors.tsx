import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useOrgOrders, useRateVendor, useApprovedVendors } from "@/lib/queries";
import { Star, Building2, Search, X, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PurchaseOrder } from "@/lib/types";

export const Route = createFileRoute("/head/vendors")({ component: HeadVendors });

// ─── Rating Modal ────────────────────────────────────────────────────────────
function RateModal({ vendorId, vendorName, onClose }: { vendorId: string; vendorName: string; onClose: () => void }) {
  const ratingMutation = useRateVendor();
  const [stars, setStars]   = useState(0);
  const [hover, setHover]   = useState(0);
  const [review, setReview] = useState("");

  const submit = async () => {
    if (!stars) { toast.error("Please select a star rating"); return; }
    await ratingMutation.mutateAsync({ vendorId, rating: stars, review });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,37,64,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-heading">Rate Vendor</h2>
            <p className="text-xs text-mute mt-0.5">Performance review for <span className="font-semibold text-primary">{vendorName}</span></p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-mute hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Stars */}
          <div>
            <p className="text-xs font-semibold text-heading mb-2">Overall Rating *</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s}
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  className="p-0.5">
                  <Star className={`h-8 w-8 transition-colors ${s <= (hover || stars) ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#E2E8F0] hover:text-[#F59E0B]"}`} />
                </button>
              ))}
            </div>
            {stars > 0 && (
              <p className="text-xs text-mute mt-1">
                {["", "Poor", "Below Average", "Average", "Good", "Excellent"][stars]}
              </p>
            )}
          </div>

          {/* Review comment */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-heading">Review Comment <span className="text-mute font-normal">(optional)</span></label>
            <textarea value={review} onChange={e => setReview(e.target.value)} rows={3}
              placeholder="Describe the vendor's performance, quality, delivery punctuality…"
              className="w-full rounded-lg border bg-white p-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button onClick={onClose}
              className="h-10 rounded-lg border px-4 text-sm font-semibold text-heading hover:bg-secondary">Cancel</button>
            <button onClick={submit} disabled={!stars || ratingMutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-primary px-5 text-sm font-semibold text-white shadow-card disabled:opacity-60">
              {ratingMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit Rating"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function HeadVendors() {
  const [search, setSearch]             = useState("");
  const [ratingTarget, setRatingTarget] = useState<{ id: string; name: string } | null>(null);
  const { data: orders = [], isLoading }   = useOrgOrders();
  const { data: approvedQuotes = [] }      = useApprovedVendors();

  // Deduplicate approved vendors from selected quotations
  const approvedVendorMap = new Map<string, { id: string; name: string; rfqTitle: string; totalAmount: number }>();
  (approvedQuotes as any[]).forEach(q => {
    if (!q.vendor_id || approvedVendorMap.has(q.vendor_id)) return;
    approvedVendorMap.set(q.vendor_id, {
      id: q.vendor_id,
      name: q.vendors?.legal_name ?? "Vendor",
      rfqTitle: q.rfqs?.title ?? "—",
      totalAmount: q.total_amount ?? 0,
    });
  });
  const approvedVendors = Array.from(approvedVendorMap.values());

  // Build vendor map from orders — only vendors involved in our procurement
  const vendorMap = new Map<string, {
    id: string; name: string; rating: number; categories: string[];
    totalOrders: number; latestStatus: string; totalSpend: number;
  }>();

  (orders as PurchaseOrder[]).forEach(o => {
    if (!o.vendor_id) return;
    const vName   = (o as any).vendors?.legal_name          ?? "Unknown";
    const vRating = (o as any).vendors?.avg_rating           ?? 0;
    const vCats   = (o as any).vendors?.industry_categories  ?? [];
    const amount  = o.total_amount ?? 0;

    if (!vendorMap.has(o.vendor_id)) {
      vendorMap.set(o.vendor_id, {
        id: o.vendor_id, name: vName, rating: vRating, categories: vCats,
        totalOrders: 1, latestStatus: o.status, totalSpend: amount,
      });
    } else {
      const ex = vendorMap.get(o.vendor_id)!;
      ex.totalOrders += 1;
      ex.totalSpend  += amount;
      if (["in_progress", "dispatched", "issued"].includes(o.status)) ex.latestStatus = o.status;
    }
  });

  const vendors = Array.from(vendorMap.values()).filter(v =>
    !search || v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {ratingTarget && (
        <RateModal
          vendorId={ratingTarget.id}
          vendorName={ratingTarget.name}
          onClose={() => setRatingTarget(null)}
        />
      )}

      <PageHeader
        title="Vendor Performance"
        subtitle="Vendors currently or previously engaged in your organization's procurement. Rate them after orders are completed."
      />

      {/* Approved Quotations — Rate Vendors */}
      {approvedVendors.length > 0 && (
        <div className="mb-6 rounded-2xl border bg-card shadow-card overflow-hidden">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <CheckCircle className="h-4 w-4 text-[#065F46]" />
            <h3 className="text-sm font-semibold text-heading">Approved Quotations — Rate Vendors</h3>
            <span className="rounded-full bg-[#ECFDF5] border border-[#6EE7B7] px-2 py-0.5 text-[11px] font-bold text-[#065F46]">{approvedVendors.length}</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b label-tiny text-left bg-[#F8FAFC]">
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">RFQ</th>
                <th className="px-5 py-3">Quote Value</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedVendors.map(v => (
                <tr key={v.id} className="border-t hover:bg-[#F0F4F8] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#635BFF] to-[#0570DE] text-[10px] font-bold text-white">
                        {v.name.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <p className="font-semibold text-heading">{v.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-body">{v.rfqTitle}</td>
                  <td className="px-5 py-3 text-xs font-semibold text-heading">₹{v.totalAmount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => setRatingTarget({ id: v.id, name: v.name })}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Rate Vendor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Search */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by vendor name…"
            className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]"
          />
        </div>
        <p className="ml-auto text-xs text-mute">{vendors.length} vendor{vendors.length !== 1 ? "s" : ""}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex flex-col items-center py-20 rounded-2xl border bg-card text-center">
          <Building2 className="h-10 w-10 text-mute mb-3" />
          <p className="text-sm font-semibold text-heading">No vendors yet</p>
          <p className="text-xs text-mute mt-1 max-w-xs">
            {search
              ? "No vendors match your search."
              : "Vendors engaged in your procurement will appear here once purchase orders are issued."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b label-tiny text-left bg-[#F8FAFC]">
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Categories</th>
                <th className="px-5 py-3">Avg. Rating</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Total Spend</th>
                <th className="px-5 py-3">Latest Status</th>
                <th className="px-5 py-3">Rate</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v.id} className="border-t hover:bg-[#F0F4F8] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#635BFF] to-[#0570DE] text-[10px] font-bold text-white">
                        {v.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <p className="font-semibold text-heading">{v.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-body max-w-[180px]">
                    {v.categories.slice(0, 2).join(", ") || "—"}
                    {v.categories.length > 2 && <span className="text-mute"> +{v.categories.length - 2}</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 font-semibold text-heading">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      {v.rating?.toFixed(1) ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-heading">{v.totalOrders}</td>
                  <td className="px-5 py-3 text-body">₹{v.totalSpend.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3"><StatusBadge status={v.latestStatus?.toUpperCase()} /></td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => setRatingTarget({ id: v.id, name: v.name })}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Rate
                    </button>
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
