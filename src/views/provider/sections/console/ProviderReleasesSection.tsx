/* ─── ProviderReleasesSection ─── Manager · Flags · Rollouts · Notes ─── */

import { useState } from 'react';
import {
  Flag,
  GitBranch,
  Loader2,
  PlusCircle,
  Rocket,
  ScrollText,
  ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderModuleData,
  useUpdateProviderFeatureFlag,
  useProviderReleases,
  useCreateProviderRelease,
  useCreateProviderFeatureFlag,
} from '@/hooks/api/use-provider-console';
import type { FeatureFlagRuleDTO } from '@root/types';
import {
  EmptyState,
  Panel,
  ProgressBar,
  SectionPageHeader,
  SectionShell,
  StatCard,
  StatusBadge,
  getAccent,
  reasonPrompt,
} from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderReleasesSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'releases_manager': return <ReleasesManagerView />;
    case 'releases_flags':   return <FeatureFlagsView />;
    case 'releases_rollout': return <RolloutStatusView />;
    case 'releases_notes':   return <ReleaseNotesView />;
    default: return <ReleasesManagerView />;
  }
}

/* ── Releases Manager ───────────────────────────────────────── */
function ReleasesManagerView() {
  const moduleQuery = useProviderModuleData();
  const { data: releasesData, isLoading } = useProviderReleases();
  const createRelease = useCreateProviderRelease();
  const accent = getAccent('provider_releases');
  const flags = (moduleQuery.data?.featureFlags ?? []) as FeatureFlagRuleDTO[];
  const releases = releasesData?.releases ?? [];

  const [showForm, setShowForm] = useState(false);
  const [relVersion, setRelVersion] = useState('');
  const [relEnv, setRelEnv] = useState('STAGING');
  const [relChanges, setRelChanges] = useState('');

  return (
    <SectionShell>
      <SectionPageHeader icon={Rocket} title="Release Manager" description="Track releases and deployment status" accent={accent} actions={
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => setShowForm((p) => !p)}>
          <PlusCircle className="mr-1 size-3" />Create Release
        </Button>
      } />

      {showForm && (
        <Panel title="New Release" accentBorder="border-violet-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-4">
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Version (e.g. 2.4.0)" value={relVersion} onChange={(e) => setRelVersion(e.target.value)} />
            <select className="h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100" value={relEnv} onChange={(e) => setRelEnv(e.target.value)}>
              <option value="STAGING">Staging</option>
              <option value="PRODUCTION">Production</option>
            </select>
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="# changes" value={relChanges} onChange={(e) => setRelChanges(e.target.value)} />
            <Button size="sm" className="h-8 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" disabled={createRelease.isPending} onClick={() => {
              if (!relVersion.trim()) return;
              const reason = reasonPrompt('Create release');
              if (!reason) return;
              createRelease.mutate({ version: relVersion, environment: relEnv, changes: Number(relChanges) || 0, rolloutPercent: 0, reason });
              setShowForm(false); setRelVersion(''); setRelChanges('');
            }}>{createRelease.isPending ? 'Creating…' : 'Create'}</Button>
          </div>
        </Panel>
      )}

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Releases" value={String(releases.length)} sub="Total" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Feature Flags" value={String(flags.length)} sub="Active" gradient="from-indigo-500/10 to-indigo-500/5" />
        <StatCard label="In Staging" value={String(releases.filter((r) => r.status === 'STAGING').length)} sub="Pre-release" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Deployed" value={String(releases.filter((r) => r.status === 'RELEASED').length)} sub="Production" gradient="from-emerald-500/10 to-emerald-500/5" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-blue-400" /></div>
      ) : releases.length === 0 ? (
        <EmptyState icon={Rocket} title="No Releases" description="No releases found." />
      ) : (
        <div className="grid gap-3">
          {releases.map((rel) => (
            <Panel key={rel.id} title={rel.version} subtitle={`${rel.changes} changes · ${new Date(rel.date).toLocaleDateString()}`} accentBorder={rel.status === 'RELEASED' ? 'border-emerald-500/20' : rel.status === 'STAGING' ? 'border-amber-500/20' : 'border-slate-600/30'}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <ProgressBar value={rel.rolloutPercent} max={100} />
                  <p className="text-slate-400">{rel.rolloutPercent}% rolled out</p>
                </div>
                <StatusBadge status={rel.status === 'RELEASED' ? 'ACTIVE' : rel.status === 'STAGING' ? 'TRIAL' : 'PENDING'} />
              </div>
            </Panel>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* ── Feature Flags ──────────────────────────────────────────── */
function FeatureFlagsView() {
  const moduleQuery = useProviderModuleData();
  const updateFlag = useUpdateProviderFeatureFlag();
  const createFlag = useCreateProviderFeatureFlag();
  const accent = getAccent('provider_releases');
  const flags = (moduleQuery.data?.featureFlags ?? []) as FeatureFlagRuleDTO[];

  const [showNew, setShowNew] = useState(false);
  const [flagName, setFlagName] = useState('');
  const [flagTargeting, setFlagTargeting] = useState('ALL');

  const handleCreateFlag = () => {
    if (!flagName.trim()) return;
    const reason = reasonPrompt('Create feature flag');
    if (!reason) return;
    createFlag.mutate({ name: flagName, targeting: flagTargeting, rolloutPercent: 0, enabled: false, reason });
    setShowNew(false); setFlagName('');
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Flag} title="Feature Flags" description="Toggle features and manage progressive rollouts" accent={accent} actions={
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => setShowNew((p) => !p)}>+ Create Flag</Button>
      } />

      {showNew && (
        <Panel title="New Feature Flag" accentBorder="border-violet-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Flag name" value={flagName} onChange={(e) => setFlagName(e.target.value)} />
            <select className="h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100" value={flagTargeting} onChange={(e) => setFlagTargeting(e.target.value)}>
              <option value="ALL">All tenants</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="ALLOWLIST">Allowlist</option>
            </select>
            <Button size="sm" className="h-8 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" disabled={createFlag.isPending} onClick={handleCreateFlag}>{createFlag.isPending ? 'Creating…' : 'Create Flag'}</Button>
          </div>
        </Panel>
      )}

      {flags.length === 0 && !showNew && (
        <EmptyState icon={Flag} title="No Feature Flags" description="Create your first feature flag to control feature releases" action={<Button size="sm" className="h-7 bg-violet-500/20 text-violet-100" onClick={() => setShowNew(true)}>+ Create Flag</Button>} />
      )}

      <div className="grid gap-2">
        {flags.map((flag) => (
          <div key={flag.id} className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ToggleRight className={`size-4 ${flag.enabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <p className="text-xs font-semibold text-slate-100">{flag.name}</p>
                  <p className="text-[10px] text-slate-400">{flag.targeting} · {flag.rolloutPercent}% rollout</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ProgressBar value={flag.rolloutPercent} max={100} />
                <Button size="sm" className="h-6 bg-slate-700 text-slate-200 hover:bg-slate-600 text-[10px]" onClick={() => {
                  updateFlag.mutate({
                    flagId: flag.id,
                    enabled: flag.enabled,
                    rolloutPercent: Math.min(flag.rolloutPercent + 10, 100),
                    reason: 'Incremented rollout by 10%',
                  });
                }}>
                  +10%
                </Button>
                <Button size="sm" className={`h-6 text-[10px] ${flag.enabled ? 'bg-emerald-500/20 text-emerald-100 hover:bg-red-500/20 hover:text-red-100' : 'bg-slate-700 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-100'}`} onClick={() => {
                  updateFlag.mutate({
                    flagId: flag.id,
                    enabled: !flag.enabled,
                    rolloutPercent: flag.rolloutPercent,
                    reason: flag.enabled ? 'Disabled flag' : 'Enabled flag',
                  });
                }}>
                  {flag.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ── Rollout Status ─────────────────────────────────────────── */
function RolloutStatusView() {
  const moduleQuery = useProviderModuleData();
  const accent = getAccent('provider_releases');
  const flags = (moduleQuery.data?.featureFlags ?? []) as FeatureFlagRuleDTO[];

  const activeRollouts = flags.filter((f) => f.enabled && f.rolloutPercent > 0 && f.rolloutPercent < 100);
  const completedRollouts = flags.filter((f) => f.rolloutPercent === 100);

  return (
    <SectionShell>
      <SectionPageHeader icon={GitBranch} title="Rollout Status" description="Progressive rollout monitoring" accent={accent} />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Active Rollouts" value={String(activeRollouts.length)} sub="In progress" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Completed" value={String(completedRollouts.length)} sub="100% rolled out" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Avg Rollout" value={flags.length > 0 ? `${Math.round(flags.reduce((a, f) => a + f.rolloutPercent, 0) / flags.length)}%` : '—'} sub="Across all flags" gradient="from-blue-500/10 to-blue-500/5" />
      </div>

      {activeRollouts.length === 0 && completedRollouts.length === 0 && (
        <EmptyState icon={GitBranch} title="No Active Rollouts" description="Feature flags with rollout percentages will appear here" />
      )}

      {activeRollouts.length > 0 && (
        <Panel title="Active Rollouts" subtitle="In progress" accentBorder="border-amber-500/20">
          <div className="space-y-3">
            {activeRollouts.map((flag) => (
              <div key={flag.id} className="text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-100 font-semibold">{flag.name}</span>
                  <span className="text-amber-300">{flag.rolloutPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all" style={{ width: `${flag.rolloutPercent}%` }} />
                </div>
                <p className="text-slate-400 mt-0.5">{flag.targeting}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {completedRollouts.length > 0 && (
        <Panel title="Completed Rollouts" accentBorder="border-emerald-500/20">
          <div className="space-y-1">
            {completedRollouts.map((flag) => (
              <div key={flag.id} className="flex items-center justify-between text-xs rounded-lg bg-emerald-500/5 px-3 py-2">
                <span className="text-slate-100">{flag.name}</span>
                <StatusBadge status="ACTIVE" />
              </div>
            ))}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ── Release Notes ──────────────────────────────────────────── */
function ReleaseNotesView() {
  const accent = getAccent('provider_releases');
  const { data: releasesData, isLoading } = useProviderReleases();
  const notes = releasesData?.releaseNotes ?? [];

  return (
    <SectionShell>
      <SectionPageHeader icon={ScrollText} title="Release Notes" description="Changelog and version history" accent={accent} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-blue-400" /></div>
      ) : notes.length === 0 ? (
        <EmptyState icon={ScrollText} title="No Release Notes" description="No release notes available." />
      ) : (
        <div className="grid gap-3">
          {notes.map((note) => (
            <Panel key={note.id} title={note.version} subtitle={new Date(note.date).toLocaleDateString()} accentBorder="border-violet-500/20">
              <div className="space-y-1">
                {note.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-violet-400" />
                    <span className="text-slate-300">{h}</span>
                  </div>
                ))}
              </div>
              {note.changelog.length > 0 && (
                <div className="mt-2 space-y-1">
                  {note.changelog.map((cat, ci) => (
                    <div key={ci}>
                      <p className="text-[10px] font-semibold text-slate-300 uppercase">{cat.category}</p>
                      {cat.items.map((item, ii) => (
                        <p key={ii} className="text-[10px] text-slate-400 ml-2">• {item}</p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
