import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/app/Stub";
export const Route = createFileRoute("/approver/escalations")({ component: () => <StubPage title="Escalated Items" subtitle="Items you have escalated to the Procurement Head." /> });
