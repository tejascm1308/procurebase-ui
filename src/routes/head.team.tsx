import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { useTeam, useAddTeamMember, useDeactivateMember, useActivateMember, useRemoveMember } from "@/lib/queries";
import { useState } from "react";
import { Loader2, UserPlus, ShieldCheck, ClipboardList, Search, Trash2, UserX, UserCheck } from "lucide-react";
import type { TeamMember } from "@/lib/types";

export const Route = createFileRoute("/head/team")({ component: HeadTeam });

const ROLE_SECTIONS = [
  {
    role: "approver",
    label: "Approvers",
    icon: ShieldCheck,
    color: "#635BFF",
    bg: "#EEF2FF",
    desc: "Review quotations and approve procurement requests",
  },
  {
    role: "officer",
    label: "Procurement Officers",
    icon: ClipboardList,
    color: "#0570DE",
    bg: "#EFF6FF",
    desc: "Create RFQs, manage vendors and purchase orders",
  },
  {
    role: "auditor",
    label: "Auditors",
    icon: Search,
    color: "#0E9F6E",
    bg: "#ECFDF5",
    desc: "Monitor spend anomalies and audit procurement activity",
  },
];

const FF = `h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]`;

function MemberCard({ m, deactivateMutation, activateMutation, removeMutation }: {
  m: TeamMember;
  deactivateMutation: ReturnType<typeof useDeactivateMember>;
  activateMutation: ReturnType<typeof useActivateMember>;
  removeMutation: ReturnType<typeof useRemoveMember>;
}) {
  const handleRemove = () => {
    if (confirm(`Permanently remove ${m.full_name || m.email}? This cannot be undone — their account will be deleted.`)) {
      removeMutation.mutateAsync(m.id);
    }
  };

  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${!m.is_active ? "bg-[#F8F9FA] opacity-75" : "bg-white"}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${!m.is_active ? "bg-gray-400" : "bg-gradient-to-br from-[#635BFF] to-[#0570DE]"}`}>
          {(m.full_name || m.email)[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-heading truncate">{m.full_name || "—"}</p>
          <p className="text-xs text-mute truncate">{m.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Join status */}
        {m.join_status === "joined" ? (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#ECFDF5", color: "#0E9F6E" }}>
            ● Joined
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#FFF8E1", color: "#F59E0B" }}>
            ● Invite Sent
          </span>
        )}

        {/* Active status */}
        {!m.is_active && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "#FEE2E2", color: "#B91C1C" }}>
            Deactivated
          </span>
        )}

        {/* Deactivate / Activate */}
        {m.is_active ? (
          <button onClick={() => { if (confirm(`Deactivate ${m.email}?`)) deactivateMutation.mutateAsync(m.id); }}
            disabled={deactivateMutation.isPending}
            title="Deactivate"
            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50">
            <UserX className="h-3.5 w-3.5" /> Deactivate
          </button>
        ) : (
          <button onClick={() => activateMutation.mutateAsync(m.id)}
            disabled={activateMutation.isPending}
            title="Activate"
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
            <UserCheck className="h-3.5 w-3.5" /> Activate
          </button>
        )}

        {/* Remove (hard delete) */}
        <button onClick={handleRemove}
          disabled={removeMutation.isPending}
          title="Remove permanently"
          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </button>
      </div>
    </div>
  );
}

function HeadTeam() {
  const { data: allMembers = [], isLoading } = useTeam();
  const deactivateMutation = useDeactivateMember();
  const activateMutation   = useActivateMember();
  const removeMutation     = useRemoveMember();
  const addMutation        = useAddTeamMember();

  const [showAdd, setShowAdd]   = useState(false);
  const [addRole, setAddRole]   = useState("officer");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName]   = useState("");

  const members = allMembers as TeamMember[];

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMutation.mutateAsync({ email: newEmail, full_name: newName, role: addRole });
    setShowAdd(false); setNewEmail(""); setNewName("");
  };

  return (
    <div>
      <PageHeader
        title="Team Management"
        subtitle="Manage your procurement team. Members are grouped by role — roles are fixed at creation."
        actions={
          <button onClick={() => setShowAdd(!showAdd)}
            className="h-10 inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white shadow-card hover:opacity-90">
            <UserPlus className="h-3.5 w-3.5" /> Add Member
          </button>
        }
      />

      {/* Add member form */}
      {showAdd && (
        <form onSubmit={addMember} className="mb-6 rounded-2xl border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold text-heading mb-4">Add New Team Member</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-heading">Full Name</label>
              <input className={FF} value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-heading">Email *</label>
              <input type="email" required className={FF} value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@company.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-heading">Role * <span className="text-mute font-normal">(cannot be changed later)</span></label>
              <select required className={FF} value={addRole} onChange={e => setAddRole(e.target.value)}>
                <option value="officer">Procurement Officer</option>
                <option value="approver">Approver</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={addMutation.isPending}
              className="h-9 rounded-lg bg-gradient-primary px-4 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60 flex items-center gap-2">
              {addMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />} Send Invite
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="h-9 rounded-lg border px-4 text-xs font-semibold text-heading hover:bg-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-6">
          {ROLE_SECTIONS.map(({ role, label, icon: Icon, color, bg, desc }) => {
            const roleMembers = members.filter(m => m.role === role);
            return (
              <div key={role} className="rounded-2xl border bg-card shadow-card overflow-hidden">
                {/* Section header */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ background: bg }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: color + "20" }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-heading">{label}</h3>
                      <p className="text-[11px] text-mute">{desc}</p>
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: color + "20", color }}>
                    {roleMembers.length}
                  </span>
                </div>

                {/* Members list */}
                <div className="p-4 space-y-2">
                  {roleMembers.length === 0 ? (
                    <p className="py-4 text-center text-xs text-mute">
                      No {label.toLowerCase()} yet. Click <span className="font-semibold">Add Member</span> and select <span className="font-semibold">{label.slice(0, -1)}</span> as role.
                    </p>
                  ) : roleMembers.map(m => (
                    <MemberCard key={m.id} m={m}
                      deactivateMutation={deactivateMutation}
                      activateMutation={activateMutation}
                      removeMutation={removeMutation}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
