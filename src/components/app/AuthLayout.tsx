import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ShieldCheck, Sparkles, Workflow } from "lucide-react";

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden bg-gradient-soft lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link to="/" className="inline-flex items-center">
          <span className="text-[20px] font-bold" style={{ color: '#0A2540', letterSpacing: '-0.03em' }}>Procu<span style={{ color: '#635BFF' }}>Base</span></span>
        </Link>
        <div>
          <p className="label-tiny">The platform</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-heading">
            The backbone of enterprise procurement.
          </h2>
          <p className="mt-4 max-w-md text-body">Used by procurement teams across India to onboard vendors, run RFQs, and approve quotes with confidence.</p>
          <ul className="mt-8 space-y-3">
            {[
              [Workflow, "Multi-role workflows from request to delivery"],
              [Sparkles, "AI-assisted quote comparison & smart RFQ drafting"],
              [ShieldCheck, "SOC 2 compliant with full audit trails"],
              [Check, "Trusted by 500+ organizations and 10,000+ vendors"],
            ].map(([Icon, txt], i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-md bg-white shadow-card">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-body">{txt as string}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-mute">© 2026 ProcuBase Inc. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-flex items-center lg:hidden">
            <span className="text-[20px] font-bold" style={{ color: '#0A2540', letterSpacing: '-0.03em' }}>Procu<span style={{ color: '#635BFF' }}>Base</span></span>
          </Link>
          <div className="rounded-2xl border bg-card p-8 shadow-card">
            <h1 className="text-2xl font-bold tracking-tight text-heading">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-body">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-5 text-center text-sm text-body">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function Input({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-heading">{label}</label>
      <input
        {...props}
        className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-heading placeholder:text-[#94A3B8] focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)] ${error ? "border-[#DF1B41]" : ""}`}
      />
      {error && <p className="mt-1 text-xs text-[#DF1B41]">{error}</p>}
    </div>
  );
}

export function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 text-sm font-semibold text-white shadow-card transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}
