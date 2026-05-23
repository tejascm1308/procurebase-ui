import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LogOut, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/auth-context";


export interface NavItem { to: string; label: string; icon: LucideIcon; }

const ROLE_LABEL: Record<Role, string> = {
  vendor: "Vendor", officer: "Procurement Officer",
  approver: "Approver", head: "Procurement Head", auditor: "Auditor",
};

export function AppShell({ nav, children, roleLabel }: { nav: NavItem[]; children: ReactNode; roleLabel?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });


  const handleLogout = () => { logout(); navigate({ to: "/login" }); };

  return (
    <div className="flex min-h-screen bg-page">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[240px] flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center border-b px-5">
          <span className="text-[18px] font-bold tracking-tight" style={{ color: '#0A2540', letterSpacing: '-0.03em' }}>
            Procu<span style={{ color: '#635BFF' }}>Base</span>
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active ? "bg-accent text-primary border-l-2 border-primary pl-[10px]" : "text-body hover:bg-secondary hover:text-heading"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-primary font-semibold text-sm">
              {user?.full_name?.charAt(0) ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-heading">{user?.full_name ?? "User"}</p>
              <p className="truncate text-xs text-mute">{user?.email ?? ""}</p>
            </div>
            <button onClick={handleLogout} className="rounded-md p-1.5 text-mute hover:bg-secondary hover:text-heading" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col md:pl-[240px]">
        {/* Topbar */}
        <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center md:hidden">
              <span className="text-[18px] font-bold tracking-tight" style={{ color: '#0A2540', letterSpacing: '-0.03em' }}>
                Procu<span style={{ color: '#635BFF' }}>Base</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5">
                  <div className="h-7 w-7 rounded-full bg-accent text-primary font-semibold text-xs flex items-center justify-center">
                    {user.full_name?.charAt(0) ?? "U"}
                  </div>
                  <span className="text-xs font-semibold text-heading">{ROLE_LABEL[user.role]}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 animate-fade-in-up p-6">{children}</main>
      </div>
    </div>
  );
}
