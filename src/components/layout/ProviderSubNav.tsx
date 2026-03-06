import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PanelLeft, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useChildStagger } from '@/hooks/use-animate';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderHome, useProviderTenants } from '@/hooks/api/use-provider-console';
import type { SubNavItem } from '@/constants/navigation';

const PROVIDER_BASE = '/provider/home';
const PANEL_HEIGHT = { height: 'calc(100vh - 5.5rem)' };

type MetricTone = 'neutral' | 'danger' | 'success' | 'warning';

type ReadyMetric = {
  status: 'ready';
  label: string;
  shortLabel?: string;
  tone: MetricTone;
};

type LoadingMetric = {
  status: 'loading';
};

type ErrorMetric = {
  status: 'error';
};

type EmptyMetric = {
  status: 'empty';
};

type MetricState = ReadyMetric | LoadingMetric | ErrorMetric | EmptyMetric;

interface ProviderSubNavProps {
  items: SubNavItem[];
  parentLabel: string;
}

interface ProviderSubNavListProps {
  items: SubNavItem[];
  parentLabel: string;
  collapsed: boolean;
  onItemClick?: () => void;
}

function compactCount(value: number) {
  if (value > 99) return '99+';
  return String(value);
}

function metricClasses(tone: MetricTone) {
  switch (tone) {
    case 'danger':
      return 'border-red-400/40 bg-red-500/15 text-red-100';
    case 'success':
      return 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100';
    case 'warning':
      return 'border-amber-400/40 bg-amber-500/15 text-amber-100';
    default:
      return 'border-sky-400/40 bg-sky-500/15 text-sky-100';
  }
}

function useProviderSubNavMetrics() {
  const homeQuery = useProviderHome();
  const tenantsQuery = useProviderTenants({});

  return useMemo<Record<string, MetricState>>(() => {
    const home = homeQuery.data;
    const tenants = tenantsQuery.data ?? [];

    const homeMetrics: Record<string, MetricState> = homeQuery.isLoading
      ? {
          home_inbox: { status: 'loading' },
          home_health: { status: 'loading' },
          home_onboarding: { status: 'loading' },
          home_billing: { status: 'loading' },
          home_system: { status: 'loading' },
        }
      : homeQuery.isError
        ? {
            home_inbox: { status: 'error' },
            home_health: { status: 'error' },
            home_onboarding: { status: 'error' },
            home_billing: { status: 'error' },
            home_system: { status: 'error' },
          }
        : {
            home_inbox: {
              status: 'ready',
              label: compactCount(home?.actionInbox.length ?? 0),
              tone: (home?.actionInbox.length ?? 0) > 0 ? 'warning' : 'neutral',
            },
            home_health: {
              status: 'ready',
              label: compactCount(home?.tenantHealthWatchlist.length ?? 0),
              tone: (home?.tenantHealthWatchlist.length ?? 0) > 0 ? 'warning' : 'neutral',
            },
            home_onboarding: {
              status: 'ready',
              label: compactCount((home?.onboardingPipeline ?? []).reduce((total, stage) => total + stage.count, 0)),
              tone: 'neutral',
            },
            home_billing: {
              status: 'ready',
              label: compactCount(home?.billingExceptions.length ?? 0),
              tone: (home?.billingExceptions.length ?? 0) > 0 ? 'warning' : 'neutral',
            },
            home_system:
              (home?.systemHealth.activeIncidents ?? 0) > 0
                ? {
                    status: 'ready',
                    label: compactCount(home?.systemHealth.activeIncidents ?? 0),
                    tone: 'danger',
                  }
                : {
                    status: 'ready',
                    label: 'Healthy',
                    shortLabel: 'OK',
                    tone: 'success',
                  },
          };

    const tenantMetrics: Record<string, MetricState> = tenantsQuery.isLoading
      ? {
          tenants_list: { status: 'loading' },
          tenants_status: { status: 'loading' },
          tenants_profiles: { status: 'loading' },
          tenants_maintenance: { status: 'loading' },
        }
      : tenantsQuery.isError
        ? {
            tenants_list: { status: 'error' },
            tenants_status: { status: 'error' },
            tenants_profiles: { status: 'error' },
            tenants_maintenance: { status: 'error' },
          }
        : {
            tenants_list: {
              status: 'ready',
              label: compactCount(tenants.length),
              tone: 'neutral',
            },
            tenants_status: {
              status: 'ready',
              label: compactCount(tenants.filter((tenant) => tenant.status !== 'ACTIVE').length),
              tone: tenants.some((tenant) => tenant.status !== 'ACTIVE') ? 'warning' : 'neutral',
            },
            tenants_profiles: {
              status: 'ready',
              label: compactCount(tenants.length),
              tone: 'neutral',
            },
            tenants_maintenance: {
              status: 'ready',
              label: compactCount(
                tenants.filter(
                  (tenant) =>
                    tenant.health !== 'HEALTHY' ||
                    tenant.incidentsOpen > 0 ||
                    tenant.billingStatus !== 'GOOD',
                ).length,
              ),
              tone: tenants.some(
                (tenant) =>
                  tenant.health !== 'HEALTHY' ||
                  tenant.incidentsOpen > 0 ||
                  tenant.billingStatus !== 'GOOD',
              )
                ? 'danger'
                : 'success',
            },
          };

    return {
      ...homeMetrics,
      ...tenantMetrics,
    };
  }, [
    homeQuery.data,
    homeQuery.isError,
    homeQuery.isLoading,
    tenantsQuery.data,
    tenantsQuery.isError,
    tenantsQuery.isLoading,
  ]);
}

function MetricBadge({ itemId, metric, collapsed }: { itemId: string; metric: MetricState; collapsed: boolean }) {
  if (metric.status === 'error' || metric.status === 'empty') return null;

  if (metric.status === 'loading') {
    return (
      <span
        data-testid={`provider-subnav-metric-${itemId}`}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5',
          collapsed ? 'h-5 min-w-5 px-1.5' : 'h-6 min-w-[3.25rem] px-2',
        )}
      >
        <span className={cn('animate-pulse rounded-full bg-white/15', collapsed ? 'h-2 w-3' : 'h-2 w-8')} />
      </span>
    );
  }

  return (
    <span
      data-testid={`provider-subnav-metric-${itemId}`}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border font-semibold tracking-wide',
        metricClasses(metric.tone),
        collapsed ? 'h-5 min-w-5 px-1.5 text-[10px]' : 'h-6 min-w-[3.25rem] px-2 text-[10px]',
      )}
    >
      {collapsed ? metric.shortLabel ?? metric.label : metric.label}
    </span>
  );
}

function ProviderSubNavList({ items, parentLabel, collapsed, onItemClick }: ProviderSubNavListProps) {
  const { activeSubNav, setSubNav } = useNavigationStore();
  const navTo = useNavigate();
  const { pathname } = useLocation();
  const listRef = useChildStagger<HTMLDivElement>([items, activeSubNav, collapsed], 'animate-fade-right', 30);
  const metricsById = useProviderSubNavMetrics();

  useEffect(() => {
    if (items.length > 0 && !items.find((item) => item.id === activeSubNav)) {
      setSubNav(items[0].id);
    }
  }, [items, activeSubNav, setSubNav]);

  return (
    <ScrollArea className="flex-1">
      <div ref={listRef} className={cn('space-y-2', collapsed ? 'px-2 py-3' : 'p-3')}>
        {items.map((item) => {
          const isActive = activeSubNav === item.id;
          const Icon = item.icon;
          const metric = metricsById[item.id] ?? { status: 'empty' as const };

          const button = (
            <button
              type="button"
              onClick={() => {
                setSubNav(item.id);
                const targetPath = item.path ?? PROVIDER_BASE;
                if (targetPath && pathname !== targetPath) {
                  navTo(targetPath);
                }
                onItemClick?.();
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60',
                collapsed
                  ? 'flex min-h-16 flex-col items-center justify-center gap-1.5 px-2 py-2'
                  : 'flex items-start gap-3 px-3 py-3',
                isActive
                  ? 'border-sky-400/40 bg-[linear-gradient(180deg,rgba(14,165,233,0.18)_0%,rgba(15,23,42,0.94)_46%,rgba(15,23,42,0.88)_100%)] text-white shadow-[0_18px_40px_-24px_rgba(56,189,248,0.75)]'
                  : 'border-slate-400/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.82)_100%)] text-slate-100 hover:-translate-y-0.5 hover:border-sky-400/20 hover:shadow-[0_18px_32px_-24px_rgba(15,23,42,0.9)]',
              )}
            >
              {isActive && (
                <span
                  className={cn(
                    'absolute rounded-full bg-sky-300 shadow-[0_0_16px_rgba(125,211,252,0.9)]',
                    collapsed ? 'left-1.5 top-1.5 size-1.5' : 'left-2 top-3 h-8 w-1',
                  )}
                />
              )}

              <div
                className={cn(
                  'relative flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
                  collapsed ? 'size-10' : 'size-11',
                )}
              >
                {Icon ? <Icon className={collapsed ? 'size-4' : 'size-5'} /> : <PanelLeft className={collapsed ? 'size-4' : 'size-5'} />}
              </div>

              {collapsed ? (
                <MetricBadge itemId={item.id} metric={metric} collapsed />
              ) : (
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold tracking-tight text-white">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-300/80">
                        {item.description ?? `${parentLabel} overview`}
                      </p>
                    </div>
                    <MetricBadge itemId={item.id} metric={metric} collapsed={false} />
                  </div>
                </div>
              )}
            </button>
          );

          return (
            <div key={item.id}>
              {collapsed ? (
                <Tooltip delayDuration={150}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12} className="max-w-56">
                    <p className="font-semibold">{item.label}</p>
                    <p className="mt-1 text-[11px] text-background/80">{item.description ?? `${parentLabel} overview`}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                button
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

export function ProviderSubNav({ items, parentLabel }: ProviderSubNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { activeSubNav } = useNavigationStore();
  const activeItem = items.find((item) => item.id === activeSubNav) ?? items[0];

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  if (!items.length) return null;

  return (
    <>
      <aside
        className={cn(
          'relative hidden shrink-0 overflow-hidden rounded-[28px] border border-sky-400/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(15,23,42,0.92)_100%)] text-slate-100 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.95)] backdrop-blur-xl transition-[width] duration-300 ease-out lg:flex lg:flex-col',
          collapsed ? 'w-20' : 'w-72',
        )}
        style={PANEL_HEIGHT}
        aria-label="Provider sub navigation"
      >
        <div className={cn('border-b border-white/8', collapsed ? 'px-2 py-3' : 'px-3 py-3.5')}>
          <div className={cn('flex items-start', collapsed ? 'justify-center' : 'justify-between gap-3')}>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200/70">Provider Subnav</p>
                <p className="mt-2 truncate text-sm font-semibold text-white">{parentLabel}</p>
                <p className="mt-1 text-xs text-slate-300/75">{items.length} views available</p>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full border border-white/8 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? 'Expand provider sub navigation' : 'Collapse provider sub navigation'}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </Button>
          </div>
        </div>

        <ProviderSubNavList items={items} parentLabel={parentLabel} collapsed={collapsed} />
      </aside>

      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="fixed bottom-20 left-4 z-40 border border-sky-400/20 bg-slate-950/90 text-sky-100 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.9)] hover:bg-slate-900 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open provider sub navigation"
      >
        <PanelLeft className="size-4" />
      </Button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close provider sub navigation"
          />

          <aside
            className="absolute bottom-16 left-4 top-20 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-[28px] border border-sky-400/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(15,23,42,0.94)_100%)] text-slate-100 shadow-2xl"
            aria-label="Provider section navigation"
          >
            <div className="border-b border-white/8 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200/70">Provider Subnav</p>
                  <p className="mt-2 text-base font-semibold text-white">{parentLabel}</p>
                  <p className="mt-1 text-xs text-slate-300/80">
                    {activeItem?.label ?? parentLabel}
                    {activeItem?.description ? ` · ${activeItem.description}` : ''}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full border border-white/8 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close provider section navigation"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <ProviderSubNavList
              items={items}
              parentLabel={parentLabel}
              collapsed={false}
              onItemClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
