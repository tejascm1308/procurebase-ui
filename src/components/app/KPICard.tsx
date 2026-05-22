import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  tone?: "indigo" | "amber" | "green" | "violet" | "blue" | "rose";
}

const TONES: Record<NonNullable<Props["tone"]>, { bg: string; fg: string }> = {
  indigo: { bg: "#EEF2FF", fg: "#635BFF" },
  amber: { bg: "#FFFBEB", fg: "#D97706" },
  green: { bg: "#ECFDF5", fg: "#0E9F6E" },
  violet: { bg: "#F5F3FF", fg: "#7C3AED" },
  blue: { bg: "#EFF6FF", fg: "#0570DE" },
  rose: { bg: "#FFF1F2", fg: "#DF1B41" },
};

export function KPICard({ icon: Icon, label, value, trend, tone = "indigo" }: Props) {
  const t = TONES[tone];
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card transition hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-tiny">{label}</p>
          <p className="mt-3 text-2xl font-bold text-heading">{value}</p>
          {trend && <p className="mt-1 text-xs text-mute">{trend}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: t.bg }}>
          <Icon className="h-5 w-5" style={{ color: t.fg }} />
        </div>
      </div>
    </div>
  );
}
