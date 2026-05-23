export type Role = "vendor" | "officer" | "approver" | "head" | "auditor";

export type Status =
  | "REGISTERED" | "DRAFT" | "PROFILE_INCOMPLETE" | "PENDING_APPROVAL"
  | "NEEDS_CLARIFICATION" | "VERIFIED" | "APPROVED" | "SELECTED" | "COMPLETED"
  | "UNDER_REVIEW" | "IN_PROGRESS" | "SENT" | "OPEN" | "ISSUED" | "DISPATCHED"
  | "REJECTED" | "SUSPENDED" | "CANCELLED" | "CLOSED" | "DELIVERED" | "WITHDRAWN";

export interface Vendor {
  id: string; name: string; email: string; status: Status;
  categories: string[]; rating: number; reviews: number; location: string;
  verified: boolean; completedOrders: number; gstin: string; pan: string;
}

export interface RFQ {
  id: string; title: string; description: string; category: string;
  organization: string; type: "Targeted" | "Open"; status: Status;
  quotesReceived: number; deadline: string; deliveryDeadline: string;
  budgetMin?: number; budgetMax?: number; quantity: number; unit: string;
  location: string; createdBy: string; createdAt: string;
}

export interface Quotation {
  id: string; rfqId: string; rfqTitle: string; vendorId: string; vendorName: string;
  unitPrice: number; quantity: number; totalAmount: number;
  deliveryDays: number; paymentTerms: string; warranty: string;
  validity: string; status: Status; submittedAt: string; rating: number;
  documents: number;
}

export interface Order {
  id: string; poNumber: string; rfqId: string; vendorId: string; vendorName: string;
  organization: string; amount: number; status: Status; issuedAt: string;
  deliveryDeadline: string; itemSummary: string;
}

export interface AuditLog {
  id: string; timestamp: string; eventType: string; actor: string; role: Role;
  entity: string; entityId: string; org: string; change: string;
}

export interface Anomaly {
  id: string; severity: "HIGH" | "MEDIUM" | "LOW"; type: string;
  description: string; relatedEntity: string; detectedAt: string; reviewed: boolean;
}

export interface Notification {
  id: string; type: string; title: string; body: string; timestamp: string; read: boolean;
}

export const vendors: Vendor[] = [
  { id: "VND-001", name: "Apex Industrial Supplies", email: "contact@apexsupplies.in", status: "VERIFIED", categories: ["Manufacturing", "Logistics"], rating: 4.6, reviews: 124, location: "Mumbai, MH", verified: true, completedOrders: 87, gstin: "27AAACA1234B1Z5", pan: "AAACA1234B" },
  { id: "VND-002", name: "Northwind Trading Co.", email: "sales@northwindtrade.com", status: "PENDING_APPROVAL", categories: ["IT", "Office Supplies"], rating: 4.2, reviews: 56, location: "Bangalore, KA", verified: false, completedOrders: 32, gstin: "29AAACN5678C1Z2", pan: "AAACN5678C" },
  { id: "VND-003", name: "Bharat Logistics Pvt Ltd", email: "info@bharatlogistics.in", status: "NEEDS_CLARIFICATION", categories: ["Logistics", "Transport"], rating: 3.8, reviews: 41, location: "Pune, MH", verified: false, completedOrders: 19, gstin: "27AAACB9012D1Z9", pan: "AAACB9012D" },
  { id: "VND-004", name: "Stellar Tech Solutions", email: "hello@stellartech.io", status: "VERIFIED", categories: ["IT", "Software"], rating: 4.8, reviews: 203, location: "Hyderabad, TS", verified: true, completedOrders: 156, gstin: "36AAACS3456E1Z4", pan: "AAACS3456E" },
  { id: "VND-005", name: "Verdant Office Furnishings", email: "orders@verdant.co.in", status: "VERIFIED", categories: ["Furniture", "Interior"], rating: 4.4, reviews: 78, location: "Delhi, DL", verified: true, completedOrders: 64, gstin: "07AAACV7890F1Z1", pan: "AAACV7890F" },
];

export const rfqs: RFQ[] = [
  { id: "RFQ-2024-0142", title: "Ergonomic Office Chairs - Grade A", description: "200 units of ergonomic office chairs with adjustable lumbar support, breathable mesh back, and 5-year warranty.", category: "Furniture", organization: "Tech Corp India", type: "Targeted", status: "UNDER_REVIEW", quotesReceived: 4, deadline: "2026-06-15", deliveryDeadline: "2026-08-30", budgetMin: 800000, budgetMax: 1500000, quantity: 200, unit: "units", location: "Mumbai, MH", createdBy: "Priya Sharma", createdAt: "2026-05-10" },
  { id: "RFQ-2024-0141", title: "Enterprise Laptop Procurement Q3", description: "150 business laptops, i7/16GB/512GB SSD, 3-year onsite warranty.", category: "IT Hardware", organization: "Tech Corp India", type: "Open", status: "SENT", quotesReceived: 7, deadline: "2026-06-10", deliveryDeadline: "2026-07-25", budgetMin: 9000000, budgetMax: 13500000, quantity: 150, unit: "units", location: "Bangalore, KA", createdBy: "Rohit Kumar", createdAt: "2026-05-05" },
  { id: "RFQ-2024-0140", title: "Annual Logistics Contract - Pan India", description: "Last-mile delivery services across 12 cities, daily volume 500-800 parcels.", category: "Logistics", organization: "Tech Corp India", type: "Targeted", status: "APPROVED", quotesReceived: 3, deadline: "2026-05-28", deliveryDeadline: "2027-05-31", quantity: 1, unit: "contract", location: "Pan India", createdBy: "Anita Desai", createdAt: "2026-04-22" },
  { id: "RFQ-2024-0139", title: "Industrial UPS - 20KVA", description: "Three-phase online UPS systems with 30-min backup, including installation.", category: "Manufacturing", organization: "Tech Corp India", type: "Open", status: "OPEN", quotesReceived: 5, deadline: "2026-06-20", deliveryDeadline: "2026-08-15", budgetMin: 600000, budgetMax: 950000, quantity: 4, unit: "units", location: "Pune, MH", createdBy: "Priya Sharma", createdAt: "2026-05-12" },
  { id: "RFQ-2024-0138", title: "Corporate Stationery - Q3 Bulk Order", description: "Branded notebooks, pens, folders, and binders for company-wide distribution.", category: "Office Supplies", organization: "Tech Corp India", type: "Open", status: "CLOSED", quotesReceived: 9, deadline: "2026-04-30", deliveryDeadline: "2026-06-10", budgetMin: 200000, budgetMax: 350000, quantity: 1500, unit: "sets", location: "Delhi, DL", createdBy: "Rohit Kumar", createdAt: "2026-04-01" },
];

export const quotations: Quotation[] = [
  { id: "QUO-8821", rfqId: "RFQ-2024-0142", rfqTitle: "Ergonomic Office Chairs - Grade A", vendorId: "VND-005", vendorName: "Verdant Office Furnishings", unitPrice: 6250, quantity: 200, totalAmount: 1250000, deliveryDays: 15, paymentTerms: "Net 30", warranty: "1 Year", validity: "30 days", status: "UNDER_REVIEW", submittedAt: "2026-05-18", rating: 4.6, documents: 3 },
  { id: "QUO-8822", rfqId: "RFQ-2024-0142", rfqTitle: "Ergonomic Office Chairs - Grade A", vendorId: "VND-001", vendorName: "Apex Industrial Supplies", unitPrice: 5600, quantity: 200, totalAmount: 1120000, deliveryDays: 20, paymentTerms: "Advance 50%", warranty: "6 Months", validity: "45 days", status: "UNDER_REVIEW", submittedAt: "2026-05-19", rating: 4.2, documents: 2 },
  { id: "QUO-8823", rfqId: "RFQ-2024-0142", rfqTitle: "Ergonomic Office Chairs - Grade A", vendorId: "VND-002", vendorName: "Northwind Trading Co.", unitPrice: 6900, quantity: 200, totalAmount: 1380000, deliveryDays: 12, paymentTerms: "Net 60", warranty: "2 Years", validity: "30 days", status: "UNDER_REVIEW", submittedAt: "2026-05-20", rating: 3.8, documents: 4 },
  { id: "QUO-8810", rfqId: "RFQ-2024-0141", rfqTitle: "Enterprise Laptop Procurement Q3", vendorId: "VND-004", vendorName: "Stellar Tech Solutions", unitPrice: 78500, quantity: 150, totalAmount: 11775000, deliveryDays: 25, paymentTerms: "Net 30", warranty: "3 Years", validity: "60 days", status: "SELECTED", submittedAt: "2026-05-12", rating: 4.8, documents: 5 },
];

export const orders: Order[] = [
  { id: "ORD-501", poNumber: "PO-2026-0501", rfqId: "RFQ-2024-0140", vendorId: "VND-003", vendorName: "Bharat Logistics Pvt Ltd", organization: "Tech Corp India", amount: 4500000, status: "IN_PROGRESS", issuedAt: "2026-05-01", deliveryDeadline: "2027-05-31", itemSummary: "Annual logistics contract - Pan India (12 cities)" },
  { id: "ORD-502", poNumber: "PO-2026-0502", rfqId: "RFQ-2024-0141", vendorId: "VND-004", vendorName: "Stellar Tech Solutions", organization: "Tech Corp India", amount: 11775000, status: "DISPATCHED", issuedAt: "2026-05-15", deliveryDeadline: "2026-07-25", itemSummary: "150 enterprise laptops (i7/16GB/512GB)" },
  { id: "ORD-498", poNumber: "PO-2026-0498", rfqId: "RFQ-2024-0138", vendorId: "VND-005", vendorName: "Verdant Office Furnishings", organization: "Tech Corp India", amount: 287500, status: "DELIVERED", issuedAt: "2026-04-22", deliveryDeadline: "2026-06-10", itemSummary: "Corporate stationery - 1500 sets" },
];

export const auditLogs: AuditLog[] = [
  { id: "LOG-9921", timestamp: "2026-05-22T14:32:18Z", eventType: "RFQ_CREATED", actor: "Priya Sharma", role: "officer", entity: "RFQ", entityId: "RFQ-2024-0142", org: "Tech Corp India", change: "Created targeted RFQ for office chairs" },
  { id: "LOG-9922", timestamp: "2026-05-22T14:35:02Z", eventType: "RFQ_SENT", actor: "Priya Sharma", role: "officer", entity: "RFQ", entityId: "RFQ-2024-0142", org: "Tech Corp India", change: "Sent to 5 vendors" },
  { id: "LOG-9923", timestamp: "2026-05-22T16:01:44Z", eventType: "QUOTE_SUBMITTED", actor: "Verdant Office Furnishings", role: "vendor", entity: "Quotation", entityId: "QUO-8821", org: "Tech Corp India", change: "Submitted ₹12,50,000 quote" },
  { id: "LOG-9924", timestamp: "2026-05-22T18:24:11Z", eventType: "AI_SCORE_REQUESTED", actor: "Anita Desai", role: "approver", entity: "RFQ", entityId: "RFQ-2024-0142", org: "Tech Corp India", change: "AI scoring computed for 4 quotes" },
  { id: "LOG-9925", timestamp: "2026-05-22T19:02:33Z", eventType: "APPROVAL_ACTION", actor: "Anita Desai", role: "approver", entity: "Quotation", entityId: "QUO-8822", org: "Tech Corp India", change: "Approved Apex Industrial Supplies" },
  { id: "LOG-9926", timestamp: "2026-05-22T19:03:01Z", eventType: "PO_GENERATED", actor: "System", role: "officer", entity: "PurchaseOrder", entityId: "PO-2026-0503", org: "Tech Corp India", change: "PO generated ₹11,20,000" },
  { id: "LOG-9927", timestamp: "2026-05-21T11:14:22Z", eventType: "VERIFICATION_CHANGE", actor: "Platform Admin", role: "auditor", entity: "Vendor", entityId: "VND-001", org: "Platform", change: "Vendor profile verified" },
  { id: "LOG-9928", timestamp: "2026-05-21T09:48:55Z", eventType: "MEMBER_ADDED", actor: "Vikram Mehta", role: "head", entity: "User", entityId: "USR-441", org: "Tech Corp India", change: "Added Rohit Kumar as Procurement Officer" },
  { id: "LOG-9929", timestamp: "2026-05-20T20:31:09Z", eventType: "INVOICE_UPLOADED", actor: "Bharat Logistics Pvt Ltd", role: "vendor", entity: "Order", entityId: "ORD-501", org: "Tech Corp India", change: "Invoice INV-3344 uploaded" },
  { id: "LOG-9930", timestamp: "2026-05-20T15:22:48Z", eventType: "LOGIN", actor: "Priya Sharma", role: "officer", entity: "Session", entityId: "SES-7781", org: "Tech Corp India", change: "Successful login from 10.x.x.x" },
];

export const anomalies: Anomaly[] = [
  { id: "ANO-44", severity: "HIGH", type: "VENDOR_WIN_CONCENTRATION", description: "Vendor 'Apex Industrial Supplies' has won 4 out of last 5 RFQs for Tech Corp India. Review for fair sourcing.", relatedEntity: "VND-001", detectedAt: "2026-05-22T08:00:00Z", reviewed: false },
  { id: "ANO-43", severity: "MEDIUM", type: "PRICE_DEVIATION", description: "Winning quote on RFQ-2024-0140 was 42% above average of all received quotes for this category.", relatedEntity: "RFQ-2024-0140", detectedAt: "2026-05-21T12:30:00Z", reviewed: false },
  { id: "ANO-42", severity: "LOW", type: "LOW_COMPETITION_AWARD", description: "PO PO-2026-0498 awarded with only 1 quote received against an Open RFQ.", relatedEntity: "PO-2026-0498", detectedAt: "2026-05-19T10:15:00Z", reviewed: true },
];

export const notifications: Notification[] = [
  { id: "N-1", type: "rfq", title: "New RFQ received", body: "Tech Corp India sent a targeted RFQ: Ergonomic Office Chairs - Grade A", timestamp: "2 hours ago", read: false },
  { id: "N-2", type: "quote", title: "New quote received", body: "Verdant Office Furnishings submitted a quote for RFQ-2024-0142", timestamp: "5 hours ago", read: false },
  { id: "N-3", type: "approval", title: "Approval assigned", body: "RFQ-2024-0142 quotes ready for your review", timestamp: "Today", read: false },
  { id: "N-4", type: "po", title: "PO issued", body: "Purchase order PO-2026-0502 has been issued to Stellar Tech Solutions", timestamp: "Yesterday", read: true },
  { id: "N-5", type: "order", title: "Order status updated", body: "ORD-502 status changed to DISPATCHED", timestamp: "Yesterday", read: true },
  { id: "N-6", type: "anomaly", title: "Anomaly detected", body: "Vendor win concentration alert for Apex Industrial Supplies", timestamp: "2 days ago", read: true },
];

export const roleDashboards: Record<Role, string> = {
  vendor: "/vendor/dashboard",
  officer: "/officer/dashboard",
  approver: "/approver/dashboard",
  head: "/head/dashboard",
  auditor: "/auditor",
};
