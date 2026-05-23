import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/vendor/rfqs")({ component: () => <Outlet /> });
