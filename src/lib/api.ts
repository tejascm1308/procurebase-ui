/**
 * ProcureBase API Client
 * ─────────────────────────────────────────────────────────────
 * Centralized fetch wrapper that:
 *  - Prepends the API base URL from VITE_API_URL
 *  - Injects the JWT Authorization header on every request
 *  - Auto-parses JSON responses
 *  - Throws on non-2xx with structured error messages
 *  - Fires a global "auth:expired" event on 401 for auth-context to catch
 */

const BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const session = window.localStorage.getItem("procurebase.session");
    return session ? JSON.parse(session).token : null;
  } catch {
    return null;
  }
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false,
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  // Handle auth expiry globally — but NOT on auth routes themselves
  // (login/register can legitimately return 401 for wrong credentials)
  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    window.dispatchEvent(new Event("auth:expired"));
    throw new Error("Session expired. Please sign in again.");
  }

  let data: any;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const msg =
      data?.error?.message || data?.detail || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // Unwrap { success: true, data: ... } envelope
  if (data && typeof data === "object" && "success" in data) {
    return data.data as T;
  }
  return data as T;
}

export const api = {
  get:    <T = unknown>(path: string)                    => request<T>("GET",    path),
  post:   <T = unknown>(path: string, body?: unknown)    => request<T>("POST",   path, body),
  put:    <T = unknown>(path: string, body?: unknown)    => request<T>("PUT",    path, body),
  delete: <T = unknown>(path: string)                    => request<T>("DELETE", path),
  upload: <T = unknown>(path: string, form: FormData)    => request<T>("POST",   path, form, true),
  uploadPut: <T = unknown>(path: string, form: FormData) => request<T>("PUT",    path, form, true),
};

export default api;
