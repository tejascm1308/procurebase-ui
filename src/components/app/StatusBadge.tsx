// Status is a plain string — no type import needed

const STATUS_STYLES: Record<string, { bg: string; fg: string; border: string; label?: string }> = {
  REGISTERED: { bg: "#F1F5F9", fg: "#475569", border: "#CBD5E1" },
  DRAFT: { bg: "#F1F5F9", fg: "#475569", border: "#CBD5E1" },
  PROFILE_INCOMPLETE: { bg: "#FFFBEB", fg: "#92400E", border: "#FCD34D", label: "Profile Incomplete" },
  PENDING_APPROVAL: { bg: "#FFFBEB", fg: "#92400E", border: "#FCD34D", label: "Pending Approval" },
  NEEDS_CLARIFICATION: { bg: "#FFF7ED", fg: "#9A3412", border: "#FDBA74", label: "Needs Clarification" },
  VERIFIED: { bg: "#ECFDF5", fg: "#065F46", border: "#6EE7B7" },
  APPROVED: { bg: "#ECFDF5", fg: "#065F46", border: "#6EE7B7" },
  SELECTED: { bg: "#ECFDF5", fg: "#065F46", border: "#6EE7B7" },
  COMPLETED: { bg: "#ECFDF5", fg: "#065F46", border: "#6EE7B7" },
  UNDER_REVIEW: { bg: "#F5F3FF", fg: "#5B21B6", border: "#C4B5FD", label: "Under Review" },
  IN_PROGRESS: { bg: "#F5F3FF", fg: "#5B21B6", border: "#C4B5FD", label: "In Progress" },
  SENT: { bg: "#ECFEFF", fg: "#155E75", border: "#67E8F9" },
  OPEN: { bg: "#ECFEFF", fg: "#155E75", border: "#67E8F9" },
  ISSUED: { bg: "#ECFEFF", fg: "#155E75", border: "#67E8F9" },
  DISPATCHED: { bg: "#ECFEFF", fg: "#155E75", border: "#67E8F9" },
  REJECTED: { bg: "#FFF1F2", fg: "#9F1239", border: "#FDA4AF" },
  SUSPENDED: { bg: "#FFF1F2", fg: "#9F1239", border: "#FDA4AF" },
  CANCELLED: { bg: "#FFF1F2", fg: "#9F1239", border: "#FDA4AF" },
  CLOSED: { bg: "#E5E7EB", fg: "#374151", border: "#9CA3AF" },
  DELIVERED: { bg: "#EFF6FF", fg: "#1E40AF", border: "#93C5FD" },
  WITHDRAWN: { bg: "#F3F4F6", fg: "#4B5563", border: "#D1D5DB" },
};

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${className}`}
      style={{ background: s.bg, color: s.fg, border: `1px solid ${s.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.fg }} />
      {s.label ?? status.replaceAll("_", " ")}
    </span>
  );
}
