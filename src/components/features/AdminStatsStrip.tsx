/* ─── AdminStatsStrip ─── Real-time KPI stat cards for the admin dashboard ─── */
import { useCallback, useMemo, type ReactNode } from 'react';
import {
  Users, UserCheck, BookOpen, CalendarDays,
  ClipboardCheck, CreditCard, UserPlus, AlertCircle,
  Loader2, RefreshCw, ShieldAlert,
} from 'lucide-react';
import { StatCard } from '@/components/features/StatCard';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useDashboardKPIs } from '@/hooks/api/use-school';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardKPI } from '@root/types';
import type { Permission } from '@/constants/permissions';

/* ══════════════════════════════════════════════════════════════════════
 * Stat mapping — maps KPI label → visual presentation & navigation
 * ══════════════════════════════════════════════════════════════════════ */
interface StatMapping {
  icon: ReactNode;
  accentColor: string;
  suffix?: string;
  navigateTo: { section: string; header?: string };
  requiredPermission?: Permission;
}

const IC = 'size-5 text-white/80';

/** Each key corresponds to the KPI `label` returned by the backend */
const STAT_MAP: Record<string, StatMapping> = {
  'Total Students': {
    icon: <Users className={IC} />,
    accentColor: '#818cf8',
    navigateTo: { section: 'students' },
    requiredPermission: 'students.read',
  },
  'Staff Members': {
    icon: <UserCheck className={IC} />,
    accentColor: '#34d399',
    navigateTo: { section: 'staff' },
    requiredPermission: 'staff.read',
  },
  'Active Courses': {
    icon: <BookOpen className={IC} />,
    accentColor: '#f59e0b',
    navigateTo: { section: 'academics' },
    requiredPermission: 'academics.read',
  },
  'Attendance Today': {
    icon: <ClipboardCheck className={IC} />,
    accentColor: '#06b6d4',
    suffix: '%',
    navigateTo: { section: 'students', header: 'attendance' },
    requiredPermission: 'attendance.read',
  },
  'Fee Collection': {
    icon: <CreditCard className={IC} />,
    accentColor: '#10b981',
    suffix: '%',
    navigateTo: { section: 'finance' },
    requiredPermission: 'finance.read',
  },
  'Pending Approvals': {
    icon: <ShieldAlert className={IC} />,
    accentColor: '#f97316',
    navigateTo: { section: 'control_center', header: 'approvals' },
    requiredPermission: 'approvals.view',
  },
  'Applicants': {
    icon: <UserPlus className={IC} />,
    accentColor: '#a78bfa',
    navigateTo: { section: 'admissions' },
    requiredPermission: 'admissions.read',
  },
  'Upcoming Events': {
    icon: <CalendarDays className={IC} />,
    accentColor: '#ec4899',
    navigateTo: { section: 'control_center', header: 'calendar' },
  },
};

/* ══════════════════════════════════════════════════════════════════════
 * Skeleton loader
 * ══════════════════════════════════════════════════════════════════════ */
function StatCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border-white/6 bg-white/3 backdrop-blur-xl animate-pulse">
      <CardContent className="p-5 space-y-3">
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="h-8 w-16 rounded bg-white/8" />
        <div className="h-3 w-20 rounded bg-white/6" />
      </CardContent>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * Safely extract KPI array from various API response shapes
 * ══════════════════════════════════════════════════════════════════════ */
function extractKpis(data: unknown): DashboardKPI[] {
  if (Array.isArray(data)) return data as DashboardKPI[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as DashboardKPI[];
    if (Array.isArray(obj.items)) return obj.items as DashboardKPI[];
  }
  return [];
}

/* ══════════════════════════════════════════════════════════════════════
 * Time-ago formatter
 * ══════════════════════════════════════════════════════════════════════ */
function formatTimeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

/* ══════════════════════════════════════════════════════════════════════
 * Main Component
 * ══════════════════════════════════════════════════════════════════════ */
export function AdminStatsStrip() {
  const { schoolId } = useAuthStore();
  const navigate = useNavigationStore(s => s.navigate);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useDashboardKPIs(schoolId);

  const kpis = useMemo(() => extractKpis(data), [data]);

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  const handleCardClick = useCallback(
    (section: string, header?: string) => { navigate(section, header); },
    [navigate],
  );

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" aria-label="Loading statistics">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (isError) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="size-5 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-300">Failed to load dashboard statistics</p>
            <p className="text-xs text-red-400/60 truncate">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="shrink-0 border-red-500/30 text-red-300 hover:bg-red-500/10"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ── Empty state ── */
  if (kpis.length === 0) {
    return (
      <Card className="border-white/6 bg-white/3">
        <CardContent className="flex items-center justify-center gap-2 p-6">
          <Loader2 className="size-4 text-muted-foreground/40 animate-spin" />
          <p className="text-sm text-muted-foreground/60">No statistics available yet</p>
        </CardContent>
      </Card>
    );
  }

  /* ── Render stat cards + refresh bar ── */
  return (
    <div className="space-y-2">
      {/* Stats grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        role="region"
        aria-label="Dashboard statistics"
      >
        {kpis.map((kpi) => {
          const mapping = STAT_MAP[kpi.label];
          if (!mapping) return null;

          const numericValue = typeof kpi.value === 'string'
            ? parseFloat(kpi.value) || 0
            : kpi.value;

          const sparkline = Array.isArray(kpi.sparklineData) && kpi.sparklineData.length > 1
            ? kpi.sparklineData
            : undefined;

          const card = (
            <button
              key={kpi.label}
              type="button"
              className="text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl transition-transform active:scale-[0.98]"
              onClick={() => handleCardClick(mapping.navigateTo.section, mapping.navigateTo.header)}
              aria-label={`${kpi.label}: ${kpi.value}${mapping.suffix ?? ''}. ${kpi.changeLabel || ''}. Click to view details.`}
            >
              <StatCard
                label={kpi.label}
                value={numericValue}
                suffix={mapping.suffix}
                trend={kpi.trend}
                trendLabel={kpi.changeLabel || undefined}
                icon={mapping.icon}
                accentColor={mapping.accentColor}
                sparklineData={sparkline}
              />
            </button>
          );

          if (mapping.requiredPermission) {
            return (
              <PermissionGate key={kpi.label} requires={mapping.requiredPermission}>
                {card}
              </PermissionGate>
            );
          }

          return card;
        })}
      </div>

      {/* Refresh bar */}
      <div className="flex items-center justify-end gap-2 px-1">
        <span className="text-[10px] text-muted-foreground/40 tabular-nums">
          {dataUpdatedAt > 0 ? `Updated ${formatTimeAgo(dataUpdatedAt)}` : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 text-muted-foreground/40 hover:text-muted-foreground"
          onClick={handleRefresh}
          disabled={isFetching}
          aria-label="Refresh statistics"
        >
          <RefreshCw className={`size-3 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
