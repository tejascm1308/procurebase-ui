import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { vendors } from "@/lib/mock-data";
import { Search, BadgeCheck, MapPin } from "lucide-react";

export const Route = createFileRoute("/officer/vendors")({ component: () => (
  <div>
    <PageHeader title="Vendor Search" subtitle="Find verified vendors across categories and locations." />
    <div className="mb-5 flex gap-3">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" /><input className="h-11 w-full rounded-lg border bg-card pl-10 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]" placeholder="Search by name, category or location…" /></div>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {vendors.map(v => (
        <Link key={v.id} to="/officer/vendors/$id" params={{id:v.id}} className="rounded-2xl border bg-card p-5 shadow-card transition hover:shadow-card-hover">
          <div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent font-bold text-primary">{v.name.charAt(0)}</div>{v.verified && <BadgeCheck className="h-5 w-5 text-[#0E9F6E]" />}</div>
          <h3 className="mt-3 text-sm font-bold text-heading">{v.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-mute"><MapPin className="h-3 w-3" /> {v.location}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{v.categories.map(c => <span key={c} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-body">{c}</span>)}</div>
          <div className="mt-4 flex items-center justify-between"><p className="text-xs text-body">⭐ {v.rating} <span className="text-mute">({v.reviews})</span></p><StatusBadge status={v.status}/></div>
        </Link>
      ))}
    </div>
  </div>
)});
