"use client";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
        <Logo href="/login" showLabel={false} />
        <h1 className="mt-6 text-2xl font-bold text-ink">Reset password</h1>
        <p className="mt-1 text-sm text-muted">
          Enter the administrator email associated with your account.
        </p>

        {submitted ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-md border border-amber-200 bg-warning-soft px-3 py-3 text-sm text-warning">
              Development placeholder — no email was sent. Connect the password-reset
              API before using this in production.
            </div>
            <p className="text-sm text-muted">
              Request recorded locally for <strong className="text-ink">{email}</strong>.
            </p>
            <Link href="/login" className="inline-flex text-sm font-semibold text-flyt-purple hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              placeholder="you@flyt.app"
            />
            <Button type="submit" className="w-full" loading={loading}>
              Send reset link
            </Button>
            <Link href="/login" className="block text-center text-sm font-medium text-flyt-purple hover:underline">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
