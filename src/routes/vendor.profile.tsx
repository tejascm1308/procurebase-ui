import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Building2, FileText, CreditCard, MapPin, Phone, IdCard } from "lucide-react";

export const Route = createFileRoute("/vendor/profile")({ component: VendorProfile });

const SECTIONS = [
  { icon: Building2, title: "Business Identity", items: [["Legal Name","Apex Industrial Supplies Pvt Ltd"],["Business Type","Private Limited"],["Incorporated","12 Mar 2014"],["Categories","Manufacturing, Logistics"]] },
  { icon: IdCard, title: "Tax & Legal", items: [["GSTIN","27AAACA1234B1Z5"],["PAN","AAACA1234B"],["CIN","U72200MH2014PTC123456"],["MSME","UDYAM-MH-08-001234"]] },
  { icon: Phone, title: "Contact", items: [["Business Email","contact@apexsupplies.in"],["Phone","+91 98765 43210"],["Landline","+91 22 6677 4400"]] },
  { icon: MapPin, title: "Address", items: [["Registered","42 MIDC Industrial Area, Mumbai 400072"],["Operational","Same as registered"],["State","Maharashtra"]] },
  { icon: CreditCard, title: "Bank Details", items: [["Bank","HDFC Bank"],["Account","XXXX XXXX 4422"],["IFSC","HDFC0001234"],["Type","Current"]] },
];

const DOCS = ["GST Certificate","PAN Card","Cancelled Cheque","Certificate of Incorporation","MSME Certificate"];

function VendorProfile() {
  return (
    <div>
      <PageHeader title="Profile & Documents" subtitle="Manage your business profile, contact details, and supporting documents."
        actions={<><StatusBadge status="PENDING_APPROVAL" /><Link to="/vendor/profile/complete" className="h-10 inline-flex items-center rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90">Update Profile</Link></>} />
      <div className="grid gap-6 lg:grid-cols-2">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent"><s.icon className="h-4.5 w-4.5 text-primary" /></div>
              <h3 className="text-sm font-semibold text-heading">{s.title}</h3>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {s.items.map(([k,v]) => (
                <div key={k}><p className="label-tiny">{k}</p><p className="mt-1 text-sm font-semibold text-heading">{v}</p></div>
              ))}
            </dl>
          </div>
        ))}
        <div className="rounded-2xl border bg-card p-6 shadow-card lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent"><FileText className="h-4.5 w-4.5 text-primary" /></div>
            <h3 className="text-sm font-semibold text-heading">Documents</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DOCS.map((d) => (
              <div key={d} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md" style={{ background: "#ECFDF5" }}><FileText className="h-4 w-4 text-[#0E9F6E]" /></div>
                  <div className="min-w-0"><p className="text-xs font-semibold text-heading truncate">{d}</p><p className="text-[10px] text-mute">Uploaded • PDF</p></div>
                </div>
                <button className="text-xs font-semibold text-primary hover:underline">View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
