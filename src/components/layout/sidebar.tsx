"use client";

import { Logo } from "@/components/layout/logo";
import { brand } from "@/config/brand";
import { SOS_NAV_ITEM, navGroups, type NavGroup } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { getSession, type SessionUser } from "@/lib/auth";
import { getOpenSosCount, getUnreadNotificationCount } from "@/services/data";
import { ChevronDown, MapPin, Siren, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupContainsPath(group: NavGroup, pathname: string) {
  return group.items.some((item) => pathMatches(pathname, item.href));
}

/** Expand the active section; collapse the rest so deeper items (e.g. Pricing) stay in view. */
function collapsedForPath(pathname: string): Record<string, boolean> {
  return Object.fromEntries(
    navGroups.map((group) => [group.id, !groupContainsPath(group, pathname)]),
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    collapsedForPath(pathname),
  );
  const [user, setUser] = useState<SessionUser | null>(null);
  const [unread, setUnread] = useState(0);
  const [openSos, setOpenSos] = useState(0);
  const [canScrollMore, setCanScrollMore] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setUser(getSession());
    Promise.all([getUnreadNotificationCount(), getOpenSosCount()])
      .then(([n, sos]) => {
        setUnread(n);
        setOpenSos(sos);
      })
      .catch(() => {
        setUnread(0);
        setOpenSos(0);
      });
  }, [pathname]);

  // Focus the active section on route change so items like Pricing aren't buried below the fold.
  useEffect(() => {
    setCollapsed(collapsedForPath(pathname));
  }, [pathname]);

  // Scroll the active nav item into view and track overflow for the fade hint.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      activeLinkRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      const el = navRef.current;
      if (!el) return;
      setCanScrollMore(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, collapsed]);

  const sosActive = pathMatches(pathname, SOS_NAV_ITEM.href);

  const activeGroupId = useMemo(
    () => navGroups.find((group) => groupContainsPath(group, pathname))?.id,
    [pathname],
  );

  const onNavScroll = () => {
    const el = navRef.current;
    if (!el) return;
    setCanScrollMore(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
  };

  const content = (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-[#7c4db8]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-10 h-40 w-40 rounded-full bg-[#5a3488]/30 blur-3xl" />

      <div className="relative flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
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

      <div className="relative mx-3 mt-2.5 flex shrink-0 items-center gap-2 rounded-xl bg-white/8 px-2.5 py-2 ring-1 ring-white/10 backdrop-blur-sm">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Service city
          </p>
          <p className="flex items-center gap-1 truncate text-sm font-semibold text-white">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#c4a5ef]" />
            Hyderabad · TG
          </p>
        </div>
      </div>

      {/* Critical SOS pin — always visible above nav groups */}
      <div className="relative mx-3 mt-2.5 shrink-0">
        <Link
          href={SOS_NAV_ITEM.href}
          onClick={onClose}
          className={cn(
            "group relative flex items-center gap-2.5 overflow-hidden rounded-xl px-2.5 py-2 ring-1 transition duration-150",
            sosActive
              ? "bg-white text-danger shadow-[0_8px_22px_rgba(185,28,28,0.32)] ring-white"
              : "bg-gradient-to-r from-red-600/95 to-rose-700/90 text-white ring-red-400/40 hover:from-red-500 hover:to-rose-600 hover:shadow-[0_8px_20px_rgba(185,28,28,0.32)]",
          )}
          aria-current={sosActive ? "page" : undefined}
          aria-label={`SOS Queue${openSos ? `, ${openSos} open` : ""}`}
        >
          {!sosActive ? (
            <span className="pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full bg-white/15 blur-xl" />
          ) : null}
          <span
            className={cn(
              "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              sosActive ? "bg-danger-soft text-danger" : "bg-white/15 text-white",
            )}
          >
            <Siren className={cn("h-4 w-4", openSos > 0 && !sosActive && "animate-pulse")} />
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight">SOS Queue</p>
            <p
              className={cn(
                "truncate text-[11px] leading-tight",
                sosActive ? "text-danger/80" : "text-white/80",
              )}
            >
              {openSos > 0
                ? `${openSos} open incident${openSos === 1 ? "" : "s"}`
                : "All clear"}
            </p>
          </div>
          {openSos > 0 ? (
            <span
              className={cn(
                "relative rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                sosActive ? "bg-danger text-white" : "bg-white text-danger",
              )}
            >
              {openSos > 9 ? "9+" : openSos}
            </span>
          ) : (
            <span
              className={cn(
                "relative rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                sosActive ? "bg-emerald-100 text-success" : "bg-white/20 text-white",
              )}
            >
              Clear
            </span>
          )}
        </Link>
      </div>

      <div className="relative mt-2 min-h-0 flex-1">
        <nav
          ref={navRef}
          onScroll={onNavScroll}
          className="h-full space-y-3 overflow-y-auto px-3 pb-3 pt-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]"
          aria-label="Admin"
        >
          {navGroups.map((group) => {
            const isCollapsed = collapsed[group.id] ?? false;
            const groupActive = group.id === activeGroupId;
            return (
              <div key={group.id}>
                <button
                  type="button"
                  className={cn(
                    "mb-1 flex w-full items-center justify-between rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition",
                    groupActive ? "text-[#d8c4f5]" : "text-white/40 hover:text-white/70",
                  )}
                  aria-expanded={!isCollapsed}
                  onClick={() =>
                    setCollapsed((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
                  }
                >
                  <span className="flex items-center gap-1.5">
                    {group.label}
                    {groupActive ? (
                      <span className="h-1 w-1 rounded-full bg-[#c4a5ef]" aria-hidden />
                    ) : null}
                  </span>
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
                      const active = pathMatches(pathname, item.href);
                      const Icon = item.icon;
                      const showNotifBadge = item.href === "/notifications" && unread > 0;
                      return (
                        <li key={item.href}>
                          <Link
                            ref={active ? activeLinkRef : undefined}
                            href={item.href}
                            onClick={onClose}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm font-medium transition duration-150",
                              active
                                ? "bg-white text-flyt-purple shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                                : "text-white/75 hover:bg-white/8 hover:text-white",
                            )}
                          >
                            {active ? (
                              <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-[#7c4db8]" />
                            ) : null}
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition",
                                active
                                  ? "bg-flyt-purple-soft text-flyt-purple"
                                  : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white",
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {showNotifBadge ? (
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
        {canScrollMore ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#241038] to-transparent"
            aria-hidden
          />
        ) : null}
      </div>

      <div className="relative shrink-0 border-t border-white/10 p-2.5">
        <div className="rounded-xl bg-gradient-to-br from-white/10 to-white/[0.03] p-2.5 ring-1 ring-white/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[11px] font-bold text-flyt-purple">
              {(user?.name ?? "A")
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name ?? "Admin"}
              </p>
              <p className="truncate text-[11px] text-white/50">
                {user?.role?.replace(/_/g, " ") ?? "ops manager"}
              </p>
            </div>
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#c4a5ef]" />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            {brand.name} Admin · Demo frontend
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[16.5rem] shrink-0 bg-gradient-to-b from-[#2a1445] via-flyt-purple to-[#241038] lg:block">
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
          <aside className="absolute inset-y-0 left-0 w-[17.5rem] bg-gradient-to-b from-[#2a1445] via-flyt-purple to-[#241038] shadow-[var(--shadow-overlay)]">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
