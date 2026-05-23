import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { useVendors } from "@/lib/queries";
import { Search, Star, Building2, ChevronDown, SlidersHorizontal, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Vendor } from "@/lib/types";

export const Route = createFileRoute("/officer/vendors/")({ component: OfficerVendorsList });

const DOMAINS = [
  "All Categories",
  "Furniture", "IT Hardware", "Electronics", "Office Supplies",
  "Logistics", "Machinery", "Construction", "Chemicals",
  "Food & Beverage", "Textiles", "Healthcare", "Consulting",
];

function StarRating({ value }: { value: number }) {
  const rounded = Math.round(value || 0);
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`h-3 w-3 ${s <= rounded ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#E2E8F0]"}`} />
      ))}
    </div>
  );
}

function VendorCard({ v }: { v: Vendor }) {
  const initials = (v.legal_name || "V").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const cats     = (v.industry_categories || []).slice(0, 2);
  const extraCats = (v.industry_categories || []).length - 2;

  return (
    <div className="group rounded-2xl border bg-card p-5 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#635BFF] to-[#0570DE] text-sm font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-heading truncate">{v.legal_name}</p>
          <p className="text-xs text-mute">{[v.city, v.state].filter(Boolean).join(", ") || "Location not set"}</p>
        </div>
        <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${v.status === "verified" ? "bg-[#ECFDF5] text-[#0E9F6E]" : "bg-[#FFF8E1] text-[#F59E0B]"}`}>
          {v.status === "verified" ? "✓ Verified" : v.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {cats.map(c => (
          <span key={c} className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-primary">{c}</span>
        ))}
        {extraCats > 0 && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-mute">+{extraCats} more</span>}
        {cats.length === 0 && <span className="text-[11px] text-mute">No categories listed</span>}
      </div>

      <div className="flex items-center justify-between text-xs text-body mb-4">
        <div className="flex items-center gap-1.5">
          <StarRating value={v.avg_rating || 0} />
          <span className="font-semibold text-heading">{v.avg_rating?.toFixed(1) ?? "—"}</span>
          <span className="text-mute">({v.total_ratings ?? 0})</span>
        </div>
        <span className="text-mute">{v.completed_orders ?? 0} orders</span>
      </div>

      <Link to="/officer/vendors/$id" params={{ id: v.id }}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 py-2 text-xs font-semibold text-primary hover:bg-accent transition-colors">
        View Profile & Request Quote <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function OfficerVendorsList() {
  const [search, setSearch]     = useState("");
  const [domain, setDomain]     = useState("All Categories");
  const [showDrop, setShowDrop] = useState(false);

  const { data: vendors = [], isLoading } = useVendors({ search });

  const filtered = (vendors as Vendor[]).filter(v => {
    if (domain === "All Categories") return true;
    return (v.industry_categories || []).includes(domain);
  });

  return (
    <div>
      <PageHeader title="Vendor Directory" subtitle="Browse verified vendors, view their profiles and request quotes." />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, city…"
            className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]"
          />
        </div>

        <div className="relative">
          <button onClick={() => setShowDrop(!showDrop)}
            className="flex h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-semibold text-heading hover:border-primary">
            <SlidersHorizontal className="h-4 w-4 text-mute" />
            {domain}
            <ChevronDown className={`h-4 w-4 text-mute transition-transform ${showDrop ? "rotate-180" : ""}`} />
          </button>
          {showDrop && (
            <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-xl border bg-white shadow-lg py-1 max-h-64 overflow-y-auto">
              {DOMAINS.map(d => (
                <button key={d} onClick={() => { setDomain(d); setShowDrop(false); }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary ${domain === d ? "font-semibold text-primary" : "text-body"}`}>
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="ml-auto text-xs text-mute">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Building2 className="h-10 w-10 text-mute mb-3" />
          <p className="text-sm font-semibold text-heading">No vendors found</p>
          <p className="text-xs text-mute mt-1">Try a different search or category filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(v => <VendorCard key={v.id} v={v as Vendor} />)}
        </div>
      )}
    </div>
  );
}
