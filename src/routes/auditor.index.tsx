import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auditor/")({
  beforeLoad: () => { throw redirect({ to: "/auditor/overview" }); },
  component: () => null,
});
