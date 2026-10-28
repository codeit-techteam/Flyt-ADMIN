"use client";

import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Button } from "@/components/ui/button";
import { getNavLabel } from "@/config/navigation";
import { clearSession, getSession, type SessionUser } from "@/lib/auth";
import {
  ChevronRight,
  CircleHelp,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const title = getNavLabel(pathname);

  useEffect(() => {
    setUser(getSession());
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function signOut() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <button
          type="button"
          className="rounded-md p-2 text-ink hover:bg-ground lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 shrink-0 md:max-w-[11rem] lg:max-w-[14rem]">
          <div className="flex items-center gap-1 text-xs text-muted">
            <Link href="/dashboard" className="hover:text-ink">
              Admin
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate text-ink">{title}</span>
          </div>
          <p className="truncate text-sm font-semibold text-ink">{title}</p>
        </div>

        <div className="flex min-w-0 flex-1 justify-center px-1">
          <GlobalSearch />
        </div>

        <NotificationBell />

        <Link
          href="/settings"
          className="hidden rounded-md p-2 text-muted hover:bg-ground hover:text-ink sm:inline-flex"
          aria-label="Help"
        >
          <CircleHelp className="h-5 w-5" />
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 hover:bg-ground"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-flyt-purple-soft text-flyt-purple">
              <UserRound className="h-4 w-4" />
            </span>
            <span className="hidden text-left text-xs sm:block">
              <span className="block font-semibold text-ink">{user?.name ?? "Admin"}</span>
              <span className="block text-muted">{user?.role ?? "ops_manager"}</span>
            </span>
          </button>
          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-52 rounded-lg border border-border bg-surface p-2 shadow-[var(--shadow-overlay)]">
              <p className="px-2 py-1 text-xs text-muted">{user?.email ?? "demo@flyt.app"}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 w-full justify-start"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
