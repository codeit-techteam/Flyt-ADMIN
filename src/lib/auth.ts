/**
 * Frontend-only session helper for local demo.
 * Not production security — replace with server-side auth when backend is ready.
 */

export type SessionUser = {
  name: string;
  email: string;
  role: string;
};

const SESSION_KEY = "flyt-admin-session";

/** Demo administrator credentials for local development only. */
export const DEMO_ADMIN = {
  email: "admin@flyt.in",
  password: "Flyt@123",
  name: "FLYT Admin",
  role: "super_admin",
} as const;

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

/** Demo credential check only — never use these values as production secrets. */
export function validateDemoCredentials(email: string, password: string) {
  if (!email) {
    return { ok: false as const, error: "Email is required.", field: "email" as const };
  }
  if (!password) {
    return { ok: false as const, error: "Password is required.", field: "password" as const };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Enter a valid email address.", field: "email" as const };
  }

  const emailOk = email.trim().toLowerCase() === DEMO_ADMIN.email;
  const passwordOk = password === DEMO_ADMIN.password;

  if (!emailOk || !passwordOk) {
    return {
      ok: false as const,
      error: "Invalid email or password. Use the demo administrator credentials.",
      field: "form" as const,
    };
  }

  return {
    ok: true as const,
    user: {
      name: DEMO_ADMIN.name,
      email: DEMO_ADMIN.email,
      role: DEMO_ADMIN.role,
    },
  };
}
