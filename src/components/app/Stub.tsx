import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";
import { Construction } from "lucide-react";
import type { ReactNode } from "react";

export function StubPage({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      {children ?? <EmptyState icon={Construction} title="Coming up next" body="This page is part of the platform and will populate with live data once your team starts using ProcureBase." />}
    </div>
  );
}
