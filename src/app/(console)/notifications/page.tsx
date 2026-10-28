"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";
import {
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
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

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

export default function NotificationsPage() {
  const router = useRouter();
  const { push } = useToast();
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("customers");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const refresh = useCallback(async () => {
    const list = await listNotifications();
    setItems(list);
    setLoadingInbox(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const visible = useMemo(
    () => (filter === "unread" ? items.filter((n) => !n.read) : items),
    [filter, items],
  );

  async function onOpenItem(item: AdminNotification) {
    if (!item.read) {
      await markNotificationRead(item.id);
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    }
    router.push(item.href);
  }

  async function onMarkAll() {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    push("All notifications marked as read.", "success");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      push("Title and message are required.", "error");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    push("Notification queued locally. Delivery API is not connected.", "info");
    setTitle("");
    setBody("");
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Admin inbox and outbound message composer. Delivery requires a notification backend."
        actions={
          unread > 0 ? (
            <Button variant="outline" size="sm" onClick={onMarkAll}>
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          ) : null
        }
      />

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader
            title="Inbox"
            description={unread > 0 ? `${unread} unread` : "All caught up"}
            action={
              <div className="flex rounded-lg border border-border p-0.5">
                {(["all", "unread"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition",
                      filter === key
                        ? "bg-flyt-purple text-white"
                        : "text-muted hover:text-ink",
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>
            }
          />
          <CardBody className="space-y-2 p-3 sm:p-4">
            {loadingInbox ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : visible.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted/40" />
                <p className="mt-2 text-sm font-medium text-ink">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
              </div>
            ) : (
              visible.map((item) => {
                const meta = categoryMeta[item.category];
                const Icon = meta.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenItem(item)}
                    className={cn(
                      "flex w-full gap-3 rounded-xl border px-3 py-3 text-left transition hover:border-flyt-purple/25 hover:shadow-sm",
                      item.read
                        ? "border-border bg-surface"
                        : "border-flyt-purple/20 bg-flyt-purple-soft/30",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
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
                      <span className="mt-0.5 line-clamp-2 text-sm text-muted">{item.body}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                        <span className="font-mono text-[11px] text-muted">{item.id}</span>
                        <span className="text-[11px] text-muted">{formatRelative(item.createdAt)}</span>
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            title="Compose"
            description="Queue outbound push / in-app messages"
          />
          <CardBody>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Select label="Audience" value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="customers">Customers</option>
                <option value="pilots">Pilots</option>
                <option value="all">All users</option>
              </Select>
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-ink">Message</span>
                <textarea
                  className="min-h-28 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-flyt-purple focus:ring-2 focus:ring-flyt-purple/20"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write the notification copy…"
                />
              </label>
              <Button type="submit" loading={loading} className="w-full sm:w-auto">
                Queue notification
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
