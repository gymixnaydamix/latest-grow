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

type ReadyMetric = { status: 'ready'; label: string; shortLabel?: string; tone: MetricTone };
type LoadingMetric = { status: 'loading' };
type ErrorMetric = { status: 'error' };
type EmptyMetric = { status: 'empty' };
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
      return 'border-danger/30 bg-danger-soft text-danger';
    case 'success':
      return 'border-success/30 bg-success-soft text-success';
    case 'warning':
      return 'border-warning/30 bg-warning-soft text-warning';
    default:
      return 'border-info/30 bg-info-soft text-info';
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

    return { ...homeMetrics, ...tenantMetrics };
  }, [
    homeQuery.data, homeQuery.isError, homeQuery.isLoading,
    tenantsQuery.data, tenantsQuery.isError, tenantsQuery.isLoading,
  ]);
}

/* ------------------------------------------------------------------ */
/*  MetricBadge                                                       */
/* ------------------------------------------------------------------ */
function MetricBadge({ itemId, metric, collapsed }: { itemId: string; metric: MetricState; collapsed: boolean }) {
  if (metric.status === 'error' || metric.status === 'empty') return null;

  if (metric.status === 'loading') {
    return (
      <span
        data-testid={`provider-subnav-metric-${itemId}`}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full border border-border/40 bg-muted',
          collapsed ? 'h-5 min-w-5 px-1.5' : 'h-5 min-w-[2.5rem] px-2',
        )}
      >
        <span className={cn('animate-pulse rounded-full bg-muted-foreground/20', collapsed ? 'h-2 w-3' : 'h-2 w-6')} />
      </span>
    );
  }

  return (
    <span
      data-testid={`provider-subnav-metric-${itemId}`}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border font-semibold tracking-wide',
        metricClasses(metric.tone),
        collapsed ? 'h-5 min-w-5 px-1.5 text-[10px]' : 'h-5 min-w-[2.5rem] px-2 text-[10px]',
      )}
    >
      {collapsed ? metric.shortLabel ?? metric.label : metric.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  ProviderSubNavList — flat premium module items                    */
/* ------------------------------------------------------------------ */
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
      <div ref={listRef} className={cn('space-y-1', collapsed ? 'px-1.5 py-2' : 'p-2')}>
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
                'group relative w-full overflow-hidden rounded-xl border text-left transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                collapsed
                  ? 'flex min-h-14 flex-col items-center justify-center gap-1 px-1.5 py-2'
                  : 'flex flex-col gap-2 px-3 py-2.5',
                isActive
                  ? 'border-primary/30 bg-primary/8 shadow-[var(--shadow-xs)]'
                  : 'border-border/40 bg-card hover:border-border hover:bg-card/80 hover:shadow-[var(--shadow-xs)]',
              )}
            >
              {/* Active accent line */}
              {isActive && !collapsed && (
                <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full bg-primary" />
              )}
              {isActive && collapsed && (
                <span className="absolute left-1 top-1 size-1.5 rounded-full bg-primary" />
              )}

              {/* Title row */}
              {collapsed ? (
                <>
                  <p className={cn(
                    'text-[9px] font-semibold leading-tight text-center line-clamp-2',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )}>
                    {item.label}
                  </p>
                  {/* Icon capsule under name */}
                  <div className={cn(
                    'flex items-center justify-center rounded-lg border',
                    isActive
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : 'border-border/40 bg-muted/50 text-muted-foreground',
                    'size-8',
                  )}>
                    {Icon ? <Icon className="size-3.5" /> : <PanelLeft className="size-3.5" />}
                  </div>
                  <MetricBadge itemId={item.id} metric={metric} collapsed />
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      'text-[13px] font-semibold leading-tight',
                      isActive ? 'text-foreground' : 'text-foreground/80',
                    )}>
                      {item.label}
                    </p>
                    <MetricBadge itemId={item.id} metric={metric} collapsed={false} />
                  </div>
                  {/* Icon capsule under name */}
                  <div className={cn(
                    'flex items-center justify-center rounded-lg border self-start',
                    isActive
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : 'border-border/40 bg-muted/50 text-muted-foreground',
                    'size-9',
                  )}>
                    {Icon ? <Icon className="size-4" /> : <PanelLeft className="size-4" />}
                  </div>
                  {/* Description */}
                  <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                    {item.description ?? `${parentLabel} overview`}
                  </p>
                </>
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
                    <p className="mt-1 text-[11px] text-muted-foreground">{item.description ?? `${parentLabel} overview`}</p>
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

/* ------------------------------------------------------------------ */
/*  ProviderSubNav — flat premium contextual modules panel            */
/* ------------------------------------------------------------------ */
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
      {/* Desktop panel */}
      <aside
        className={cn(
          'relative hidden shrink-0 overflow-hidden rounded-xl border border-border/60 bg-card/80 text-foreground shadow-[var(--shadow-sm)] transition-[width] duration-300 ease-out lg:flex lg:flex-col',
          collapsed ? 'w-20' : 'w-64',
        )}
        style={PANEL_HEIGHT}
        aria-label="Provider sub navigation"
      >
        {/* Header */}
        <div className={cn('border-b border-border/60', collapsed ? 'px-1.5 py-2' : 'px-3 py-2.5')}>
          <div className={cn('flex items-start', collapsed ? 'justify-center' : 'justify-between gap-3')}>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Subnav</p>
                <p className="mt-1 truncate text-[13px] font-semibold text-foreground">{parentLabel}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{items.length} views</p>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-lg border border-border/60 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? 'Expand sub navigation' : 'Collapse sub navigation'}
            >
              {collapsed ? <PanelLeftOpen className="size-3.5" /> : <PanelLeftClose className="size-3.5" />}
            </Button>
          </div>
        </div>

        <ProviderSubNavList items={items} parentLabel={parentLabel} collapsed={collapsed} />
      </aside>

      {/* Mobile trigger */}
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="fixed bottom-20 left-4 z-40 border border-border bg-card text-foreground shadow-[var(--shadow-sm)] hover:bg-muted lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open provider sub navigation"
      >
        <PanelLeft className="size-4" />
      </Button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close provider sub navigation"
          />

          <aside
            className="absolute bottom-16 left-4 top-20 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-xl"
            aria-label="Provider section navigation"
          >
            <div className="border-b border-border px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Provider Subnav</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{parentLabel}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {activeItem?.label ?? parentLabel}
                    {activeItem?.description ? ` \u00B7 ${activeItem.description}` : ''}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-lg border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
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
