/* ─── Teacher Portal V2 — Shared Components & Types ──────────────── */
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Section props passed to every module ── */
export interface TeacherSectionProps {
  schoolId: string | null;
  teacherId: string | null;
}

/* ── Section shell — consistent header for every module ── */
export function TeacherSectionShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

/* ── Status badge with tone ── */
export function StatusBadge({
  status,
  tone = 'neutral',
}: {
  status: string;
  tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info';
}) {
  const toneMap: Record<string, string> = {
    neutral: 'border-border/70 bg-muted/70 text-muted-foreground',
    good: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    warn: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    bad: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
  };
  return <Badge className={cn('font-medium text-[10px]', toneMap[tone])}>{status}</Badge>;
}

/* ── Priority badge ── */
export function PriorityBadge({ priority }: { priority: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const styles: Record<string, string> = {
    HIGH: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    MEDIUM: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    LOW: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  };
  return <Badge className={cn('font-medium text-[10px]', styles[priority])}>{priority}</Badge>;
}

/* ── Urgent alert inline ── */
export function UrgentInline({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

/* ── Empty state ── */
export function EmptyState({
  title,
  message,
  icon,
}: {
  title: string;
  message: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="border-dashed border-border/60 bg-card/60">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        {icon && <div className="mb-3 text-muted-foreground/50">{icon}</div>}
        <CardTitle className="text-base text-muted-foreground">{title}</CardTitle>
        <CardDescription className="mt-1 text-muted-foreground/70">{message}</CardDescription>
      </CardContent>
    </Card>
  );
}

/* ── Metric mini-card (used across modules) ── */
export function MetricCard({
  label,
  value,
  suffix,
  accent = '#818cf8',
  trend,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  accent?: string;
  trend?: 'up' | 'down' | 'flat';
}) {
  const trendIcons: Record<string, string> = { up: '↑', down: '↓', flat: '→' };
  const trendColors: Record<string, string> = { up: 'text-emerald-400', down: 'text-rose-400', flat: 'text-muted-foreground/70' };
  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-card/90 backdrop-blur-xl p-4 transition-all hover:shadow-md"
      style={{ borderColor: `${accent}30` }}
    >
      {/* Accent gradient line */}
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}00, ${accent}, ${accent}00)` }} />
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-end gap-1.5">
        <span className="text-2xl font-bold" style={{ color: accent }}>{value}{suffix}</span>
        {trend && <span className={cn('text-xs mb-0.5', trendColors[trend])}>{trendIcons[trend]}</span>}
      </div>
    </div>
  );
}

/* ── Glass card wrapper ── */
export function GlassCard({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/50 bg-card/90 backdrop-blur-xl p-5 shadow-sm transition-all duration-200',
        onClick && 'cursor-pointer hover:border-primary/30 hover:shadow-md',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  );
}
