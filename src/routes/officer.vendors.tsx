import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/officer/vendors")({ component: OfficerVendorsLayout });

// Layout: renders the list (index) or the detail page ($id) via Outlet
function OfficerVendorsLayout() {
  return <Outlet />;
}
