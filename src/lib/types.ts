/**
 * ProcureBase — Shared API types
 * These mirror the Supabase / FastAPI response shapes.
 * Using `any` where the shape is dynamic (metadata, joined relations).
 */

export interface Vendor {
  id: string;
  legal_name: string;
  business_email: string;
  business_type?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  msme_number?: string;
  industry_categories?: string[];
  description?: string;
  website?: string;
  phone?: string;
  landline?: string;
  additional_email?: string;
  registered_address?: string;
  operational_address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  date_of_incorporation?: string;
  bank_name?: string;
  ifsc_code?: string;
  account_number?: string;
  account_holder_name?: string;
  account_type?: string;
  avg_rating?: number;
  total_ratings?: number;
  completed_orders?: number;
  status: string;
  documents?: VendorDocument[];
  signed_url?: string;
}

export interface VendorDocument {
  id: string;
  vendor_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  bucket: string;
  status: string;
  signed_url?: string;
  created_at: string;
}

export interface RFQ {
  id: string;
  org_id: string;
  created_by?: string;
  title: string;
  description?: string;
  category: string;
  specifications?: string;
  quantity: number;
  unit_of_measurement: string;
  delivery_location?: string;
  delivery_deadline: string;
  submission_deadline: string;
  budget_min?: number;
  budget_max?: number;
  special_conditions?: string;
  distribution_type: string;
  status: string;
  quotes_received?: number;
  sent_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Quotation {
  id: string;
  rfq_id: string;
  vendor_id: string;
  unit_price: number;
  quantity: number;
  total_amount: number;
  delivery_days: number;
  validity_date?: string;
  payment_terms?: string;
  warranty_terms?: string;
  delivery_terms?: string;
  notes?: string;
  version: number;
  status: string;
  created_at: string;
  updated_at?: string;
  rfqs?: RFQ;
  vendors?: Vendor;
  documents?: QuotationDocument[];
}

export interface QuotationDocument {
  id: string;
  quotation_id: string;
  file_name: string;
  file_path: string;
  bucket: string;
  signed_url?: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  rfq_id: string;
  quotation_id: string;
  org_id: string;
  vendor_id: string;
  total_amount: number;
  status: string;
  delivery_deadline?: string;
  created_at: string;
  updated_at?: string;
  rfqs?: RFQ;
  quotations?: Quotation;
  vendors?: Vendor;
  organizations?: Organization;
  invoices?: Invoice[];
}

export interface Invoice {
  id: string;
  po_id: string;
  vendor_id: string;
  file_name: string;
  file_path: string;
  bucket: string;
  signed_url?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  org_type: string;
  email: string;
  gstin: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  status: string;
  head_user_id?: string;
}

export interface TeamMember {
  id: string;
  org_id: string;
  user_id?: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  join_status?: string;   // "created" | "joined"
  added_by?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  actor_id?: string;
  actor_role?: string;
  actor_name?: string;          // enriched by backend
  org_id?: string;
  vendor_id?: string;
  entity_type?: string;
  entity_id?: string;
  prev_state?: string;
  new_state?: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
  description?: string;         // enriched by backend
  created_at: string;
}

export interface AnomalySignal {
  id: string;
  org_id?: string;
  vendor_id?: string;
  entity_id?: string;
  entity_type?: string;
  rfq_id?: string;
  anomaly_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  description: string;
  is_reviewed: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  detected_at: string;
  metadata?: Record<string, unknown>;
}

export interface AuditSummary {
  total_audit_logs: number;
  open_anomalies: number;
  high_severity_anomalies: number;
  verified_vendors: number;
  purchase_orders_issued: number;
  recent_events: AuditLog[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body?: string;
  entity_type?: string;
  entity_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AIRFQDraft {
  title?: string;
  category?: string;
  quantity?: string;
  unit_of_measurement?: string;
  delivery_location?: string;
  delivery_deadline?: string;
  submission_deadline?: string;
  description?: string;
  specifications?: string;
  budget_min?: string;
  budget_max?: string;
  special_conditions?: string;
}

export interface AIQuoteScore {
  vendor_id:    string;
  vendor_name:  string;
  rank?:        number;
  score?:       number;        // legacy alias
  total_score:  number;
  price_score:  number;
  delivery_score: number;
  reliability_score: number;
  quality_score: number;
  strengths:    string[];
  weaknesses:   string[];
  risk_flags?:  string[];
  summary?:     string;
}

export interface AIScoreResult {
  scores: AIQuoteScore[];
  recommendation: {
    winner_vendor_id:   string;
    winner_vendor_name: string;
    confidence?:        string;
    justification?:     string;
    // legacy aliases
    vendor_id?:   string;
    vendor_name?: string;
    summary?:     string;
  };
  comparison_table?:    any[];
  comparison_notes?:    string;
  price_analysis?:      { lowest_bid: number; highest_bid: number; avg_bid: number; price_spread_pct: number; best_value_vendor: string };
  delivery_analysis?:   { fastest_days: number; slowest_days: number; on_time_risk: string };
  vendor_risk_summary?: any[];
}

export interface AIRiskResult {
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_score: number;
  summary: string;
  caution_indicators: string[];
  positive_signals: string[];
  recommendation: string;
}
