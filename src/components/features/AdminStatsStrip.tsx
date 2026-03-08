/* ─── AdminStatsStrip ─── Real-time KPI stat cards for the admin dashboard ─── */
import type { ReactNode } from 'react';
import {
  Users, UserCheck, BookOpen, CalendarDays,
  ClipboardCheck, CreditCard, UserPlus, AlertCircle,
  Loader2,
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

/* ── Stat configuration — maps KPI label → presentation & action ── */
interface StatMapping {
  icon: ReactNode;
  accentColor: string;
  suffix?: string;
  /** Navigation target when the card is clicked */
  navigateTo: { section: string; header?: string };
  /** If set, the card is only visible to roles with this permission */
  requiredPermission?: Permission;
}

const ICON_SIZE = 'size-5 text-white/80';

const STAT_MAP: Record<string, StatMapping> = {
  'Total Students': {
    icon: <Users className={ICON_SIZE} />,
    accentColor: '#818cf8',
    navigateTo: { section: 'students' },
    requiredPermission: 'students.read',
  },
  'Staff Members': {
    icon: <UserCheck className={ICON_SIZE} />,
    accentColor: '#34d399',
    navigateTo: { section: 'staff' },
    requiredPermission: 'staff.read',
  },
  'Active Courses': {
    icon: <BookOpen className={ICON_SIZE} />,
    accentColor: '#f59e0b',
    navigateTo: { section: 'academics' },
    requiredPermission: 'academics.read',
  },
  'Attendance Today': {
    icon: <ClipboardCheck className={ICON_SIZE} />,
    accentColor: '#06b6d4',
    suffix: '%',
    navigateTo: { section: 'students', header: 'attendance' },
    requiredPermission: 'attendance.read',
  },
  'Fee Collection': {
    icon: <CreditCard className={ICON_SIZE} />,
    accentColor: '#10b981',
    suffix: '%',
    navigateTo: { section: 'finance' },
    requiredPermission: 'finance.read',
  },
  'Pending Approvals': {
    icon: <ClipboardCheck className={ICON_SIZE} />,
    accentColor: '#f97316',
    navigateTo: { section: 'control_center', header: 'approvals' },
    requiredPermission: 'approvals.view',
  },
  'Applicants': {
    icon: <UserPlus className={ICON_SIZE} />,
    accentColor: '#a78bfa',
    navigateTo: { section: 'admissions' },
    requiredPermission: 'admissions.read',
  },
  'Upcoming Events': {
    icon: <CalendarDays className={ICON_SIZE} />,
    accentColor: '#ec4899',
    navigateTo: { section: 'control_center', header: 'calendar' },
  },
};

/* ── Skeleton loader for loading state ── */
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

/* ── Main component ── */
export function AdminStatsStrip() {
  const { schoolId } = useAuthStore();
  const navigate = useNavigationStore(s => s.navigate);
  const { data, isLoading, isError, error, refetch } = useDashboardKPIs(schoolId);

  const kpis: DashboardKPI[] = Array.isArray(data) ? data : (data as any)?.data ?? (data as any)?.items ?? [];

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" aria-label="Loading statistics">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
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
            <p className="text-xs text-red-400/60 truncate">{(error as Error)?.message ?? 'Unknown error'}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="shrink-0 border-red-500/30 text-red-300 hover:bg-red-500/10">
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

  /* ── Render stat cards ── */
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="region" aria-label="Dashboard statistics">
      {kpis.map((kpi) => {
        const mapping = STAT_MAP[kpi.label];
        if (!mapping) return null;

        const numericValue = typeof kpi.value === 'string' ? parseFloat(kpi.value) || 0 : kpi.value;

        const card = (
          <button
            key={kpi.label}
            type="button"
            className="text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
            onClick={() => navigate(mapping.navigateTo.section, mapping.navigateTo.header)}
            aria-label={`${kpi.label}: ${kpi.value}${mapping.suffix ?? ''}. Click to view details.`}
          >
            <StatCard
              label={kpi.label}
              value={numericValue}
              suffix={mapping.suffix}
              trend={kpi.trend}
              trendLabel={kpi.changeLabel || undefined}
              icon={mapping.icon}
              accentColor={mapping.accentColor}
            />
          </button>
        );

        // Wrap with permission gate if required
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
  );
}
