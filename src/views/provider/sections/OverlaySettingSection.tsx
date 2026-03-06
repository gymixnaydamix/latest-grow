/* ─── OverlaySettingSection ─── Provider: overlay app management ── */
import { useEffect, useMemo, useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Eye,
  Power,
  Search,
  Settings,
  Shield,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import { useOverlayStore } from '@/store/overlay.store';
import { overlayAppList } from '@/overlay/overlay-registry';
import type { OverlayAppId } from '@/overlay/overlay-registry';
import { useUpdateOverlaySettings } from '@/hooks/api';

type OverlayMetric = { users: number; growth: number };
type OverlayRow = (typeof overlayAppList)[number] & OverlayMetric & { enabled: boolean };

/* ── Deterministic demo metrics derived from overlay app index ─── */
function buildOverlayMetrics(): Record<OverlayAppId, OverlayMetric> {
  const seeds: Record<OverlayAppId, [number, number]> = {
    studio: [1240, 12], media: [3200, 8], gamification: [4800, 22],
    leisure: [0, 0], market_overlay: [890, -3], lifestyle: [2100, 15],
    hobbies: [760, 5], knowledge: [1850, 18], sports: [420, 9],
    religion: [0, 0], services: [350, 2],
  };
  return Object.fromEntries(
    overlayAppList.map((app) => [app.id, { users: seeds[app.id]?.[0] ?? 0, growth: seeds[app.id]?.[1] ?? 0 }]),
  ) as Record<OverlayAppId, OverlayMetric>;
}
const overlayMetrics = buildOverlayMetrics();

function isOverlayAppId(value: string): value is OverlayAppId {
  return overlayAppList.some((app) => app.id === value);
}

function buildToggleAllPayload(enabled: boolean): Record<string, { enabled: boolean }> {
  return overlayAppList.reduce<Record<string, { enabled: boolean }>>((acc, app) => {
    acc[app.id] = { enabled };
    return acc;
  }, {});
}

export function OverlaySettingSection() {
  const { activeSubNav } = useNavigationStore();
  const enabledApps = useOverlayStore((s) => s.enabledApps);
  const setAppEnabled = useOverlayStore((s) => s.setAppEnabled);
  const setAllAppsEnabled = useOverlayStore((s) => s.setAllAppsEnabled);
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeSubNav, enabledApps]);
  const saveOverlay = useUpdateOverlaySettings();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<OverlayAppId | null>(() =>
    isOverlayAppId(activeSubNav) ? activeSubNav : null,
  );

  useEffect(() => {
    if (isOverlayAppId(activeSubNav)) {
      setSelectedId(activeSubNav);
    }
  }, [activeSubNav]);

  const apps = useMemo<OverlayRow[]>(
    () =>
      overlayAppList.map((app) => ({
        ...app,
        users: overlayMetrics[app.id].users,
        growth: overlayMetrics[app.id].growth,
        enabled: enabledApps[app.id] ?? true,
      })),
    [enabledApps],
  );

  const filtered = useMemo(
    () =>
      apps.filter(
        (app) =>
          app.label.toLowerCase().includes(search.toLowerCase()) ||
          app.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [apps, search],
  );

  const activeCount = apps.filter((app) => app.enabled).length;
  const totalUsers = apps.reduce((sum, app) => sum + app.users, 0);
  const avgGrowth = Math.round(
    apps.filter((app) => app.enabled).reduce((sum, app) => sum + app.growth, 0) / Math.max(activeCount, 1),
  );
  const selected = selectedId ? apps.find((app) => app.id === selectedId) ?? null : null;

  const toggleApp = (id: OverlayAppId) => {
    const nextEnabled = !(enabledApps[id] ?? true);
    setAppEnabled(id, nextEnabled);
    saveOverlay.mutate({ [id]: { enabled: nextEnabled } });
  };

  const statCards = [
    {
      label: 'Total Apps',
      value: String(apps.length),
      sub: `${activeCount} active`,
      change: `${activeCount}/${apps.length}`,
      up: true,
      gradient: 'from-blue-500/10 to-blue-500/5',
      borderGlow: 'hover:shadow-blue-500/20',
    },
    {
      label: 'Active Users',
      value: totalUsers.toLocaleString(),
      sub: 'Across all overlays',
      change: '+12%',
      up: true,
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      borderGlow: 'hover:shadow-emerald-500/20',
    },
    {
      label: 'Avg Growth',
      value: `${avgGrowth}%`,
      sub: 'Monthly avg',
      change: `${avgGrowth >= 0 ? '+' : ''}${avgGrowth}%`,
      up: avgGrowth >= 0,
      gradient: 'from-violet-500/10 to-violet-500/5',
      borderGlow: 'hover:shadow-violet-500/20',
    },
    {
      label: 'Engagement',
      value: '82%',
      sub: 'User satisfaction',
      change: '+4%',
      up: true,
      gradient: 'from-amber-500/10 to-amber-500/5',
      borderGlow: 'hover:shadow-amber-500/20',
    },
  ];

  return (
    <div ref={containerRef} className="flex h-full min-h-0 gap-1.5 overflow-hidden">
      <div className="grid min-h-0 min-w-0 flex-1 gap-1 lg:grid-cols-4 lg:grid-rows-[auto_auto_1fr]">
        {statCards.map((card) => (
          <div
            key={card.label}
            data-animate
            className={`group relative overflow-hidden rounded-xl border border-border/60 bg-linear-to-br ${card.gradient} p-2 transition-all duration-300 hover:scale-[1.02] ${card.borderGlow} shadow-sm hover:shadow-lg`}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">{card.label}</p>
                <p className="text-lg font-extrabold leading-tight tracking-tight">{card.value}</p>
                <div className="mt-0.5 flex items-center gap-1">
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${card.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}
                  >
                    {card.up ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                    {card.change}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground/70">{card.sub}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div
          data-animate
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 shadow-sm lg:col-span-4"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600 shadow-sm">
              <Settings className="size-3 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-semibold">Overlay Applications</h3>
              <p className="text-[10px] text-muted-foreground">
                {activeCount} active · {totalUsers.toLocaleString()} total users
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-44">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search overlays..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-8 rounded-lg pl-7 text-xs"
            />
          </div>
        </div>

        <div
          data-animate
          className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm lg:col-span-4"
        >
          <div className="grid min-h-0 grid-cols-1 gap-1.5 overflow-auto p-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedId(app.id === selectedId ? null : app.id)}
                className={`group/card relative flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 transition-all duration-200 ${
                  app.id === selectedId
                    ? 'border-primary/50 bg-primary/5 shadow-md'
                    : 'border-border/40 hover:border-border/80 hover:bg-muted/20 hover:shadow-sm'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${app.color} shadow-sm ${!app.enabled ? 'opacity-40 grayscale' : ''}`}
                >
                  <app.icon className="size-4 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">{app.label}</p>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleApp(app.id);
                      }}
                      className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors duration-200 ${app.enabled ? 'bg-emerald-500' : 'bg-muted-foreground/20'}`}
                      aria-label={`Toggle ${app.label}`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          app.enabled ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{app.description}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {app.enabled ? (
                      <>
                        <span className="text-[10px] font-medium">
                          <span className="text-xs font-bold">{app.users.toLocaleString()}</span> users
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[10px] font-bold ${app.growth >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}
                        >
                          {app.growth >= 0 ? <ArrowUpRight className="size-2" /> : <ArrowDownRight className="size-2" />}
                          {app.growth >= 0 ? '+' : ''}
                          {app.growth}%
                        </span>
                        <span className="rounded bg-muted/40 px-1 py-0.5 text-[10px] text-muted-foreground/70">
                          {app.category}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] italic text-muted-foreground">Disabled</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden min-h-0 w-44 shrink-0 flex-col gap-1 lg:flex">
        <div
          data-animate
          className="group relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl transition-all duration-300 hover:shadow-violet-500/15"
        >
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-violet-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-card/95" />
          <div className="relative flex min-h-0 flex-1 flex-col">
            {selected ? (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br ${selected.color} shadow-sm`}>
                    <selected.icon className="size-3.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">{selected.label}</h3>
                    <span
                      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        selected.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {selected.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <p className="mb-2 text-[10px] text-muted-foreground/70">{selected.description}</p>
                <div className="flex min-h-0 flex-col gap-1.5 overflow-auto">
                  {[
                    { icon: Eye, label: 'Active Users', value: selected.users.toLocaleString() },
                    { icon: BarChart3, label: 'Growth', value: `${selected.growth >= 0 ? '+' : ''}${selected.growth}%` },
                    { icon: Shield, label: 'Category', value: selected.category },
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 p-1.5">
                      <metric.icon className="size-3 text-muted-foreground/70" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-muted-foreground/70">{metric.label}</p>
                        <p className="text-xs font-bold text-foreground">{metric.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-[10px] text-muted-foreground text-center">
                  Select an overlay
                  <br />
                  to view details
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          data-animate
          className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl transition-all duration-300 hover:shadow-blue-500/15"
          style={{ minHeight: 120 }}
        >
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500 via-cyan-500 to-teal-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-card/95" />
          <div className="relative flex flex-col gap-1.5">
            <h3 className="text-[11px] font-semibold text-foreground">Categories</h3>
            {Array.from(new Set(apps.map((app) => app.category))).map((category) => {
              const count = apps.filter((app) => app.category === category).length;
              const active = apps.filter((app) => app.category === category && app.enabled).length;
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{category}</span>
                  <span className="text-[10px] font-bold text-foreground/90">
                    {active}/{count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          data-animate
          className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl transition-all duration-300 hover:shadow-amber-500/15"
        >
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-red-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-card/95" />
          <div className="relative flex flex-col gap-1">
            <h3 className="text-[11px] font-semibold text-foreground">Bulk Actions</h3>
            <button
              onClick={() => {
                setAllAppsEnabled(true);
                saveOverlay.mutate(buildToggleAllPayload(true));
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400 transition-all hover:bg-emerald-500/20"
            >
              <Power className="size-2.5" />
              Enable All
            </button>
            <button
              onClick={() => {
                setAllAppsEnabled(false);
                saveOverlay.mutate(buildToggleAllPayload(false));
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-400 transition-all hover:bg-red-500/20"
            >
              <Power className="size-2.5" />
              Disable All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
