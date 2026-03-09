import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ClipboardList, Layers3, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { notifyError, notifyInfo } from '@/lib/notify';
import { useSaveGamificationDraft } from '@/hooks/api/use-gamification';
import type { GamificationPagePayload } from '@root/types';
import { CornerPanel } from './gamification-shared';

const draftSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  summary: z.string().min(8, 'Summary must be at least 8 characters'),
  segment: z.string().min(1, 'Segment is required'),
  status: z.string().min(1, 'Status is required'),
  scheduleStart: z.string().min(1, 'Start date is required'),
  scheduleEnd: z.string().min(1, 'End date is required'),
  owner: z.string().min(2, 'Owner is required'),
  notes: z.string().min(3, 'Notes must be at least 3 characters'),
  automationEnabled: z.boolean(),
});

type DraftFormValues = z.infer<typeof draftSchema>;

export function GamificationBuilderWorkbench({
  pageData,
  onPublish,
  onRollback,
  onExport,
  onRefresh,
  isPublishing,
  isRollingBack,
  isExporting,
}: {
  pageData: GamificationPagePayload;
  onPublish: () => void;
  onRollback: () => void;
  onExport: () => void;
  onRefresh: () => void;
  isPublishing: boolean;
  isRollingBack: boolean;
  isExporting: boolean;
}) {
  const form = useForm<DraftFormValues>({
    resolver: zodResolver(draftSchema),
    defaultValues: pageData.draft,
  });
  const saveDraft = useSaveGamificationDraft(pageData.pageId);

  useEffect(() => {
    form.reset(pageData.draft);
  }, [form, pageData.draft]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!form.formState.isDirty || !pageData.capabilities.canEdit) return;
      const timeoutId = window.setTimeout(() => {
        void saveDraft
          .mutateAsync(values as DraftFormValues)
          .then(() => notifyInfo('Draft autosaved', 'Gamification builder changes were persisted.'))
          .catch((error: Error) => notifyError('Autosave failed', error.message));
      }, 800);
      return () => window.clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form, pageData.capabilities.canEdit, saveDraft]);

  return (
    <CornerPanel className="xl:col-span-8" tone="from-slate-950/96 via-slate-900/95 to-emerald-950/78 text-white">
      <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="border-b border-white/10 p-5 xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200/80">Builder Control</p>
              <h3 className="mt-2 text-2xl font-semibold">{pageData.title}</h3>
            </div>
            <Badge className="border-0 bg-white/10 text-white">{pageData.draft.status}</Badge>
          </div>
          <form className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/55">Title</span>
              <Input {...form.register('title')} className="border-white/10 bg-white/6 text-white placeholder:text-white/35" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/55">Owner</span>
              <Input {...form.register('owner')} className="border-white/10 bg-white/6 text-white placeholder:text-white/35" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/55">Segment</span>
              <Input {...form.register('segment')} className="border-white/10 bg-white/6 text-white placeholder:text-white/35" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/55">Lifecycle</span>
              <Input {...form.register('status')} className="border-white/10 bg-white/6 text-white placeholder:text-white/35" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/55">Start</span>
              <Input type="datetime-local" {...form.register('scheduleStart')} className="border-white/10 bg-white/6 text-white" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/55">End</span>
              <Input type="datetime-local" {...form.register('scheduleEnd')} className="border-white/10 bg-white/6 text-white" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/55">Summary</span>
              <Textarea {...form.register('summary')} className="min-h-24 border-white/10 bg-white/6 text-white placeholder:text-white/35" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/55">Operational Notes</span>
              <Textarea {...form.register('notes')} className="min-h-32 border-white/10 bg-white/6 text-white placeholder:text-white/35" />
            </label>
            <label className="md:col-span-2 flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">Automation enabled</p>
                <p className="text-xs text-white/55">Allow reminders, nudges, and follow-up workflows.</p>
              </div>
              <input type="checkbox" {...form.register('automationEnabled')} className="h-4 w-4 accent-emerald-400" />
            </label>
          </form>
        </div>
        <div className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200/80">Operational Flow</p>
          <div className="mt-4 space-y-3">
            {pageData.versions.slice(0, 3).map((version) => (
              <div key={version.id} className="rounded-2xl border border-white/10 bg-white/6 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{version.label}</p>
                  <span className="text-xs text-white/45">{version.createdAt}</span>
                </div>
                <p className="mt-1 text-xs text-white/55">{version.summary}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-2">
            <Button onClick={onPublish} disabled={isPublishing} className="justify-between rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400">
              Publish flow
              <ClipboardList className="size-4" />
            </Button>
            <Button onClick={onRollback} disabled={isRollingBack} variant="outline" className="justify-between rounded-full border-white/10 bg-white/6 text-white hover:bg-white/10">
              Roll back latest
              <Layers3 className="size-4" />
            </Button>
            <Button onClick={onExport} disabled={isExporting} variant="outline" className="justify-between rounded-full border-white/10 bg-white/6 text-white hover:bg-white/10">
              Export workspace
              <ClipboardList className="size-4" />
            </Button>
            <Button onClick={onRefresh} variant="ghost" className="justify-between rounded-full text-white/80 hover:bg-white/8 hover:text-white">
              Refresh live data
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </CornerPanel>
  );
}
