import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "./api";

export type Role = "vendor" | "officer" | "approver" | "head" | "auditor";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  org_id?: string;
  vendor_id?: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "procurebase.session";

// Role → dashboard route mapping (used by login page)
export const roleDashboards: Record<Role, string> = {
  vendor:   "/vendor/dashboard",
  officer:  "/officer/dashboard",
  approver: "/approver/dashboard",
  head:     "/head/dashboard",
  auditor:  "/auditor",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Restore session from localStorage ────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") { setIsLoading(false); return; }
    try {
      const stored = window.localStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch { /* ignore */ }
    setIsLoading(false);
  }, []);

  // ─── Listen for global 401 → auto logout ──────────────────────────
  useEffect(() => {
    const handleExpired = () => { setUser(null); setToken(null); window.localStorage.removeItem(SESSION_KEY); };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  // ─── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const res = await api.post<{ token: string; user: AuthUser }>("/api/auth/login", { email, password });
    setUser(res.user);
    setToken(res.token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ user: res.user, token: res.token }));
    }
    return res.user;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(() => {
    // Fire-and-forget backend logout (audit log)
    api.post("/api/auth/logout").catch(() => {});
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
