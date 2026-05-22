import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "#EEF2FF" }}>
        <Icon className="h-7 w-7" style={{ color: "#635BFF" }} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-heading">{title}</h3>
      {body && <p className="mt-1 max-w-md text-sm text-body">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
