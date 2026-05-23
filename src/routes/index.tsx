import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, ShieldCheck, Sparkles, FileSearch, Users, Star, Check, Workflow, BadgeCheck, FileLock2, BrainCircuit } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProcuBase — The Enterprise Procurement Platform" },
      { name: "description", content: "Vendor onboarding, RFQ management, multi-role approvals, AI quote scoring, and complete audit compliance — in one secure platform." },
      { property: "og:title", content: "ProcuBase — Enterprise Procurement Platform" },
      { property: "og:description", content: "The backbone of enterprise procurement: RFQs, AI scoring, approvals, and audit trails." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center">
            <span className="text-[18px] font-bold" style={{ color: '#0A2540', letterSpacing: '-0.03em' }}>Procu<span style={{ color: '#635BFF' }}>Base</span></span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-body hover:text-heading">Features</a>
            <a href="#how" className="text-sm font-medium text-body hover:text-heading">How it works</a>
            <a href="#roles" className="text-sm font-medium text-body hover:text-heading">For your team</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden sm:inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-heading hover:bg-secondary">Sign in</Link>
            <Link to="/signup/organization" className="inline-flex h-9 items-center rounded-lg bg-gradient-primary px-4 text-sm font-semibold text-white shadow-card hover:opacity-90">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-body shadow-card">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Now with AI Smart Scoring
            </div>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-heading sm:text-6xl">
              The enterprise procurement platform
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-body">
              Streamline vendor onboarding, RFQ management, multi-role approvals, and audit compliance — all in one secure platform built for modern procurement teams.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup/organization" className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-primary px-6 text-sm font-semibold text-white shadow-card hover:opacity-90">
                Get started as Organization <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/signup/vendor" className="inline-flex h-12 items-center rounded-xl border bg-white px-6 text-sm font-semibold text-heading hover:bg-secondary">
                Register as Vendor
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-mute">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#0E9F6E]" /> SOC 2 compliant</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#0E9F6E]" /> 99.9% uptime</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#0E9F6E]" /> ISO 27001</span>
            </div>
          </div>
          <DashboardPreview />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-page">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          {[
            ["500+", "Organizations"], ["10,000+", "Vendors"],
            ["₹2B+", "Procurement Processed"], ["99.9%", "Platform Uptime"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-3xl font-extrabold text-heading">{v}</p>
              <p className="mt-1 text-sm text-body">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-tiny">Built for scale</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-heading">Everything procurement needs</h2>
          <p className="mt-3 text-body">From first RFQ to final invoice — the entire lifecycle, structured and auditable.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Workflow, title: "Multi-Role Workflows", body: "Vendor, Officer, Approver, Head, and Auditor — each with focused tools and role-based access." },
            { icon: BrainCircuit, title: "AI-Powered Quote Scoring", body: "Score and rank quotes across price, delivery, warranty, and vendor history in seconds." },
            { icon: FileLock2, title: "Secure Document Vault", body: "Encrypted document storage with role-based access and full chain-of-custody tracking." },
            { icon: ShieldCheck, title: "Complete Audit Trail", body: "Every action logged with actor, role, entity, and metadata for compliance-grade visibility." },
            { icon: Sparkles, title: "Smart RFQ Generation", body: "Describe what you need in plain language — AI drafts a structured, vendor-ready RFQ." },
            { icon: BadgeCheck, title: "Vendor Trust Scores", body: "Platform-verified vendors with performance ratings, reviews, and risk assessment." },
          ].map((f) => (
            <div key={f.title} className="group rounded-2xl border bg-card p-6 shadow-card transition hover:shadow-card-hover">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-heading">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-page py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="label-tiny">How it works</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-heading">From RFQ to PO in three steps</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["01", "Onboard & Verify", "Vendors register and submit business documents. Platform verification ensures trust before RFQs are exchanged."],
              ["02", "Request & Compare Quotes", "Officers create structured RFQs — manually or with AI. Approvers compare quotes side-by-side with AI scoring."],
              ["03", "Approve & Track Orders", "Approve, escalate, or return. POs are issued automatically, with full delivery and invoice tracking."],
            ].map(([n, t, b]) => (
              <div key={n} className="rounded-2xl border bg-card p-6 shadow-card">
                <p className="text-xs font-bold text-primary">{n}</p>
                <h3 className="mt-2 text-lg font-semibold text-heading">{t}</h3>
                <p className="mt-2 text-sm text-body">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="label-tiny">Built for every role</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-heading">One platform, five focused experiences</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {[
            { icon: Briefcase, name: "Vendor", body: "Quote, fulfill, and grow." },
            { icon: FileSearch, name: "Officer", body: "Create and route RFQs." },
            { icon: Star, name: "Approver", body: "Compare, score, decide." },
            { icon: Users, name: "Head", body: "Govern team and policy." },
            { icon: ShieldCheck, name: "Auditor", body: "Monitor and assure." },
          ].map((r) => (
            <div key={r.name} className="rounded-2xl border bg-card p-5 text-center shadow-card transition hover:shadow-card-hover">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                <r.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-heading">{r.name}</h3>
              <p className="mt-1 text-xs text-body">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-heading">Procurement, structured.</h2>
          <p className="mt-3 text-body">Bring your team and your vendors onto one auditable platform.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup/organization" className="inline-flex h-12 items-center rounded-xl bg-gradient-primary px-6 text-sm font-semibold text-white shadow-card hover:opacity-90">
              Start your organization
            </Link>
            <Link to="/login" className="inline-flex h-12 items-center rounded-xl border bg-white px-6 text-sm font-semibold text-heading hover:bg-secondary">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-bold" style={{ color: '#0A2540', letterSpacing: '-0.03em' }}>Procu<span style={{ color: '#635BFF' }}>Base</span></span>
            <span className="text-xs text-mute ml-2">© 2026 ProcuBase Inc.</span>
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-body">
            <a href="#" className="hover:text-heading">Privacy</a>
            <a href="#" className="hover:text-heading">Terms</a>
            <a href="#" className="hover:text-heading">Security</a>
            <a href="#" className="hover:text-heading">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-soft opacity-60 blur-2xl" />
      <div className="rounded-2xl border bg-white p-5 shadow-card-hover">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#FF6058]" />
            <div className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
            <div className="h-2 w-2 rounded-full bg-[#28C941]" />
            <p className="ml-3 text-xs font-medium text-mute">app.procubase.com/dashboard</p>

          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[["Active RFQs", "24", "+3"], ["Quotes", "147", "+12"], ["Approvals", "8", "Due"]].map(([l, v, t]) => (
            <div key={l} className="rounded-lg border bg-page p-3">
              <p className="text-[10px] uppercase tracking-wide font-semibold text-mute">{l}</p>
              <p className="mt-1.5 text-xl font-bold text-heading">{v}</p>
              <p className="text-[10px] text-[#0E9F6E] font-semibold mt-0.5">{t}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-heading">Recent RFQs</p>
            <p className="text-[10px] text-primary font-semibold">View all →</p>
          </div>
          {[
            ["Ergonomic Chairs", "Furniture", "UNDER_REVIEW", "#F5F3FF", "#5B21B6"],
            ["Enterprise Laptops", "IT Hardware", "SENT", "#ECFEFF", "#155E75"],
            ["Logistics Contract", "Logistics", "APPROVED", "#ECFDF5", "#065F46"],
          ].map(([t, c, s, bg, fg]) => (
            <div key={t} className="flex items-center justify-between border-t py-2.5 first:border-t-0 first:pt-0">
              <div>
                <p className="text-xs font-semibold text-heading">{t}</p>
                <p className="text-[10px] text-mute">{c}</p>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: bg, color: fg }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
