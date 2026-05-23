import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route — renders either the list (index) or the detail ($id) child.
export const Route = createFileRoute("/vendor/orders")({ component: () => <Outlet /> });
