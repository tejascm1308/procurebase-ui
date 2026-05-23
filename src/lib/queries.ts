/**
 * ProcureBase — React Query hooks (typed)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { toast } from "sonner";
import type {
  Vendor, VendorDocument, RFQ, Quotation, PurchaseOrder,
  AuditLog, AnomalySignal, AuditSummary, Notification,
  Organization, TeamMember, AIRFQDraft, AIScoreResult, AIRiskResult,
} from "./types";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const QK = {
  me:               ["auth", "me"],
  myVendor:         ["vendor", "profile"],
  myVendorDocs:     ["vendor", "documents"],
  vendors:          (p?: object) => ["vendors", p],
  vendor:           (id: string) => ["vendors", id],
  approvedVendors:  ["vendors", "approved"],
  rfqs:             (p?: object) => ["rfqs", p],
  rfq:              (id: string) => ["rfqs", id],
  myQuotations:     (p?: object) => ["quotations", "my", p],
  myQuote:          (id: string) => ["quotations", "my", id],
  rfqQuotations:    (id: string) => ["quotations", "rfq", id],
  myOrders:         (p?: object) => ["orders", "my", p],
  myOrder:          (id: string) => ["orders", "my", id],
  orgOrders:        (p?: object) => ["orders", "org", p],
  orgOrder:         (id: string) => ["orders", "org", id],
  pendingApprovals: ["approvals", "pending"],
  approvalHistory:  ["approvals", "history"],
  escalations:      ["approvals", "escalations"],
  rfqDecision:      (id: string) => ["approvals", "decision", id],
  auditLogs:        (p?: object) => ["audit", "logs", p],
  anomalies:        (p?: object) => ["audit", "anomalies", p],
  auditSummary:     ["audit", "summary"],
  procAnalytics:    ["audit", "analytics"],
  notifications:    ["notifications"],
  unreadCount:      ["notifications", "unread-count"],
  orgProfile:       ["org", "profile"],
  team:             ["org", "team"],
  negotiationInfo:  (id: string) => ["rfqs", id, "negotiation-info"],
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export function useMe() {
  return useQuery({ queryKey: QK.me, queryFn: () => api.get("/api/auth/me"), retry: false, staleTime: 5 * 60_000 });
}

// ─── Vendor Profile ───────────────────────────────────────────────────────────
export function useMyVendorProfile() {
  return useQuery<Vendor>({ queryKey: QK.myVendor, queryFn: () => api.get<Vendor>("/api/vendors/me") });
}
export function useMyVendorDocuments() {
  return useQuery<VendorDocument[]>({ queryKey: QK.myVendorDocs, queryFn: () => api.get<VendorDocument[]>("/api/vendors/me/documents") });
}
export function useUpdateVendorProfile() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => api.put("/api/vendors/me", data), onSuccess: () => { qc.invalidateQueries({ queryKey: QK.myVendor }); toast.success("Profile updated"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useSubmitVendorProfile() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => api.post("/api/vendors/me/submit"), onSuccess: () => { qc.invalidateQueries({ queryKey: QK.myVendor }); toast.success("Profile submitted for approval"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useUploadVendorDocument() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (form: FormData) => api.upload("/api/vendors/me/documents", form), onSuccess: () => { qc.invalidateQueries({ queryKey: QK.myVendorDocs }); toast.success("Document uploaded"); }, onError: (e: Error) => toast.error(e.message) });
}

// ─── Vendor Directory ─────────────────────────────────────────────────────────
export function useVendors(params?: { search?: string; category?: string; status?: string; page?: number }) {
  // Strip undefined/null values so they never appear in the query string (e.g. search=undefined)
  const clean = Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  const qs = new URLSearchParams(clean as Record<string, string>).toString();
  return useQuery<Vendor[]>({ queryKey: QK.vendors(params), queryFn: () => api.get<Vendor[]>(`/api/vendors/${qs ? `?${qs}` : ""}`) });
}
export function useVendor(id: string) {
  return useQuery<Vendor>({ queryKey: QK.vendor(id), queryFn: () => api.get<Vendor>(`/api/vendors/${id}`), enabled: !!id });
}
export function useUpdateVendorStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: { vendor_id: string; new_status: string; review_note?: string }) => api.post("/api/vendors/status", data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendors"] }); toast.success("Status updated"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useRateVendor() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ vendorId, rating, review }: { vendorId: string; rating: number; review?: string }) => api.post(`/api/vendors/${vendorId}/rate?rating=${rating}&review=${encodeURIComponent(review || "")}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ["vendors"] }); toast.success("Rating submitted ✓"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useApprovedVendors() {
  return useQuery<any[]>({ queryKey: QK.approvedVendors, queryFn: () => api.get<any[]>("/api/vendors/approved") });
}

// ─── RFQs ────────────────────────────────────────────────────────────────────
export function useRFQs(params?: { status?: string; category?: string; search?: string; page?: number }) {
  const clean = Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  const qs = new URLSearchParams(clean as Record<string, string>).toString();
  return useQuery<RFQ[]>({ queryKey: QK.rfqs(params), queryFn: () => api.get<RFQ[]>(`/api/rfqs/${qs ? `?${qs}` : ""}`) });
}
export function useRFQ(id: string) {
  return useQuery<RFQ>({ queryKey: QK.rfq(id), queryFn: () => api.get<RFQ>(`/api/rfqs/${id}`), enabled: !!id });
}
export function useCreateRFQ() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => api.post("/api/rfqs/", data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["rfqs"] }); toast.success("RFQ created"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useUpdateRFQ() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.put(`/api/rfqs/${id}`, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["rfqs"] }); toast.success("RFQ updated"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useSendRFQ() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (rfqId: string) => api.post(`/api/rfqs/${rfqId}/send`), onSuccess: () => { qc.invalidateQueries({ queryKey: ["rfqs"] }); toast.success("RFQ sent to vendors"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useCloseRFQ() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (rfqId: string) => api.post(`/api/rfqs/${rfqId}/close`), onSuccess: () => { qc.invalidateQueries({ queryKey: ["rfqs"] }); toast.success("RFQ closed"); }, onError: (e: Error) => toast.error(e.message) });
}

// ─── Quotations ───────────────────────────────────────────────────────────────
export function useMyQuotations(params?: { page?: number }) {
  const clean = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])
  );
  const qs = new URLSearchParams(clean).toString();
  return useQuery<Quotation[]>({ queryKey: QK.myQuotations(params), queryFn: () => api.get<Quotation[]>(`/api/quotations/my${qs ? `?${qs}` : ""}`) });
}
export function useMyQuote(id: string) {
  return useQuery<Quotation>({ queryKey: QK.myQuote(id), queryFn: () => api.get<Quotation>(`/api/quotations/my/${id}`), enabled: !!id });
}
export function useRFQQuotations(rfqId: string) {
  return useQuery<Quotation[]>({ queryKey: QK.rfqQuotations(rfqId), queryFn: () => api.get<Quotation[]>(`/api/quotations/rfq/${rfqId}`), enabled: !!rfqId });
}
export function useSubmitQuotation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: Record<string, unknown>) => api.post("/api/quotations/", data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotations"] }); toast.success("Quotation submitted"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useWithdrawQuotation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (quoteId: string) => api.post(`/api/quotations/my/${quoteId}/withdraw`), onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotations"] }); toast.success("Quotation withdrawn"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useUploadQuoteDocument() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ quoteId, form }: { quoteId: string; form: FormData }) => api.upload(`/api/quotations/my/${quoteId}/documents`, form), onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotations"] }); toast.success("Document attached"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useMyQuotationForRFQ(rfqId: string) {
  return useQuery<Quotation | undefined>({
    queryKey: ["quotations", "my", "for-rfq", rfqId],
    queryFn: async () => {
      const quotes = await api.get<Quotation[]>("/api/quotations/my");
      const forRfq = (quotes as any[]).filter((q: any) => q.rfq_id === rfqId);
      // Prefer active (non-withdrawn) quote; if all withdrawn, return the latest withdrawn one
      return forRfq.find((q: any) => q.status !== "withdrawn") ?? forRfq[0];
    },
    enabled: !!rfqId,
  });
}
export function useUpdateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quoteId, data }: { quoteId: string; data: Record<string, unknown> }) =>
      api.put(`/api/quotations/my/${quoteId}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotations"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Approvals ────────────────────────────────────────────────────────────────
export function usePendingApprovals() {
  return useQuery<RFQ[]>({ queryKey: QK.pendingApprovals, queryFn: () => api.get<RFQ[]>("/api/approvals/pending") });
}
export function useApprovalHistory() {
  return useQuery<AuditLog[]>({ queryKey: QK.approvalHistory, queryFn: () => api.get<AuditLog[]>("/api/approvals/history") });
}
export function useEscalations() {
  return useQuery<RFQ[]>({ queryKey: QK.escalations, queryFn: () => api.get<RFQ[]>("/api/approvals/escalations") });
}
export function useRecordDecision() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: { rfq_id: string; selected_quote_id: string; decision: string; notes?: string; escalation_reason?: string }) => api.post("/api/approvals/decide", data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["rfqs"] }); qc.invalidateQueries({ queryKey: ["approvals"] }); toast.success("Decision recorded"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useRFQDecision(rfqId: string) {
  return useQuery<any[]>({ queryKey: QK.rfqDecision(rfqId), queryFn: () => api.get<any[]>(`/api/approvals/decision/${rfqId}`), enabled: !!rfqId });
}
export function useHeadDecideEscalation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: { rfq_id: string; selected_quote_id: string; decision: string; notes?: string }) => api.post("/api/approvals/escalations/decide", data), onSuccess: () => { qc.invalidateQueries({ queryKey: ["approvals"] }); qc.invalidateQueries({ queryKey: ["rfqs"] }); toast.success("Decision recorded"); }, onError: (e: Error) => toast.error(e.message) });
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export function useMyOrders(params?: { status?: string; page?: number }) {
  const clean = Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  const qs = new URLSearchParams(clean as Record<string, string>).toString();
  return useQuery<PurchaseOrder[]>({ queryKey: QK.myOrders(params), queryFn: () => api.get<PurchaseOrder[]>(`/api/orders/my${qs ? `?${qs}` : ""}`) });
}
export function useMyOrder(id: string) {
  return useQuery<PurchaseOrder>({ queryKey: QK.myOrder(id), queryFn: () => api.get<PurchaseOrder>(`/api/orders/my/${id}`), enabled: !!id });
}
export function useOrgOrders(params?: { status?: string; page?: number }) {
  const clean = Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  const qs = new URLSearchParams(clean as Record<string, string>).toString();
  return useQuery<PurchaseOrder[]>({ queryKey: QK.orgOrders(params), queryFn: () => api.get<PurchaseOrder[]>(`/api/orders/${qs ? `?${qs}` : ""}`) });
}
export function useOrgOrder(id: string) {
  return useQuery<PurchaseOrder>({ queryKey: QK.orgOrder(id), queryFn: () => api.get<PurchaseOrder>(`/api/orders/${id}`), enabled: !!id });
}
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ poId, new_status, notes }: { poId: string; new_status: string; notes?: string }) => api.post(`/api/orders/my/${poId}/status`, { new_status, notes }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); toast.success("Order status updated"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useUploadInvoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ poId, form }: { poId: string; form: FormData }) => api.upload(`/api/orders/my/${poId}/invoice`, form), onSuccess: () => { qc.invalidateQueries({ queryKey: ["orders"] }); toast.success("Invoice uploaded"); }, onError: (e: Error) => toast.error(e.message) });
}

// ─── Audit ────────────────────────────────────────────────────────────────────
export function useAuditLogs(params?: { event_type?: string; actor_role?: string; entity_type?: string; actor_name?: string; from_date?: string; to_date?: string; page_size?: number }) {
  const clean = Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== "")) as Record<string, string>;
  const qs = new URLSearchParams(clean).toString();
  return useQuery<AuditLog[]>({ queryKey: QK.auditLogs(params), queryFn: () => api.get<AuditLog[]>(`/api/audit/logs${qs ? `?${qs}` : ""}`) });
}

export function useAnomalies(params?: { reviewed?: boolean; severity?: string; page?: number }) {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return useQuery<AnomalySignal[]>({ queryKey: QK.anomalies(params), queryFn: () => api.get<AnomalySignal[]>(`/api/audit/anomalies${qs ? `?${qs}` : ""}`) });
}
export function useAuditSummary() {
  return useQuery<AuditSummary>({ queryKey: QK.auditSummary, queryFn: () => api.get<AuditSummary>("/api/audit/summary"), staleTime: 60_000 });
}
export function useProcurementAnalytics() {
  return useQuery<any>({ queryKey: QK.procAnalytics, queryFn: () => api.get<any>("/api/audit/analytics"), staleTime: 60_000 });
}
export function useMarkAnomalyReviewed() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (anomalyId: string) => api.post(`/api/audit/anomalies/${anomalyId}/review`), onSuccess: () => { qc.invalidateQueries({ queryKey: ["audit"] }); toast.success("Anomaly reviewed"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useAuditRFQs() {
  return useQuery<any[]>({ queryKey: ["audit", "rfqs"], queryFn: () => api.get<any[]>("/api/audit/rfqs"), staleTime: 30_000 });
}
export function useRFQTimeline(rfqId: string) {
  return useQuery<any>({ queryKey: ["audit", "rfq-timeline", rfqId], queryFn: () => api.get<any>(`/api/audit/rfq-timeline/${rfqId}`), enabled: !!rfqId });
}
export function useRunScan() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => api.post<any>("/api/audit/scan", {}), onSuccess: () => { qc.invalidateQueries({ queryKey: ["audit"] }); toast.success("Scan complete"); }, onError: (e: Error) => toast.error(e.message) });
}

export function useAIDeepScan() {
  return useMutation({
    mutationFn: (focusArea?: string) => api.post<any>("/api/ai/detect-anomalies", { focus_area: focusArea ?? "" }),


    onError: (e: Error) => toast.error(`AI scan failed: ${e.message}`),
  });
}


// ─── Notifications ────────────────────────────────────────────────────────────
export function useNotifications(unreadOnly = false) {
  return useQuery<Notification[]>({ queryKey: [...QK.notifications, unreadOnly], queryFn: () => api.get<Notification[]>(`/api/notifications?unread_only=${unreadOnly}`), refetchInterval: 30_000 });
}
export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: QK.unreadCount,
    queryFn: () => api.get<{ count: number }>("/api/notifications/unread-count"),
    refetchInterval: 30_000,
    select: (d) => d,
  });
}
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.post(`/api/notifications/${id}/read`), onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
}
export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => api.post("/api/notifications/read-all"), onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); toast.success("All marked as read"); } });
}

// ─── Organization ─────────────────────────────────────────────────────────────
export function useOrgProfile() {
  return useQuery<Organization>({ queryKey: QK.orgProfile, queryFn: () => api.get<Organization>("/api/org/me") });
}
export function useTeam() {
  return useQuery<TeamMember[]>({ queryKey: QK.team, queryFn: () => api.get<TeamMember[]>("/api/org/team/") });
}
export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: { email: string; role: string; full_name?: string }) => api.post("/api/org/team/", data), onSuccess: () => { qc.invalidateQueries({ queryKey: QK.team }); toast.success("Member added"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: { member_id: string; new_role: string }) => api.put("/api/org/team/role", data), onSuccess: () => { qc.invalidateQueries({ queryKey: QK.team }); toast.success("Role updated"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useDeactivateMember() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (memberId: string) => api.delete(`/api/org/team/${memberId}`), onSuccess: () => { qc.invalidateQueries({ queryKey: QK.team }); toast.success("Member deactivated"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useActivateMember() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (memberId: string) => api.post(`/api/org/team/${memberId}/activate`), onSuccess: () => { qc.invalidateQueries({ queryKey: QK.team }); toast.success("Member reactivated"); }, onError: (e: Error) => toast.error(e.message) });
}
export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (memberId: string) => api.delete(`/api/org/team/${memberId}/remove`), onSuccess: () => { qc.invalidateQueries({ queryKey: QK.team }); toast.success("Member permanently removed"); }, onError: (e: Error) => toast.error(e.message) });
}

// ─── AI ───────────────────────────────────────────────────────────────────────
export function useAIGenerateRFQ() {
  return useMutation<AIRFQDraft, Error, string>({ mutationFn: (requirement_text) => api.post<AIRFQDraft>("/api/ai/generate-rfq", { requirement_text }), onError: (e) => toast.error(e.message) });
}
export function useAIScoreQuotes() {
  return useMutation<AIScoreResult, Error, string>({ mutationFn: (rfq_id) => api.post<AIScoreResult>("/api/ai/score-quotes", { rfq_id }), onError: (e) => toast.error(e.message) });
}
export function useAIAssessRisk() {
  return useMutation<AIRiskResult, Error, string>({ mutationFn: (vendor_id) => api.post<AIRiskResult>("/api/ai/assess-risk", { vendor_id }), onError: (e) => toast.error(e.message) });
}

// ─── Auth Mutations ────────────────────────────────────────────────────────────
export function useRegisterVendor() {
  return useMutation({ mutationFn: (data: { legal_name: string; email: string; password: string }) => api.post("/api/auth/register/vendor", data), onError: (e: Error) => toast.error(e.message) });
}
export function useRegisterOrganization() {
  return useMutation({ mutationFn: (data: { name: string; org_type: string; email: string; password: string }) => api.post("/api/auth/register/organization", data), onError: (e: Error) => toast.error(e.message) });
}
export function useRegisterMember() {
  return useMutation({ mutationFn: (data: { org_name: string; email: string; password: string; signup_key: string }) => api.post("/api/auth/register/member", data), onError: (e: Error) => toast.error(e.message) });
}
export function useVerifyOTP() {
  return useMutation({ mutationFn: (data: { email: string; otp_code: string; purpose?: string }) => api.post("/api/auth/verify-otp", data), onError: (e: Error) => toast.error(e.message) });
}
export function useResendOTP() {
  return useMutation({ mutationFn: (data: { email: string; purpose?: string }) => api.post("/api/auth/resend-otp", data), onSuccess: () => toast.success("OTP resent"), onError: (e: Error) => toast.error(e.message) });
}
export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => api.post("/api/auth/forgot-password", { email }), onSuccess: () => toast.success("Reset code sent"), onError: (e: Error) => toast.error(e.message) });
}
export function useResetPassword() {
  return useMutation({ mutationFn: (data: { email: string; otp_code: string; new_password: string }) => api.post("/api/auth/reset-password", data), onSuccess: () => toast.success("Password reset successfully"), onError: (e: Error) => toast.error(e.message) });
}
export function useVerifyGSTIN() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gstin: string) => api.post("/api/org/me/verify-gstin", { gstin }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK.orgProfile }); toast.success("GSTIN verified! Your workspace is now active."); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Negotiation ─────────────────────────────────────────────────────────────
export function useNegotiate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { rfq_id: string; quotation_id: string; message: string }) =>
      api.post("/api/approvals/negotiate", data),
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: QK.rfq(vars.rfq_id) });
      qc.invalidateQueries({ queryKey: QK.rfqQuotations(vars.rfq_id) });
      qc.invalidateQueries({ queryKey: QK.pendingApprovals });
      qc.invalidateQueries({ queryKey: QK.escalations });
      toast.success("Negotiation request sent to officer ✓");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useForwardNegotiation(rfqId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { quotation_id: string; vendor_message: string }) =>
      api.post(`/api/rfqs/${rfqId}/forward-negotiation`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.rfq(rfqId) });
      qc.invalidateQueries({ queryKey: QK.rfqQuotations(rfqId) });
      qc.invalidateQueries({ queryKey: QK.negotiationInfo(rfqId) });
      toast.success("Negotiation forwarded to vendor ✓");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useNegotiationInfo(rfqId: string) {
  return useQuery<any>({
    queryKey: QK.negotiationInfo(rfqId),
    queryFn: () => api.get(`/api/rfqs/${rfqId}/negotiation-info`),
    enabled: !!rfqId,
    staleTime: 30_000,
  });
}

export function useUpdateMyQuote(quoteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put(`/api/quotations/my/${quoteId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.myQuotations() });
      qc.invalidateQueries({ queryKey: ["quotations", "my", quoteId] });
      toast.success("Quotation updated successfully ✓");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

