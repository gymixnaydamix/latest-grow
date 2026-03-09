import { useDeferredValue, useMemo, useState, startTransition } from 'react';
import { Activity, ArrowUpRight, RefreshCw, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { notifyError, notifyInfo, notifySuccess } from '@/lib/notify';
import {
  gamificationOverlayContent,
  getGamificationPageByIds,
} from '@/config/gamification-overlay-content';
import {
  useExportGamificationPage,
  useGamificationBootstrap,
  useGamificationPage,
  usePublishGamificationPage,
  useRollbackGamificationPage,
  useRunGamificationAction,
} from '@/hooks/api/use-gamification';
import type { OverlayPlaceholderPaneProps } from '../OverlayPlaceholderPane';
import { GamificationBuilderWorkbench } from './GamificationBuilderWorkbench';
import {
  cardSpanClass,
  CornerPanel,
  MetricStrip,
  panelTone,
  WorkspaceBody,
} from './gamification-shared';

function LoadingWorkspace() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 2xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[1.75rem]" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-96 rounded-[1.75rem] xl:col-span-8" />
        <Skeleton className="h-96 rounded-[1.75rem] xl:col-span-4" />
        <Skeleton className="h-80 rounded-[1.75rem] xl:col-span-4" />
        <Skeleton className="h-80 rounded-[1.75rem] xl:col-span-8" />
      </div>
    </div>
  );
}

export default function GamificationOverlayWorkspace({
  primaryId,
  secondaryId,
}: OverlayPlaceholderPaneProps) {
  const resolved = getGamificationPageByIds(primaryId, secondaryId);
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('30d');
  const [segment, setSegment] = useState('all');
  const deferredSearch = useDeferredValue(search);
  const pageId = resolved?.page.id ?? null;

  const { data: bootstrap } = useGamificationBootstrap();
  const pageQuery = useGamificationPage(pageId, { search: deferredSearch, range, segment });
  const publishMutation = usePublishGamificationPage(pageId ?? '');
  const rollbackMutation = useRollbackGamificationPage(pageId ?? '');
  const exportMutation = useExportGamificationPage(pageId ?? '');
  const actionMutation = useRunGamificationAction(pageId ?? '');

  const builderPage = useMemo(() => {
    if (!resolved) return false;
    return resolved.page.cards.some((card) => card.type.includes('builder') || card.type.includes('workspace'));
  }, [resolved]);

  if (!resolved) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <CornerPanel tone="from-rose-500/12 via-white to-white dark:from-rose-950/60 dark:via-slate-950 dark:to-slate-950">
          <div className="p-6">
            <p className="text-lg font-semibold text-foreground dark:text-white">Gamification route missing</p>
            <p className="mt-2 text-sm text-muted-foreground">The active primary/secondary pair does not match the gamification content config.</p>
          </div>
        </CornerPanel>
      </div>
    );
  }

  const pageData = pageQuery.data;

  const handleAction = (cardId: string, action: string) => {
    if (!pageId) return;
    if (action.toLowerCase().includes('publish')) {
      void publishMutation.mutateAsync().then((result) => notifySuccess('Published', result.message)).catch((error: Error) => notifyError('Publish failed', error.message));
      return;
    }
    if (action.toLowerCase().includes('export')) {
      void exportMutation.mutateAsync().then((result) => notifySuccess('Export queued', result.message)).catch((error: Error) => notifyError('Export failed', error.message));
      return;
    }
    if (action.toLowerCase().includes('restore') && pageData?.versions[0]) {
      void rollbackMutation.mutateAsync(pageData.versions[0].id).then((result) => notifySuccess('Rollback complete', result.message)).catch((error: Error) => notifyError('Rollback failed', error.message));
      return;
    }
    void actionMutation.mutateAsync({ cardId, action }).then((result) => notifyInfo(action, result.message)).catch((error: Error) => notifyError('Action failed', error.message));
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_30%),linear-gradient(180deg,rgba(240,253,244,0.78),rgba(248,250,252,0.98))] p-4 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.2),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(3,7,18,0.98))] lg:p-6">
      <div className="mx-auto max-w-[1800px] space-y-4">
        <CornerPanel tone="from-slate-950/96 via-slate-900/95 to-emerald-950/80 text-white">
          <div className="grid gap-4 p-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-0 bg-emerald-400/14 text-emerald-100">{resolved.primaryLabel}</Badge>
                <Badge className="border-0 bg-white/10 text-white">{resolved.page.label}</Badge>
                <Badge className="border-0 bg-white/10 text-white">
                  <ShieldCheck className="mr-1 size-3" />
                  Operator only
                </Badge>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight lg:text-4xl">{resolved.page.label}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">{resolved.page.pagePurpose}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {gamificationOverlayContent.globalUiRules.fitRules.slice(0, 3).map((rule) => (
                  <Badge key={rule} className="border-0 bg-white/8 text-white/78">{rule}</Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Data Contract</p>
                <p className="mt-3 text-3xl font-semibold">{gamificationOverlayContent.dataContracts.requiredEntities.length}</p>
                <p className="mt-2 text-sm text-white/65">Typed entities mapped across quiz, reward, analytics, and reporting flows.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Capabilities</p>
                <p className="mt-3 text-3xl font-semibold">{bootstrap?.allowedRoles.length ?? 3}</p>
                <p className="mt-2 text-sm text-white/65">Operator roles permitted for this overlay workspace in v1.</p>
              </div>
            </div>
          </div>
        </CornerPanel>

        <CornerPanel tone="from-white via-emerald-50/75 to-white dark:from-slate-950/92 dark:via-slate-900/92 dark:to-slate-950/92">
          <div className="flex flex-col gap-3 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-border/60 bg-background/70 px-4 py-2">
              <Search className="size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => startTransition(() => setSearch(event.target.value))}
                placeholder="Search quizzes, rewards, reports, or challenge data"
                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={range} onChange={(event) => setRange(event.target.value)} className="h-10 rounded-full border border-border/60 bg-background px-4 text-sm">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last quarter</option>
              </select>
              <select value={segment} onChange={(event) => setSegment(event.target.value)} className="h-10 rounded-full border border-border/60 bg-background px-4 text-sm">
                <option value="all">All segments</option>
                <option value="schools">Schools</option>
                <option value="campaigns">Campaigns</option>
                <option value="cohorts">Cohorts</option>
              </select>
              <Button variant="outline" className="rounded-full" onClick={() => void pageQuery.refetch()}>
                <RefreshCw className="mr-2 size-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CornerPanel>

        {pageQuery.error ? (
          <CornerPanel tone="from-rose-500/12 via-white to-white dark:from-rose-950/60 dark:via-slate-950 dark:to-slate-950">
            <div className="p-6">
              <p className="text-lg font-semibold text-foreground dark:text-white">Unable to load workspace</p>
              <p className="mt-2 text-sm text-muted-foreground">{pageQuery.error instanceof Error ? pageQuery.error.message : 'Unknown error'}</p>
            </div>
          </CornerPanel>
        ) : pageQuery.isLoading || !pageData ? (
          <LoadingWorkspace />
        ) : (
          <>
            <MetricStrip metrics={pageData.heroMetrics} />
            <div className="grid gap-4 xl:grid-cols-12">
              {builderPage ? (
                <GamificationBuilderWorkbench
                  pageData={pageData}
                  onPublish={() => handleAction('builder', 'Publish')}
                  onRollback={() => handleAction('builder', 'Restore Version')}
                  onExport={() => handleAction('builder', 'Export')}
                  onRefresh={() => void pageQuery.refetch()}
                  isPublishing={publishMutation.isPending}
                  isRollingBack={rollbackMutation.isPending}
                  isExporting={exportMutation.isPending}
                />
              ) : null}

              <CornerPanel className="p-5 xl:col-span-4" tone="from-white via-emerald-50/80 to-white dark:from-slate-950/94 dark:via-slate-900/92 dark:to-slate-950/94">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">System Pulse</p>
                    <h3 className="mt-2 text-xl font-semibold text-foreground dark:text-white">Operational Signal</h3>
                  </div>
                  <Sparkles className="size-5 text-emerald-500" />
                </div>
                <div className="mt-4 space-y-3">
                  {pageData.auditTrail.slice(0, 4).map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-border/60 bg-background/55 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground dark:text-white">{entry.action}</p>
                        <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.detail}</p>
                    </div>
                  ))}
                </div>
              </CornerPanel>

              {resolved.page.cards.map((card) => (
                <CornerPanel key={card.id} className={cn('p-5', cardSpanClass(card.type))} tone={panelTone(card.type)}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">{card.type}</p>
                      <h3 className="mt-2 text-xl font-semibold text-foreground dark:text-white">{card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/70">{card.description}</p>
                    </div>
                    <Badge className="border-0 bg-emerald-500/12 text-emerald-700 dark:text-emerald-200">
                      {pageData.cards.find((item) => item.cardId === card.id)?.stat ?? 'Live'}
                    </Badge>
                  </div>
                  {card.modules?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {card.modules.map((module) => (
                        <Badge key={module} variant="outline" className="rounded-full border-border/60 bg-background/55 px-3 py-1 text-[11px]">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-5">
                    <WorkspaceBody pageData={pageData} cardId={card.id} />
                  </div>
                  {card.actions?.length ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {card.actions.map((action) => (
                        <Button
                          key={action}
                          size="sm"
                          variant="outline"
                          disabled={actionMutation.isPending || publishMutation.isPending || exportMutation.isPending}
                          className="rounded-full border-border/60 bg-background/55"
                          onClick={() => handleAction(card.id, action)}
                        >
                          {action}
                          <ArrowUpRight className="ml-2 size-3.5" />
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </CornerPanel>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
              <CornerPanel className="p-5" tone="from-slate-950/96 via-slate-900/95 to-slate-900/96 text-white">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-emerald-300" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">Version Stack</p>
                </div>
                <div className="mt-4 space-y-3">
                  {pageData.versions.map((version) => (
                    <div key={version.id} className="rounded-2xl border border-white/10 bg-white/6 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{version.label}</p>
                        <span className="text-xs text-white/45">{version.createdAt}</span>
                      </div>
                      <p className="mt-1 text-xs text-white/60">{version.summary}</p>
                    </div>
                  ))}
                </div>
              </CornerPanel>

              <CornerPanel className="p-5" tone="from-white via-emerald-50/80 to-white dark:from-slate-950/94 dark:via-slate-900/92 dark:to-slate-950/94">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Audit Trail</p>
                    <h3 className="mt-2 text-xl font-semibold text-foreground dark:text-white">Recent operator actions</h3>
                  </div>
                  <Badge className="border-0 bg-emerald-500/12 text-emerald-700 dark:text-emerald-200">
                    {pageData.auditTrail.length} records
                  </Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {pageData.auditTrail.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-border/60 bg-background/55 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground dark:text-white">{entry.action}</p>
                        <span className="text-xs text-muted-foreground">{entry.actor}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{entry.detail}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{entry.timestamp}</p>
                    </div>
                  ))}
                </div>
              </CornerPanel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
