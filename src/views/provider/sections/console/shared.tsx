/* --- Provider Console - Shared Design System --- */
import { type ReactNode, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderConsoleStore } from '@/store/provider-console.store';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Lock,
  Pin,
  Search,
  Star,
  X,
} from 'lucide-react';

/* -- Section accent colours -- */
export interface SectionAccent {
  border: string;
  ring: string;
  bg: string;
  text: string;
  badge: string;
  gradient: string;
  dot: string;
}

export const sectionAccents: Record<string, SectionAccent> = {
  provider_home:         { border: 'border-sky-500/20',     ring: 'ring-sky-500/15',     bg: 'bg-sky-500/8',      text: 'text-sky-600 dark:text-sky-400',         badge: 'bg-sky-500/10 text-sky-700 border-sky-500/25 dark:text-sky-300',             gradient: 'from-sky-500/8 to-sky-500/3',       dot: 'bg-sky-500' },
  provider_tenants:      { border: 'border-indigo-500/20',  ring: 'ring-indigo-500/15',  bg: 'bg-indigo-500/8',   text: 'text-indigo-600 dark:text-indigo-400',   badge: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/25 dark:text-indigo-300', gradient: 'from-indigo-500/8 to-indigo-500/3', dot: 'bg-indigo-500' },
  provider_onboarding:   { border: 'border-teal-500/20',    ring: 'ring-teal-500/15',    bg: 'bg-teal-500/8',     text: 'text-teal-600 dark:text-teal-400',       badge: 'bg-teal-500/10 text-teal-700 border-teal-500/25 dark:text-teal-300',         gradient: 'from-teal-500/8 to-teal-500/3',     dot: 'bg-teal-500' },
  provider_billing:      { border: 'border-emerald-500/20', ring: 'ring-emerald-500/15', bg: 'bg-emerald-500/8',  text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300', gradient: 'from-emerald-500/8 to-emerald-500/3', dot: 'bg-emerald-500' },
  provider_support:      { border: 'border-violet-500/20',  ring: 'ring-violet-500/15',  bg: 'bg-violet-500/8',   text: 'text-violet-600 dark:text-violet-400',   badge: 'bg-violet-500/10 text-violet-700 border-violet-500/25 dark:text-violet-300', gradient: 'from-violet-500/8 to-violet-500/3', dot: 'bg-violet-500' },
  provider_incidents:    { border: 'border-red-500/20',     ring: 'ring-red-500/15',     bg: 'bg-red-500/8',      text: 'text-red-600 dark:text-red-400',         badge: 'bg-red-500/10 text-red-700 border-red-500/25 dark:text-red-300',             gradient: 'from-red-500/8 to-red-500/3',       dot: 'bg-red-500' },
  provider_releases:     { border: 'border-fuchsia-500/20', ring: 'ring-fuchsia-500/15', bg: 'bg-fuchsia-500/8',  text: 'text-fuchsia-600 dark:text-fuchsia-400', badge: 'bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/25 dark:text-fuchsia-300', gradient: 'from-fuchsia-500/8 to-fuchsia-500/3', dot: 'bg-fuchsia-500' },
  provider_integrations: { border: 'border-lime-500/20',    ring: 'ring-lime-500/15',    bg: 'bg-lime-500/8',     text: 'text-lime-600 dark:text-lime-400',       badge: 'bg-lime-500/10 text-lime-700 border-lime-500/25 dark:text-lime-300',         gradient: 'from-lime-500/8 to-lime-500/3',     dot: 'bg-lime-500' },
  provider_security:     { border: 'border-rose-500/20',    ring: 'ring-rose-500/15',    bg: 'bg-rose-500/8',     text: 'text-rose-600 dark:text-rose-400',       badge: 'bg-rose-500/10 text-rose-700 border-rose-500/25 dark:text-rose-300',         gradient: 'from-rose-500/8 to-rose-500/3',     dot: 'bg-rose-500' },
  provider_data_ops:     { border: 'border-orange-500/20',  ring: 'ring-orange-500/15',  bg: 'bg-orange-500/8',   text: 'text-orange-600 dark:text-orange-400',   badge: 'bg-orange-500/10 text-orange-700 border-orange-500/25 dark:text-orange-300', gradient: 'from-orange-500/8 to-orange-500/3', dot: 'bg-orange-500' },
  provider_team:         { border: 'border-pink-500/20',    ring: 'ring-pink-500/15',    bg: 'bg-pink-500/8',     text: 'text-pink-600 dark:text-pink-400',       badge: 'bg-pink-500/10 text-pink-700 border-pink-500/25 dark:text-pink-300',         gradient: 'from-pink-500/8 to-pink-500/3',     dot: 'bg-pink-500' },
  provider_settings:     { border: 'border-border',         ring: 'ring-border/60',      bg: 'bg-muted/50',       text: 'text-muted-foreground',                  badge: 'bg-muted text-muted-foreground border-border',                               gradient: 'from-muted/60 to-muted/30',        dot: 'bg-muted-foreground' },
  provider_audit:        { border: 'border-yellow-500/20',  ring: 'ring-yellow-500/15',  bg: 'bg-yellow-500/8',   text: 'text-yellow-600 dark:text-yellow-400',   badge: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/25 dark:text-yellow-300', gradient: 'from-yellow-500/8 to-yellow-500/3', dot: 'bg-yellow-500' },
  provider_analytics:    { border: 'border-blue-500/20',    ring: 'ring-blue-500/15',    bg: 'bg-blue-500/8',     text: 'text-blue-600 dark:text-blue-400',       badge: 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-300',         gradient: 'from-blue-500/8 to-blue-500/3',     dot: 'bg-blue-500' },
  provider_comms:        { border: 'border-teal-500/20',    ring: 'ring-teal-500/15',    bg: 'bg-teal-500/8',     text: 'text-teal-600 dark:text-teal-400',       badge: 'bg-teal-500/10 text-teal-700 border-teal-500/25 dark:text-teal-300',         gradient: 'from-teal-500/8 to-teal-500/3',     dot: 'bg-teal-500' },
  provider_notifications:{ border: 'border-amber-500/20',   ring: 'ring-amber-500/15',   bg: 'bg-amber-500/8',    text: 'text-amber-600 dark:text-amber-400',     badge: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300',     gradient: 'from-amber-500/8 to-amber-500/3',   dot: 'bg-amber-500' },
  provider_branding:     { border: 'border-fuchsia-500/20', ring: 'ring-fuchsia-500/15', bg: 'bg-fuchsia-500/8',  text: 'text-fuchsia-600 dark:text-fuchsia-400', badge: 'bg-fuchsia-500/10 text-fuchsia-700 border-fuchsia-500/25 dark:text-fuchsia-300', gradient: 'from-fuchsia-500/8 to-fuchsia-500/3', dot: 'bg-fuchsia-500' },
  provider_api_mgmt:     { border: 'border-cyan-500/20',    ring: 'ring-cyan-500/15',    bg: 'bg-cyan-500/8',     text: 'text-cyan-600 dark:text-cyan-400',       badge: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/25 dark:text-cyan-300',         gradient: 'from-cyan-500/8 to-cyan-500/3',     dot: 'bg-cyan-500' },
  provider_backup:       { border: 'border-emerald-500/20', ring: 'ring-emerald-500/15', bg: 'bg-emerald-500/8',  text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300', gradient: 'from-emerald-500/8 to-emerald-500/3', dot: 'bg-emerald-500' },
};

const defaultAccent: SectionAccent = sectionAccents.provider_home;

export function getAccent(sectionId: string): SectionAccent {
  return sectionAccents[sectionId] ?? defaultAccent;
}

/* -- Section page header (unique per module) -- */
export function SectionPageHeader({
  icon: Icon,
  title,
  description,
  accent,
  actions,
  className,
  contentClassName,
  actionsClassName,
  titleClassName,
  descriptionClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  accent: SectionAccent;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  actionsClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <div className={cn('mb-4 rounded-xl border p-4 ring-1', accent.border, accent.bg, accent.ring, className)}>
      <div className={cn('flex items-center justify-between', contentClassName)}>
        <div className="flex items-center gap-3">
          <div className={`flex size-10 items-center justify-center rounded-xl ${accent.bg} ring-1 ${accent.ring}`}>
            <Icon className={`size-5 ${accent.text}`} />
          </div>
          <div>
            <h2 className={cn('text-base font-bold', accent.text, titleClassName)}>{title}</h2>
            {description && <p className={cn('text-xs text-muted-foreground', descriptionClassName)}>{description}</p>}
          </div>
        </div>
        {actions && <div className={cn('flex items-center gap-2', actionsClassName)}>{actions}</div>}
      </div>
    </div>
  );
}

/* -- Panel wrapper shared across all console sections -- */
export function Panel({
  title,
  subtitle,
  children,
  action,
  accentBorder,
  className,
  headerClassName,
  titleClassName,
  subtitleClassName,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  accentBorder?: string;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn('rounded-xl border bg-card shadow-(--shadow-xs)', accentBorder ?? 'border-border', className)}>
      <div className={cn('flex items-center justify-between border-b px-4 py-3', accentBorder ?? 'border-border', headerClassName)}>
        <div>
          <h3 className={cn('text-sm font-semibold text-foreground', titleClassName)}>{title}</h3>
          {subtitle ? <p className={cn('text-xs text-muted-foreground', subtitleClassName)}>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className={cn('p-3', bodyClassName)}>{children}</div>
    </section>
  );
}

/* -- Severity colour helper -- */
export function tone(severity: string): string {
  if (severity === 'CRITICAL') return 'bg-red-500/10 text-red-700 border-red-500/25 dark:text-red-300';
  if (severity === 'HIGH') return 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300';
  if (severity === 'MEDIUM') return 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-300';
  return 'bg-muted text-muted-foreground border-border';
}

/* -- Reason prompt (mutation guard) -- */
export function reasonPrompt(label: string): string | null {
  const value = window.prompt(`Reason required: ${label}`);
  if (!value || !value.trim()) return null;
  return value.trim();
}

/* -- Status badge -- */
const statusVariant: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300',
  HEALTHY: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300',
  PAID: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300',
  OPERATIONAL: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300',
  SUCCEEDED: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300',
  CONNECTED: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300',
  COMPLETED: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300',

  TRIAL: 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-300',
  ISSUED: 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-300',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-300',
  PENDING: 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-300',
  NEW: 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-300',
  MONITORING: 'bg-blue-500/10 text-blue-700 border-blue-500/25 dark:text-blue-300',

  WARNING: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300',
  PAYMENT_DUE: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300',
  OVERDUE: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300',
  FAILED: 'bg-red-500/10 text-red-700 border-red-500/25 dark:text-red-300',
  SUSPENDED: 'bg-red-500/10 text-red-700 border-red-500/25 dark:text-red-300',
  DEGRADED: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300',
  DISCONNECTED: 'bg-red-500/10 text-red-700 border-red-500/25 dark:text-red-300',
  BLOCKED: 'bg-red-500/10 text-red-700 border-red-500/25 dark:text-red-300',

  OPEN: 'bg-red-500/10 text-red-700 border-red-500/25 dark:text-red-300',
  RESOLVED: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:text-emerald-300',
  ESCALATED: 'bg-amber-500/10 text-amber-700 border-amber-500/25 dark:text-amber-300',
  CLOSED: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusVariant[status] ?? 'bg-muted text-muted-foreground border-border';
  return <Badge className={`border text-[10px] ${cls}`}>{status.replaceAll('_', ' ')}</Badge>;
}

/* -- Stat card (mini KPI) -- */
export function StatCard({
  label,
  value,
  sub,
  gradient = 'from-muted/60 to-muted/30',
  borderAccent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  gradient?: string;
  borderAccent?: string;
}) {
  return (
    <div className={`rounded-xl border ${borderAccent ?? 'border-border'} bg-linear-to-br ${gradient} p-3 shadow-(--shadow-xs) transition-all duration-200 hover:shadow-(--shadow-sm)`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-lg font-extrabold leading-tight text-foreground">{value}</p>
      {sub ? <span className="text-[10px] text-muted-foreground">{sub}</span> : null}
    </div>
  );
}

/* -- Row wrapper for tables -- */
export function Row({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs ${className}`}>
      {children}
    </div>
  );
}

/* -- Progress bar -- */
export function ProgressBar({ value, max, color = 'bg-primary' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const warn = pct > 90;
  return (
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div className={`h-full rounded-full transition-all ${warn ? 'bg-danger' : color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---- EXTENDED COMPONENT SYSTEM ---- */

/* -- SubPageRouter: renders content based on activeHeader -- */
export interface SubPageDef {
  headerId: string;
  label: string;
  render: () => ReactNode;
}

export function SubPageRouter({
  pages,
  fallback,
}: {
  pages: SubPageDef[];
  fallback?: ReactNode;
}) {
  const { activeHeader } = useNavigationStore();
  const matched = pages.find((p) => p.headerId === activeHeader);
  if (matched) return <>{matched.render()}</>;
  if (pages.length > 0) return <>{pages[0].render()}</>;
  return <>{fallback ?? null}</>;
}

/* -- EmptyState -- */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
      {Icon && <Icon className="mb-3 size-10 text-muted-foreground/60" />}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* -- DataTable: Sortable, filterable, responsive -- */
export interface ColumnDef<T> {
  key: string;
  label: string;
  render: (row: T, index: number) => ReactNode;
  sortKey?: (row: T) => string | number;
  className?: string;
  hideOnMobile?: boolean;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  rowKey,
  maxRows = 50,
  emptyMessage = 'No data available.',
  accentBorder,
  onRowClick,
  searchPlaceholder,
  searchFn,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T, idx: number) => string;
  maxRows?: number;
  emptyMessage?: string;
  accentBorder?: string;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
}) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchFn || !filterQuery.trim()) return data;
    return data.filter((row) => searchFn(row, filterQuery.toLowerCase()));
  }, [data, filterQuery, searchFn]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    const col = columns.find((c) => c.key === sortCol);
    if (!col?.sortKey) return filtered;
    const fn = col.sortKey;
    return [...filtered].sort((a, b) => {
      const va = fn(a);
      const vb = fn(b);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir, columns]);

  const toggleSort = useCallback(
    (key: string) => {
      if (sortCol === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortCol(key);
        setSortDir('asc');
      }
    },
    [sortCol],
  );

  const rows = sorted.slice(0, maxRows);

  return (
    <div className="space-y-2">
      {searchFn && searchPlaceholder && (
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
          <Input
            className="h-8 border-border bg-muted/50 pl-8 text-xs"
            placeholder={searchPlaceholder}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>
      )}

      {/* Table header */}
      <div className={`hidden md:grid gap-3 rounded-lg border ${accentBorder ?? 'border-border'} bg-muted/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground`}
        style={{ gridTemplateColumns: columns.map(() => '1fr').join(' ') }}>
        {columns.map((col) => (
          <button
            key={col.key}
            className={`flex items-center gap-1 text-left ${col.hideOnMobile ? 'hidden lg:flex' : ''}`}
            onClick={() => col.sortKey && toggleSort(col.key)}
          >
            {col.label}
            {col.sortKey && sortCol === col.key && (
              sortDir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
            )}
            {col.sortKey && sortCol !== col.key && <ChevronsUpDown className="size-3 opacity-30" />}
          </button>
        ))}
      </div>

      {/* Table rows */}
      {rows.map((row, idx) => (
        <div
          key={rowKey(row, idx)}
          className={`grid gap-3 rounded-lg border ${accentBorder ?? 'border-border'} bg-muted/30 px-3 py-2 text-xs transition-colors ${onRowClick ? 'cursor-pointer hover:bg-muted/60' : ''}`}
          style={{ gridTemplateColumns: columns.map(() => '1fr').join(' ') }}
          onClick={() => onRowClick?.(row)}
        >
          {columns.map((col) => (
            <div key={col.key} className={`${col.className ?? ''} ${col.hideOnMobile ? 'hidden lg:block' : ''}`}>
              {/* Mobile: stacked layout */}
              <span className="md:hidden text-[10px] text-muted-foreground uppercase tracking-wider">{col.label}: </span>
              {col.render(row, idx)}
            </div>
          ))}
        </div>
      ))}

      {rows.length === 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground">{emptyMessage}</p>
      )}
      {sorted.length > maxRows && (
        <p className="text-center text-[10px] text-muted-foreground">Showing {maxRows} of {sorted.length} results</p>
      )}
    </div>
  );
}

/* -- PermissionGate: role-based section guard -- */
export function PermissionGate({
  requires,
  permissions,
  children,
  fallback,
}: {
  requires: string | string[];
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const needed = Array.isArray(requires) ? requires : [requires];
  const hasStar = permissions.includes('*');
  const hasAccess = hasStar || needed.some((perm) => permissions.includes(perm));

  if (!hasAccess) {
    return (
      <>
        {fallback ?? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-danger/20 bg-danger-soft p-8 text-center">
            <Lock className="mb-3 size-8 text-danger" />
            <h3 className="text-sm font-semibold text-danger">Access Restricted</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Required permission: {needed.join(' or ')}
            </p>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}

/* -- TenantSwitcher: combobox for multi-tenant context -- */
export function TenantSwitcher({
  tenants,
  selectedTenantId,
  onSelect,
}: {
  tenants: Array<{ id: string; name: string; status: string; domain?: string }>;
  selectedTenantId: string | null;
  onSelect: (tenantId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { pinnedTenantIds, recentTenantIds, pinTenant, unpinTenant } = useProviderConsoleStore();

  const filtered = useMemo(() => {
    if (!query.trim()) return tenants;
    const q = query.toLowerCase();
    return tenants.filter(
      (t) => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.domain?.toLowerCase().includes(q),
    );
  }, [tenants, query]);

  const pinnedTenants = tenants.filter((t) => pinnedTenantIds.includes(t.id));
  const recentTenants = tenants.filter((t) => recentTenantIds.includes(t.id) && !pinnedTenantIds.includes(t.id)).slice(0, 5);
  const selected = tenants.find((t) => t.id === selectedTenantId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
      >
        <Building2 className="size-3.5 text-muted-foreground" />
        <span className="max-w-40 truncate">{selected ? selected.name : 'All Tenants'}</span>
        <ChevronsUpDown className="size-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-border bg-card shadow-(--shadow-md)">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 size-3.5 text-muted-foreground" />
              <Input
                className="h-8 border-border bg-muted/50 pl-7 text-xs"
                placeholder="Search tenants..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* All tenants option */}
          <button
            className={`w-full px-3 py-2 text-left text-xs hover:bg-muted ${!selectedTenantId ? 'bg-primary/8 text-primary' : 'text-foreground'}`}
            onClick={() => { onSelect(null); setOpen(false); }}
          >
            All Tenants (Platform View)
          </button>

          <div className="max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* Pinned */}
            {pinnedTenants.length > 0 && (
              <div className="border-t border-border px-2 py-1">
                <p className="px-1 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <Pin className="mr-1 inline size-3" />Pinned
                </p>
                {pinnedTenants.map((t) => (
                  <TenantRow
                    key={t.id}
                    tenant={t}
                    selected={selectedTenantId === t.id}
                    pinned
                    onSelect={() => { onSelect(t.id); setOpen(false); }}
                    onTogglePin={() => unpinTenant(t.id)}
                  />
                ))}
              </div>
            )}

            {/* Recent */}
            {recentTenants.length > 0 && (
              <div className="border-t border-border px-2 py-1">
                <p className="px-1 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <Star className="mr-1 inline size-3" />Recent
                </p>
                {recentTenants.map((t) => (
                  <TenantRow
                    key={t.id}
                    tenant={t}
                    selected={selectedTenantId === t.id}
                    onSelect={() => { onSelect(t.id); setOpen(false); }}
                    onTogglePin={() => pinTenant(t.id)}
                  />
                ))}
              </div>
            )}

            {/* All filtered */}
            <div className="border-t border-border px-2 py-1">
              <p className="px-1 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">All Tenants</p>
              {filtered.slice(0, 20).map((t) => (
                <TenantRow
                  key={t.id}
                  tenant={t}
                  selected={selectedTenantId === t.id}
                  pinned={pinnedTenantIds.includes(t.id)}
                  onSelect={() => { onSelect(t.id); setOpen(false); }}
                  onTogglePin={() =>
                    pinnedTenantIds.includes(t.id) ? unpinTenant(t.id) : pinTenant(t.id)
                  }
                />
              ))}
              {filtered.length === 0 && <p className="px-1 py-2 text-[10px] text-muted-foreground">No tenants match "{query}"</p>}
            </div>
          </div>

          <div className="border-t border-border p-2">
            <button
              className="w-full rounded-md bg-muted px-2 py-1.5 text-[10px] text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <X className="mr-1 inline size-3" />Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TenantRow({
  tenant,
  selected,
  pinned,
  onSelect,
  onTogglePin,
}: {
  tenant: { id: string; name: string; status: string };
  selected: boolean;
  pinned?: boolean;
  onSelect: () => void;
  onTogglePin?: () => void;
}) {
  return (
    <div
      className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-xs cursor-pointer transition-colors ${
        selected ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`size-1.5 shrink-0 rounded-full ${
          tenant.status === 'ACTIVE' ? 'bg-emerald-500' : tenant.status === 'TRIAL' ? 'bg-blue-500' : 'bg-red-500'
        }`} />
        <span className="truncate">{tenant.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <StatusBadge status={tenant.status} />
        {onTogglePin && (
          <button
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${pinned ? 'text-amber-500' : 'text-muted-foreground'}`}
            onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          >
            <Pin className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/* -- Responsive helpers -- */
export function ResponsiveGrid({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 3,
  className = '',
}: {
  children: ReactNode;
  cols?: { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
  className?: string;
}) {
  const colClasses = [
    cols.sm ? `grid-cols-${cols.sm}` : '',
    cols.md ? `md:grid-cols-${cols.md}` : '',
    cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    cols.xl ? `xl:grid-cols-${cols.xl}` : '',
  ].filter(Boolean).join(' ');

  return <div className={`grid gap-${gap} ${colClasses} ${className}`}>{children}</div>;
}

/* -- Workflow action bar -- */
export function WorkflowActions({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 ${className}`}>
      {children}
    </div>
  );
}

/* -- Section shell: wraps every section with standardized layout -- */
export function SectionShell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-3 ${className}`}>
      {children}
    </div>
  );
}

/* -- Link-style nav helper for programmatic navigation -- */
export function useProviderNavigate() {
  const navTo = useNavigate();
  const navigate = useCallback(
    (path: string) => {
      navTo(path);
    },
    [navTo],
  );
  return navigate;
}
