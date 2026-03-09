import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  GamificationCardPayload,
  GamificationMetric,
  GamificationPagePayload,
  GamificationQueueItem,
  GamificationTableData,
} from '@root/types';

export function panelTone(cardType: string): string {
  if (cardType.includes('analytics') || cardType.includes('heatmap') || cardType.includes('distribution')) {
    return 'from-emerald-500/18 via-emerald-400/5 to-cyan-400/8';
  }
  if (cardType.includes('builder') || cardType.includes('workspace')) {
    return 'from-slate-950/90 via-slate-900/90 to-emerald-950/80 text-white';
  }
  if (cardType.includes('queue') || cardType.includes('history') || cardType.includes('audit')) {
    return 'from-slate-900/92 via-slate-950/95 to-slate-900/92 text-white';
  }
  if (cardType.includes('reward') || cardType.includes('finance') || cardType.includes('ledger')) {
    return 'from-amber-500/16 via-yellow-400/8 to-emerald-400/10';
  }
  return 'from-white via-emerald-50/70 to-slate-50/95 dark:from-slate-950/92 dark:via-slate-900/92 dark:to-slate-950/95';
}

export function cardSpanClass(cardType: string): string {
  if (cardType.includes('builder') || cardType.includes('workspace') || cardType.includes('table') || cardType.includes('library')) {
    return 'xl:col-span-8';
  }
  return 'xl:col-span-4';
}

export function CornerPanel({
  className,
  tone,
  children,
}: {
  className?: string;
  tone: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1.75rem] border border-white/55 bg-gradient-to-br shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/8',
        tone,
        className,
      )}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))',
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent dark:via-emerald-300/35" />
        <div className="absolute right-0 top-0 h-10 w-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_65%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.35),transparent_65%)]" />
      </div>
      {children}
    </div>
  );
}

export function MetricStrip({ metrics }: { metrics: GamificationMetric[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 2xl:grid-cols-7">
      {metrics.map((metric) => (
        <CornerPanel key={metric.id} tone="from-white via-emerald-50/75 to-slate-50 dark:from-slate-950/94 dark:via-slate-900/92 dark:to-emerald-950/70">
          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">{metric.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground dark:text-white">{metric.value}</p>
                {metric.detail ? <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p> : null}
              </div>
              {metric.trend ? (
                <Badge className="border-0 bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-200">
                  {metric.trend}
                </Badge>
              ) : null}
            </div>
          </div>
        </CornerPanel>
      ))}
    </div>
  );
}

function QueueCardBody({ items }: { items: GamificationQueueItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-white/10 bg-white/6 p-3 dark:bg-white/4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground dark:text-white">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <Badge className="border-0 bg-emerald-400/12 text-emerald-700 dark:text-emerald-200">{item.status}</Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{item.meta}</p>
        </div>
      ))}
    </div>
  );
}

function TableCardBody({ table }: { table: GamificationTableData }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <tr>
              {table.columns.map((column) => (
                <th key={column.id} className="px-4 py-3 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-background/55">
            {table.rows.map((row) => (
              <tr key={row.id} className="hover:bg-emerald-500/5">
                {table.columns.map((column) => (
                  <td key={column.id} className="px-4 py-3 text-foreground/90">
                    {String(row[column.id] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChartCard({ data }: { data: GamificationCardPayload }) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.series ?? []}>
          <defs>
            <linearGradient id="gamificationChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#gamificationChartFill)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WorkspaceBody({
  pageData,
  cardId,
}: {
  pageData: GamificationPagePayload;
  cardId: string;
}) {
  const cardData = pageData.cards.find((item) => item.cardId === cardId);
  if (!cardData) {
    return <p className="text-sm text-muted-foreground">Live data will appear here once this module is populated.</p>;
  }
  if (cardData.table) return <TableCardBody table={cardData.table} />;
  if (cardData.queue?.length) return <QueueCardBody items={cardData.queue} />;
  if (cardData.series?.length) return <ChartCard data={cardData} />;
  if (cardData.notes?.length) {
    return (
      <div className="space-y-2">
        {cardData.notes.map((note) => (
          <div key={note} className="rounded-2xl border border-border/60 bg-background/55 px-3 py-2 text-sm text-muted-foreground">
            {note}
          </div>
        ))}
      </div>
    );
  }
  if (cardData.tags?.length) {
    return (
      <div className="flex flex-wrap gap-2">
        {cardData.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="rounded-full border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-[11px]">
            {tag}
          </Badge>
        ))}
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-border/60 bg-background/55 p-4">
      <p className="text-2xl font-semibold text-foreground dark:text-white">{cardData.stat ?? 'Ready'}</p>
      <p className="mt-2 text-sm text-muted-foreground">{cardData.statDetail ?? 'Operational state is healthy and ready for action.'}</p>
    </div>
  );
}
