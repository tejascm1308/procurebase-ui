import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { NotificationsList } from "@/components/app/NotificationsList";
export const Route = createFileRoute("/officer/notifications")({ component: () => (<div><PageHeader title="Notifications" /><NotificationsList /></div>) });
