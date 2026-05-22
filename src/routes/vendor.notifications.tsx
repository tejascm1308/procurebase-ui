import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { NotificationsList } from "@/components/app/NotificationsList";

export const Route = createFileRoute("/vendor/notifications")({ component: () => (
  <div><PageHeader title="Notifications" subtitle="Recent platform and procurement activity." /><NotificationsList /></div>
)});
