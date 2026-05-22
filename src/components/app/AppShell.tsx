import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Search, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/mock-data";
import { notifications as mockNotifications } from "@/lib/mock-data";

export interface NavItem { to: string; label: string; icon: LucideIcon; }

const ROLE_LABEL: Record<Role, string> = {
  vendor: "Vendor", officer: "Procurement Officer",
  approver: "Approver", head: "Procurement Head", auditor: "Auditor",
};

export function AppShell({ nav, children, roleLabel }: { nav: NavItem[]; children: ReactNode; roleLabel?: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = mockNotifications.filter((n) => !n.read).length;

  const handleLogout = () => { logout(); navigate({ to: "/login" }); };

  return (
    <div className="flex min-h-screen bg-page">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[240px] flex-col border-r bg-card md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-white font-bold text-sm">P</div>
          <div>
            <p className="text-sm font-bold text-heading leading-none">ProcureBase</p>
            <p className="text-[10px] text-mute uppercase tracking-wider mt-1">{roleLabel ?? (user ? ROLE_LABEL[user.role] : "")}</p>
          </div>
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
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-heading">{user?.name ?? "User"}</p>
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
            <div className="flex items-center gap-3 md:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-white font-bold text-sm">P</div>
              <p className="text-sm font-bold text-heading">ProcureBase</p>
            </div>
            <div className="hidden flex-1 max-w-md md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                <input
                  type="text"
                  placeholder="Search RFQs, vendors, orders..."
                  className="h-9 w-full rounded-lg border bg-page pl-9 pr-3 text-sm text-heading placeholder:text-[#94A3B8] focus:outline-none focus:border-primary focus:ring-4 focus:ring-[rgba(99,91,255,0.15)]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative rounded-lg p-2 text-body hover:bg-secondary hover:text-heading">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DF1B41] px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {user && (
                <div className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-1.5 sm:flex">
                  <div className="h-7 w-7 rounded-full bg-accent text-primary font-semibold text-xs flex items-center justify-center">
                    {user.name.charAt(0)}
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
