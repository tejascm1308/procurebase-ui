import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Role } from "./mock-data";

export interface AuthUser {
  id: string; name: string; email: string; role: Role; orgId?: string; vendorId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: Role) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<Role, AuthUser> = {
  vendor: { id: "VND-001", name: "Rajesh Khanna", email: "rajesh@apexsupplies.in", role: "vendor", vendorId: "VND-001" },
  officer: { id: "USR-101", name: "Priya Sharma", email: "priya@techcorp.in", role: "officer", orgId: "ORG-001" },
  approver: { id: "USR-102", name: "Anita Desai", email: "anita@techcorp.in", role: "approver", orgId: "ORG-001" },
  head: { id: "USR-103", name: "Vikram Mehta", email: "vikram@techcorp.in", role: "head", orgId: "ORG-001" },
  auditor: { id: "USR-104", name: "Sanjay Iyer", email: "sanjay@techcorp.in", role: "auditor", orgId: "ORG-001" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") { setIsLoading(false); return; }
    try {
      const stored = window.localStorage.getItem("procurebase.session");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user); setToken(parsed.token);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string, role: Role) => {
    await new Promise((r) => setTimeout(r, 600));
    const u: AuthUser = { ...MOCK_USERS[role], email: email || MOCK_USERS[role].email };
    const t = "mock.jwt." + Math.random().toString(36).slice(2);
    setUser(u); setToken(t);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("procurebase.session", JSON.stringify({ user: u, token: t }));
    }
    return u;
  };

  const logout = () => {
    setUser(null); setToken(null);
    if (typeof window !== "undefined") window.localStorage.removeItem("procurebase.session");
  };

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
