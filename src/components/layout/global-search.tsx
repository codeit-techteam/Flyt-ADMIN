"use client";

import { cn } from "@/lib/cn";
import { globalSearch, type GlobalSearchHit } from "@/services/data";
import {
  Activity,
  ArrowRight,
  Car,
  Command,
  CornerDownLeft,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

const typeMeta: Record<
  GlobalSearchHit["type"],
  { label: string; icon: typeof Search; iconClass: string; chipClass: string }
> = {
  ride: {
    label: "Ride",
    icon: Activity,
    iconClass: "bg-flyt-purple text-white",
    chipClass: "bg-flyt-purple-soft text-flyt-purple",
  },
  customer: {
    label: "Customer",
    icon: Users,
    iconClass: "bg-info text-white",
    chipClass: "bg-info-soft text-info",
  },
  pilot: {
    label: "Pilot",
    icon: ShieldCheck,
    iconClass: "bg-success text-white",
    chipClass: "bg-success-soft text-success",
  },
  vehicle: {
    label: "Vehicle",
    icon: Car,
    iconClass: "bg-warning text-white",
    chipClass: "bg-warning-soft text-warning",
  },
};

const CATEGORY_SHORTCUTS = [
  { label: "Rides", href: "/rides", icon: Activity, hint: "Trip history" },
  { label: "Customers", href: "/customers", icon: Users, hint: "Rider accounts" },
  { label: "Pilots", href: "/pilots", icon: ShieldCheck, hint: "Driver roster" },
  { label: "Vehicles", href: "/vehicles", icon: Car, hint: "Fleet & plates" },
] as const;

const OPS_SHORTCUTS = [
  { label: "Live Operations", href: "/live-operations", icon: Radio },
  { label: "SOS queue", href: "/safety", icon: ShieldAlert },
] as const;

const EXAMPLE_QUERIES = ["Ananya", "TS09", "RD-9F2A1C", "Hyderabad"] as const;

function useIsMac() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);
  return isMac;
}

export function GlobalSearch() {
  const router = useRouter();
  const isMac = useIsMac();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<GlobalSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHits([]);
    setActiveIndex(0);
  }, []);

  const openSearch = useCallback(() => {
    setOpen(true);
    requestAnimationFrame(() => {
      (window.matchMedia("(min-width: 768px)").matches
        ? inputRef.current
        : mobileInputRef.current
      )?.focus();
    });
  }, []);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) close();
        else openSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, openSearch]);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [open, close]);

  useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 1) {
      setHits([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      const results = await globalSearch(q);
      if (!cancelled) {
        setHits(results);
        setActiveIndex(0);
        setLoading(false);
      }
    }, 140);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, open]);

  const grouped = useMemo(() => {
    const map = new Map<GlobalSearchHit["type"], GlobalSearchHit[]>();
    for (const hit of hits) {
      const list = map.get(hit.type) ?? [];
      list.push(hit);
      map.set(hit.type, list);
    }
    return map;
  }, [hits]);

  function goTo(href: string) {
    close();
    router.push(href);
  }

  function onSubmitSearch() {
    const q = query.trim();
    if (!q) return;
    if (hits[activeIndex]) {
      goTo(hits[activeIndex].href);
      return;
    }
    goTo(`/rides?q=${encodeURIComponent(q)}`);
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(hits.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      onSubmitSearch();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  return (
    <div className="contents md:block md:w-full md:max-w-xl">
      {/* Desktop — unified command panel when open */}
      <div
        className={cn("relative hidden w-full min-w-0 md:block", open && "z-40")}
        ref={rootRef}
      >
        <div
          className={cn(
            "overflow-hidden border bg-surface transition-all duration-200",
            open
              ? "rounded-2xl border-flyt-purple/25 shadow-[0_0_0_4px_rgba(61,30,99,0.1),var(--shadow-overlay)]"
              : "rounded-full border-border shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] hover:border-flyt-purple/30 hover:shadow-[var(--shadow-card)]",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2.5 px-3.5",
              open ? "h-12 border-b border-border bg-ground/40" : "h-11 bg-ground/70",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition",
                open ? "bg-flyt-purple text-white" : "bg-flyt-purple-soft text-flyt-purple",
              )}
            >
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onInputKeyDown}
              placeholder="Search rides, customers, pilots, vehicles…"
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:font-normal placeholder:text-[#8b919c]"
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                hits[activeIndex] ? `${listId}-${hits[activeIndex].id}` : undefined
              }
              autoComplete="off"
            />
            {query ? (
              <button
                type="button"
                className="rounded-full p-1.5 text-[#6b7280] transition hover:bg-ground hover:text-ink"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setHits([]);
                  inputRef.current?.focus();
                }}
              >
                <X className="h-4 w-4" />
              </button>
            ) : open ? (
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs font-semibold text-[#6b7280] hover:bg-ground hover:text-ink"
                onClick={close}
              >
                Esc
              </button>
            ) : (
              <kbd className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-1.5 py-1 text-[10px] font-semibold text-[#6b7280]">
                {isMac ? <Command className="h-2.5 w-2.5" /> : <span>Ctrl</span>}
                <span>K</span>
              </kbd>
            )}
          </div>

          {open ? (
            <div id={listId} role="listbox" className="bg-surface">
              <SearchPanel
                query={query}
                loading={loading}
                grouped={grouped}
                hits={hits}
                activeIndex={activeIndex}
                listId={listId}
                onSelect={goTo}
                onHoverIndex={setActiveIndex}
                onExample={(value) => {
                  setQuery(value);
                  inputRef.current?.focus();
                }}
              />
              <div className="flex items-center justify-between gap-2 border-t border-border bg-ground/50 px-3 py-2 text-[11px] text-[#6b7280]">
                <span className="inline-flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="rounded border border-border bg-surface px-1 font-semibold">↑↓</span>
                    navigate
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CornerDownLeft className="h-3 w-3" />
                    open
                  </span>
                </span>
                <span>{hits.length > 0 ? `${hits.length} results` : "Global admin search"}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-ground text-flyt-purple hover:border-flyt-purple/30 hover:bg-flyt-purple-soft md:hidden"
        aria-label="Search"
        onClick={openSearch}
      >
        <Search className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-ink/45 p-3 backdrop-blur-[2px] md:hidden">
          <div
            className="mx-auto mt-1 max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-overlay)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 items-center gap-2.5 border-b border-border bg-ground/40 px-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-flyt-purple text-white">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                ref={mobileInputRef}
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search rides, customers, pilots…"
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:font-normal placeholder:text-[#8b919c]"
              />
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs font-semibold text-[#6b7280] hover:bg-ground hover:text-ink"
                onClick={close}
              >
                Close
              </button>
            </div>
            <SearchPanel
              query={query}
              loading={loading}
              grouped={grouped}
              hits={hits}
              activeIndex={activeIndex}
              listId={`${listId}-mobile`}
              onSelect={goTo}
              onHoverIndex={setActiveIndex}
              onExample={(value) => {
                setQuery(value);
                mobileInputRef.current?.focus();
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SearchPanel({
  query,
  loading,
  grouped,
  hits,
  activeIndex,
  listId,
  onSelect,
  onHoverIndex,
  onExample,
}: {
  query: string;
  loading: boolean;
  grouped: Map<GlobalSearchHit["type"], GlobalSearchHit[]>;
  hits: GlobalSearchHit[];
  activeIndex: number;
  listId: string;
  onSelect: (href: string) => void;
  onHoverIndex: (index: number) => void;
  onExample: (value: string) => void;
}) {
  const q = query.trim();
  let idx = -1;

  if (!q) {
    return (
      <div className="max-h-[min(26rem,70vh)] overflow-y-auto p-3">
        <p className="mb-2 px-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
          Browse by type
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => onSelect(item.href)}
                className="group flex items-start gap-2.5 rounded-xl border border-border bg-ground/40 p-3 text-left transition hover:border-flyt-purple/30 hover:bg-flyt-purple-soft/60"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-flyt-purple shadow-sm ring-1 ring-border transition group-hover:bg-flyt-purple group-hover:text-white group-hover:ring-flyt-purple">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{item.label}</span>
                  <span className="block text-[11px] text-[#6b7280]">{item.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mb-2 mt-4 px-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
          Operations
        </p>
        <div className="space-y-1">
          {OPS_SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => onSelect(item.href)}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-flyt-purple-soft"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ground text-flyt-purple ring-1 ring-border">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-sm font-semibold text-ink">{item.label}</span>
                <ArrowRight className="h-4 w-4 text-[#9ca3af]" />
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-border bg-ground/30 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">Try searching</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAMPLE_QUERIES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => onExample(example)}
                className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-ink transition hover:border-flyt-purple/40 hover:bg-flyt-purple-soft hover:text-flyt-purple"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-ground/70 p-2.5">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-border/70" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 animate-pulse rounded bg-border/70" />
              <div className="h-2.5 w-2/3 animate-pulse rounded bg-border/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (hits.length === 0) {
    return (
      <div className="px-4 py-9 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ground text-[#9ca3af] ring-1 ring-border">
          <Search className="h-5 w-5" />
        </span>
        <p className="mt-3 text-sm font-semibold text-ink">No matches for “{q}”</p>
        <p className="mt-1 text-xs text-[#6b7280]">Try an ID, name, plate, phone, or city.</p>
        <button
          type="button"
          onClick={() => onSelect(`/rides?q=${encodeURIComponent(q)}`)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-flyt-purple px-3.5 py-2 text-xs font-semibold text-white hover:bg-flyt-purple-hover"
        >
          Search rides for “{q}”
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-[min(24rem,65vh)] overflow-y-auto p-2">
      {Array.from(grouped.entries()).map(([type, rows]) => {
        const meta = typeMeta[type];
        return (
          <div key={type} className="mb-1 last:mb-0">
            <p className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7280]">
              {meta.label}s · {rows.length}
            </p>
            <ul>
              {rows.map((hit) => {
                idx += 1;
                const current = idx;
                const Icon = meta.icon;
                const active = current === activeIndex;
                return (
                  <li key={hit.id}>
                    <button
                      type="button"
                      id={`${listId}-${hit.id}`}
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => onHoverIndex(current)}
                      onClick={() => onSelect(hit.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition",
                        active
                          ? "bg-flyt-purple-soft ring-1 ring-flyt-purple/15"
                          : "hover:bg-ground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm",
                          meta.iconClass,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{hit.title}</span>
                        <span className="block truncate text-xs text-[#6b7280]">{hit.subtitle}</span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          meta.chipClass,
                        )}
                      >
                        {meta.label}
                      </span>
                      {active ? <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-flyt-purple" /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
