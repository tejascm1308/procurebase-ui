import { Bell, FileText, CheckCircle2, AlertTriangle, Package, Truck } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from "@/lib/queries";
import type { Notification } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  rfq: Bell, quote: FileText, approval: CheckCircle2, po: Package, order: Truck, anomaly: AlertTriangle,
};
const TONES: Record<string, string> = {
  rfq: "#0570DE", quote: "#7C3AED", approval: "#0E9F6E", po: "#D97706", order: "#0570DE", anomaly: "#DF1B41",
};

import React from "react";

export function NotificationsList() {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll  = useMarkAllRead();

  const unread  = notifications.filter((n: Notification) => !n.is_read);
  const read    = notifications.filter((n: Notification) => n.is_read);
  const grouped: [string, Notification[]][] = [["New", unread], ["Earlier", read]];

  return (
    <div className="space-y-6">
      {unread.length > 0 && (
        <div className="flex justify-end">
          <button onClick={() => markAll.mutate()} className="text-xs font-semibold text-primary hover:underline">Mark all as read</button>
        </div>
      )}
      {grouped.map(([title, list]) => list.length > 0 && (
        <div key={title}>
          <p className="label-tiny mb-2">{title}</p>
          <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
            {list.map((n: Notification, i: number) => {
              const Icon = ICONS[n.type] ?? Bell;
              const color = TONES[n.type] || "#635BFF";
              return (
                <div key={n.id} onClick={() => !n.is_read && markRead.mutate(n.id)}
                  className={`flex items-start gap-3 p-4 ${i > 0 ? "border-t" : ""} hover:bg-page ${!n.is_read ? "cursor-pointer" : ""}`}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: color + "1A" }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-heading">{n.title}</p>
                      {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-body mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-mute mt-1">{n.created_at?.slice(0, 16).replace("T", " ")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {notifications.length === 0 && <p className="text-sm text-mute text-center py-10">No notifications yet.</p>}
    </div>
  );
}
