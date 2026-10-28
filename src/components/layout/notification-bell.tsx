"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/data";
import type { AdminNotification, AdminNotificationCategory } from "@/types";
import {
  Bell,
  CheckCheck,
  IndianRupee,
  Radio,
  Settings2,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const categoryMeta: Record<
  AdminNotificationCategory,
  { label: string; tone: "danger" | "warning" | "info" | "brand" | "success"; icon: typeof Bell }
> = {
  safety: { label: "Safety", tone: "danger", icon: ShieldAlert },
  ops: { label: "Ops", tone: "warning", icon: Radio },
  verification: { label: "Verify", tone: "info", icon: UserCheck },
  finance: { label: "Finance", tone: "success", icon: IndianRupee },
  system: { label: "System", tone: "brand", icon: Settings2 },
};

export function NotificationBell() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const [list, count] = await Promise.all([listNotifications(), getUnreadNotificationCount()]);
    setItems(list);
    setUnread(count);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      await refresh();
      setLoading(false);
    }
  }

  async function onOpenItem(item: AdminNotification) {
    if (!item.read) {
      await markNotificationRead(item.id);
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      setUnread((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    router.push(item.href);
  }

  async function onMarkAll() {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={cn(
          "relative rounded-md p-2 text-muted transition hover:bg-ground hover:text-ink",
          open && "bg-flyt-purple-soft text-flyt-purple",
        )}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggle}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-40 mt-2 flex w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-overlay)]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <p className="text-xs text-muted">
                {unread > 0 ? `${unread} unread` : "You're all caught up"}
              </p>
            </div>
            {unread > 0 ? (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onMarkAll}>
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            ) : null}
          </div>

          <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-ground" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted/40" />
                <p className="mt-2 text-sm font-medium text-ink">No notifications</p>
                <p className="mt-1 text-xs text-muted">Ops alerts will show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => {
                  const meta = categoryMeta[item.category];
                  const Icon = meta.icon;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onOpenItem(item)}
                        className={cn(
                          "flex w-full gap-3 px-4 py-3 text-left transition hover:bg-ground",
                          !item.read && "bg-flyt-purple-soft/35",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            item.category === "safety" && "bg-danger-soft text-danger",
                            item.category === "ops" && "bg-warning-soft text-warning",
                            item.category === "verification" && "bg-info-soft text-info",
                            item.category === "finance" && "bg-success-soft text-success",
                            item.category === "system" && "bg-flyt-purple-soft text-flyt-purple",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-ink">{item.title}</span>
                            {!item.read ? (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-flyt-purple" />
                            ) : null}
                          </span>
                          <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                            {item.body}
                          </span>
                          <span className="mt-1.5 flex items-center gap-2">
                            <Badge tone={meta.tone}>{meta.label}</Badge>
                            <span className="text-[11px] text-muted">{formatRelative(item.createdAt)}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-border bg-ground/50 px-3 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex h-9 items-center justify-center rounded-lg text-sm font-semibold text-flyt-purple transition hover:bg-flyt-purple-soft"
            >
              Open notification centre
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
