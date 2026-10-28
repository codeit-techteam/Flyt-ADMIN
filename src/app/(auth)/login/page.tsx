"use client";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brand } from "@/config/brand";
import { DEMO_ADMIN, setSession, validateDemoCredentials } from "@/lib/auth";
import {
  Activity,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState<string>(DEMO_ADMIN.email);
  const [password, setPassword] = useState<string>(DEMO_ADMIN.password);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setFormError("");

    if (!email) setEmailError("Email is required.");
    if (!password) setPasswordError("Password is required.");
    if (!email || !password) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const result = validateDemoCredentials(email, password);
    if (!result.ok) {
      if (result.field === "email") setEmailError(result.error);
      else if (result.field === "password") setPasswordError(result.error);
      else setFormError(result.error);
      setLoading(false);
      return;
    }

    setSession(result.user);
    if (!remember) {
      // Session still uses localStorage for this demo; remember is UI-only until backend auth.
    }
    setLoading(false);
    router.replace(next.startsWith("/") ? next : "/dashboard");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-flyt-purple lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-96 w-96 rounded-full bg-black/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.08)_0%,transparent_42%,rgba(0,0,0,0.18)_100%)]" />

        <div className="relative z-10 flex h-full flex-col justify-between px-12 py-12 text-white xl:px-16">
          <Logo href="/login" inverse showLabel size="lg" />

          <div className="max-w-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              Operations console
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Operate every ride with clarity
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              Monitor live trips, verify Pilots, manage payouts, and respond to safety
              incidents from one place.
            </p>

            <ul className="mt-10 space-y-3">
              {[
                { icon: Activity, label: "Live ride operations" },
                { icon: ShieldCheck, label: "Pilot verification & SOS" },
                { icon: Wallet, label: "Payments and payouts" },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur-sm"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-white" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <p className="font-[family-name:var(--font-quicksand)] text-sm font-bold tracking-[-0.02em] text-white/65">
            {brand.tagline}
          </p>
        </div>
      </aside>

      <div className="relative flex items-center justify-center bg-ground px-4 py-10 sm:px-8">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(61,30,99,0.08),transparent_70%)]" />

        <div className="relative w-full max-w-[420px]">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Logo href="/login" showLabel={false} size="md" />
            <span className="rounded-full bg-flyt-purple-soft px-3 py-1 text-xs font-semibold text-flyt-purple">
              Admin
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-7 shadow-[var(--shadow-card)] sm:p-8">
            <div className="mb-1 hidden lg:block">
              <Logo href="/login" showLabel={false} size="md" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted">
              Sign in to the flyt Admin Console with your administrator account.
            </p>

            <form className="mt-7 space-y-4" onSubmit={onSubmit} noValidate>
              <div className="relative">
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError}
                  placeholder={DEMO_ADMIN.email}
                  className="pl-10"
                />
                <Mail className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-muted" />
              </div>

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                />
                <Lock className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-muted" />
                <button
                  type="button"
                  className="absolute right-3 top-[34px] rounded-md p-1 text-muted hover:bg-ground hover:text-ink"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex cursor-pointer items-center gap-2 text-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-flyt-purple accent-flyt-purple"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="font-semibold text-flyt-purple hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {formError ? (
                <div
                  className="rounded-lg border border-red-200 bg-danger-soft px-3 py-2.5 text-sm text-danger"
                  role="alert"
                >
                  {formError}
                </div>
              ) : null}

              <Button type="submit" className="h-11 w-full text-[15px]" loading={loading}>
                Sign in
              </Button>
            </form>

            <div className="mt-6 rounded-xl border border-flyt-purple/15 bg-flyt-purple-soft/60 px-4 py-3">
              <p className="text-xs font-semibold text-flyt-purple">Demo credentials</p>
              <p className="mt-1 text-xs text-ink/80">
                Email: <span className="font-mono font-medium">{DEMO_ADMIN.email}</span>
              </p>
              <p className="text-xs text-ink/80">
                Password: <span className="font-mono font-medium">{DEMO_ADMIN.password}</span>
              </p>
              <p className="mt-2 text-[11px] text-muted">
                Local demo only — not production authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
