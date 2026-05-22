import { Bell, FileText, CheckCircle2, AlertTriangle, Package, Truck } from "lucide-react";
import { notifications } from "@/lib/mock-data";

const ICONS: Record<string, any> = { rfq: Bell, quote: FileText, approval: CheckCircle2, po: Package, order: Truck, anomaly: AlertTriangle };
const TONES: Record<string, string> = { rfq: "#0570DE", quote: "#7C3AED", approval: "#0E9F6E", po: "#D97706", order: "#0570DE", anomaly: "#DF1B41" };

export function NotificationsList() {
  const grouped = { Today: notifications.filter((n) => !n.read), Earlier: notifications.filter((n) => n.read) };
  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([title, list]) => list.length > 0 && (
        <div key={title}>
          <p className="label-tiny mb-2">{title}</p>
          <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
            {list.map((n, i) => {
              const Icon = ICONS[n.type] ?? Bell;
              return (
                <div key={n.id} className={`flex items-start gap-3 p-4 ${i > 0 ? "border-t" : ""} hover:bg-page`}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: TONES[n.type] + "1A" }}>
                    <Icon className="h-4 w-4" style={{ color: TONES[n.type] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-heading">{n.title}</p>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-body mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-mute mt-1">{n.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
