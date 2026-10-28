"use client";

import { Logo } from "@/components/layout/logo";
import { brand } from "@/config/brand";
import { navGroups } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { getSession, type SessionUser } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/services/data";
import { ChevronDown, MapPin, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<SessionUser | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setUser(getSession());
    getUnreadNotificationCount().then(setUnread).catch(() => setUnread(0));
  }, [pathname]);

  const content = (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-[#7c4db8]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 h-40 w-40 rounded-full bg-[#5a3488]/30 blur-3xl" />

      <div className="relative flex h-[4.25rem] items-center justify-between border-b border-white/10 px-4">
        <Logo inverse showLabel={false} size="sm" className="min-w-0" />
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 ring-1 ring-white/10 sm:inline">
            Admin
          </span>
          <button
            type="button"
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative mx-3 mt-3 rounded-xl bg-white/8 px-3 py-2.5 ring-1 ring-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">Service city</p>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white">
          <MapPin className="h-3.5 w-3.5 text-[#c4a5ef]" />
          Hyderabad · TG
        </p>
      </div>

      <nav className="relative flex-1 space-y-5 overflow-y-auto px-3 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
        {navGroups.map((group) => {
          const isCollapsed = collapsed[group.id];
          const groupActive = group.items.some(
            (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
          );
          return (
            <div key={group.id}>
              <button
                type="button"
                className={cn(
                  "mb-1.5 flex w-full items-center justify-between rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition",
                  groupActive ? "text-[#d8c4f5]" : "text-white/40 hover:text-white/70",
                )}
                onClick={() =>
                  setCollapsed((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
                }
              >
                {group.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition duration-200",
                    isCollapsed && "-rotate-90",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
                )}
              >
                <ul className="space-y-0.5 overflow-hidden">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    const showBadge = item.href === "/notifications" && unread > 0;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-medium transition duration-150",
                            active
                              ? "bg-white text-flyt-purple shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                              : "text-white/75 hover:bg-white/8 hover:text-white",
                          )}
                        >
                          {active ? (
                            <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-[#7c4db8]" />
                          ) : null}
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
                              active
                                ? "bg-flyt-purple-soft text-flyt-purple"
                                : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {showBadge ? (
                            <span
                              className={cn(
                                "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                                active
                                  ? "bg-danger text-white"
                                  : "bg-danger text-white shadow-sm shadow-red-900/30",
                              )}
                            >
                              {unread > 9 ? "9+" : unread}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="relative border-t border-white/10 p-3">
        <div className="rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03] p-3 ring-1 ring-white/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold text-flyt-purple">
              {(user?.name ?? "A")
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name ?? "Admin"}</p>
              <p className="truncate text-[11px] text-white/50">{user?.role?.replace(/_/g, " ") ?? "ops manager"}</p>
            </div>
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#c4a5ef]" />
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 text-[10px] font-medium text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            {brand.name} Admin · Demo frontend
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[17rem] shrink-0 bg-gradient-to-b from-[#2a1445] via-flyt-purple to-[#241038] lg:block">
        {content}
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            aria-label="Close drawer"
            onClick={onClose}
          />
          <aside className="absolute inset-y-0 left-0 w-[18rem] bg-gradient-to-b from-[#2a1445] via-flyt-purple to-[#241038] shadow-[var(--shadow-overlay)]">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
