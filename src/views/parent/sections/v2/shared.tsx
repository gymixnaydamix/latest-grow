import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import type { ParentScope } from '@/store/parent-portal.store';
import { cn } from '@/lib/utils';

export interface ParentSectionProps {
  scope: ParentScope;
  childId: string | null;
}

export function ParentSectionShell({
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
    <div className="space-y-4">
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

export function PriorityBadge({ priority }: { priority: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const styleByPriority: Record<'HIGH' | 'MEDIUM' | 'LOW', string> = {
    HIGH: 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-300',
    MEDIUM: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    LOW: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  };
  return <Badge className={cn('font-medium', styleByPriority[priority])}>{priority}</Badge>;
}

export function StatusBadge({
  status,
  tone = 'neutral',
}: {
  status: string;
  tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info';
}) {
  const toneMap: Record<'neutral' | 'good' | 'warn' | 'bad' | 'info', string> = {
    neutral: 'border-border/70 bg-muted/40 text-muted-foreground',
    good: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    warn: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    bad: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    info: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  };
  return <Badge className={cn('font-medium', toneMap[tone])}>{status}</Badge>;
}

export function EmptyActionState({
  title,
  message,
  ctaLabel,
  onClick,
}: {
  title: string;
  message: string;
  ctaLabel: string;
  onClick?: () => void;
}) {
  return (
    <Card className="border-dashed border-border/70">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onClick}>
          {ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
}

export function UrgentInline({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
