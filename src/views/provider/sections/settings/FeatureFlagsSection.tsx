/* ─── FeatureFlagsSection ─── Active, Archived, A/B Tests ───── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Flag, ToggleRight, ToggleLeft, Archive, TestTube2,
  Plus, Trash2, RotateCcw, Pause, Play, Trophy,
  Zap, Beaker, FlaskConical,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useFeatureFlags, useCreateFlag, useUpdateFlag, useToggleFlag, useDeleteFlag,
  useABTests, useCreateABTest, useUpdateABTest, useDeleteABTest,
  type FeatureFlag, type ABTest,
} from '@/hooks/api/use-settings';

/* ── 3D Icon Components ─────────────────────────────────────── */
function Icon3D_Flag() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,.35))' }}>
      <defs>
        <linearGradient id="flag3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <radialGradient id="flagShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#flag3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#flagShine)" />
      <g transform="translate(13,10)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 0v20" /><path d="M0 0h10l-2 4 2 4H0" />
      </g>
    </svg>
  );
}

function Icon3D_Archive() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(107,114,128,.35))' }}>
      <defs>
        <linearGradient id="arch3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9ca3af" /><stop offset="100%" stopColor="#6b7280" />
        </linearGradient>
        <radialGradient id="archShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#arch3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#archShine)" />
      <g transform="translate(11,12)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="0" y="0" width="18" height="4" rx="1" /><path d="M2 4v10a2 2 0 002 2h10a2 2 0 002-2V4" /><line x1="7" y1="8" x2="11" y2="8" />
      </g>
    </svg>
  );
}

function Icon3D_Test() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(139,92,246,.35))' }}>
      <defs>
        <linearGradient id="test3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="testShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#test3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#testShine)" />
      <g transform="translate(12,10)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 0v7l-5 9a2 2 0 001.7 3h10.6a2 2 0 001.7-3L10 7V0" /><line x1="4" y1="0" x2="12" y2="0" /><circle cx="8" cy="14" r="1" fill="white" />
      </g>
    </svg>
  );
}

/* ── Main Export ───────────────────────────────────────────────── */
export function FeatureFlagsSection() {
  const { activeSubNav } = useNavigationStore();
  const ref = useStaggerAnimate<HTMLDivElement>([activeSubNav]);

  const view = (() => {
    switch (activeSubNav) {
      case 'archived_flags': return <ArchivedFlagsView />;
      case 'ab_tests': return <ABTestsView />;
      default: return <ActiveFlagsView />;
    }
  })();

  return <div ref={ref} className="space-y-3 h-full overflow-y-auto pr-1">{view}</div>;
}

/* ════════════════════════════════════════════════════════════════
 * ACTIVE FLAGS VIEW
 * ════════════════════════════════════════════════════════════════ */

function ActiveFlagsView() {
  const { data: flags, loading, refetch } = useFeatureFlags(false);
  const { mutate: createFlag, loading: creating } = useCreateFlag();
  const { mutate: toggleFlag } = useToggleFlag();
  const { mutate: updateFlag } = useUpdateFlag();
  const { mutate: deleteFlag } = useDeleteFlag();

  const [showCreate, setShowCreate] = useState(false);
  const [newFlag, setNewFlag] = useState({ name: '', key: '', description: '', environment: 'production', rollout: 0 });

  const handleCreate = async () => {
    if (!newFlag.name || !newFlag.key) return;
    await createFlag(newFlag);
    setNewFlag({ name: '', key: '', description: '', environment: 'production', rollout: 0 });
    setShowCreate(false);
    refetch();
  };

  const handleToggle = async (id: string) => {
    await toggleFlag(undefined, `/${id}/toggle`);
    refetch();
  };

  const handleArchive = async (id: string) => {
    await updateFlag({ archived: true }, `/${id}`);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteFlag(undefined, `/${id}`);
    refetch();
  };

  const envColors: Record<string, string> = {
    production: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    staging: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    development: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/8 to-teal-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Flag />
          <div>
            <h2 className="text-base font-bold tracking-tight">Active Feature Flags</h2>
            <p className="text-xs text-muted-foreground">Control feature rollouts in real-time</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{flags.length} flags</Badge>
            <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600" onClick={() => setShowCreate(true)}>
              <Plus className="size-3" /> New Flag
            </Button>
          </div>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card data-animate className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="py-3 px-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><Zap className="size-3 text-emerald-500" /> Create Feature Flag</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Flag name" className="h-7 text-xs" value={newFlag.name} onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })} />
              <Input placeholder="flag_key (snake_case)" className="h-7 text-xs font-mono" value={newFlag.key} onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value })} />
              <Input placeholder="Description" className="h-7 text-xs sm:col-span-2" value={newFlag.description} onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <select
                className="h-7 rounded-md border border-border/60 bg-muted/30 px-2 text-xs"
                value={newFlag.environment}
                onChange={(e) => setNewFlag({ ...newFlag, environment: e.target.value })}
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-7 text-xs" onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flags list */}
      <div className="space-y-1.5" data-animate>
        {flags.map((f: FeatureFlag) => (
          <Card key={f.id} className="group border-border/60 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5">
            <CardContent className="flex items-center gap-3 py-2.5 px-3">
              {/* Toggle */}
              <button onClick={() => handleToggle(f.id)} className="shrink-0 transition-transform hover:scale-110">
                {f.enabled ? <ToggleRight className="size-6 text-emerald-500" /> : <ToggleLeft className="size-6 text-muted-foreground/50" />}
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold">{f.name}</p>
                  {f.description && <p className="text-[9px] text-muted-foreground truncate">— {f.description}</p>}
                </div>
                <p className="text-[9px] font-mono text-muted-foreground">{f.key}</p>
              </div>

              {/* Rollout bar */}
              {f.rollout > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 w-20">
                  <Progress value={f.rollout} className="h-1.5" />
                  <span className="text-[9px] font-bold text-muted-foreground">{f.rollout}%</span>
                </div>
              )}

              {/* Env badge */}
              <Badge variant="outline" className={`text-[9px] ${envColors[f.environment] ?? ''}`}>{f.environment}</Badge>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleArchive(f.id)} title="Archive">
                  <Archive className="size-3 text-muted-foreground" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleDelete(f.id)} title="Delete">
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      )}

      {!loading && flags.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Flag className="size-8 mb-2 opacity-30" />
          <p className="text-xs">No active feature flags</p>
          <p className="text-[10px]">Create one to get started</p>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
 * ARCHIVED FLAGS VIEW
 * ════════════════════════════════════════════════════════════════ */

function ArchivedFlagsView() {
  const { data: flags, loading, refetch } = useFeatureFlags(true);
  const { mutate: updateFlag } = useUpdateFlag();
  const { mutate: deleteFlag } = useDeleteFlag();

  const handleRestore = async (id: string) => {
    await updateFlag({ archived: false }, `/${id}`);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteFlag(undefined, `/${id}`);
    refetch();
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-slate-500/20 bg-linear-to-br from-slate-500/8 to-gray-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-slate-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Archive />
          <div>
            <h2 className="text-base font-bold tracking-tight">Archived Flags</h2>
            <p className="text-xs text-muted-foreground">Previously active flags no longer in use</p>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px]">{flags.length} archived</Badge>
        </div>
      </div>

      {/* Archived list */}
      <div className="space-y-1.5" data-animate>
        {flags.map((f: FeatureFlag) => (
          <Card key={f.id} className="group border-border/60 opacity-80 hover:opacity-100 transition-all duration-300 hover:border-slate-500/30">
            <CardContent className="flex items-center gap-3 py-2.5 px-3">
              <Archive className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{f.name}</p>
                <p className="text-[9px] font-mono text-muted-foreground">{f.key}</p>
              </div>
              {f.archivedAt && (
                <span className="text-[9px] text-muted-foreground hidden sm:block">
                  Archived {new Date(f.archivedAt).toLocaleDateString()}
                </span>
              )}
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleRestore(f.id)}>
                  <RotateCcw className="size-3" /> Restore
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleDelete(f.id)}>
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
        </div>
      )}

      {!loading && flags.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Archive className="size-8 mb-2 opacity-30" />
          <p className="text-xs">No archived flags</p>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
 * A/B TESTS VIEW
 * ════════════════════════════════════════════════════════════════ */

function ABTestsView() {
  const { data: tests, loading, refetch } = useABTests();
  const { mutate: createTest, loading: creating } = useCreateABTest();
  const { mutate: updateTest } = useUpdateABTest();
  const { mutate: deleteTest } = useDeleteABTest();

  const [showCreate, setShowCreate] = useState(false);
  const [newTest, setNewTest] = useState({ name: '', key: '', variants: 2, traffic: '50/50' });

  const handleCreate = async () => {
    if (!newTest.name || !newTest.key) return;
    await createTest(newTest);
    setNewTest({ name: '', key: '', variants: 2, traffic: '50/50' });
    setShowCreate(false);
    refetch();
  };

  const handlePauseResume = async (id: string, current: string) => {
    const status = current === 'running' ? 'paused' : 'running';
    await updateTest({ status }, `/${id}`);
    refetch();
  };

  const handleComplete = async (id: string, winner: string) => {
    await updateTest({ status: 'completed', winner }, `/${id}`);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteTest(undefined, `/${id}`);
    refetch();
  };

  const statusColors: Record<string, string> = {
    running: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    paused: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    completed: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-violet-500/20 bg-linear-to-br from-violet-500/8 to-purple-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Test />
          <div>
            <h2 className="text-base font-bold tracking-tight">A/B Tests</h2>
            <p className="text-xs text-muted-foreground">Experiment results and active tests</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{tests.filter((t: ABTest) => t.status === 'running').length} running</Badge>
            <Button size="sm" className="gap-1.5 bg-violet-500 hover:bg-violet-600" onClick={() => setShowCreate(true)}>
              <FlaskConical className="size-3" /> New Test
            </Button>
          </div>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card data-animate className="border-violet-500/30 bg-violet-500/5">
          <CardContent className="py-3 px-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><Beaker className="size-3 text-violet-500" /> Create A/B Test</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Test name" className="h-7 text-xs" value={newTest.name} onChange={(e) => setNewTest({ ...newTest, name: e.target.value })} />
              <Input placeholder="test_key (snake_case)" className="h-7 text-xs font-mono" value={newTest.key} onChange={(e) => setNewTest({ ...newTest, key: e.target.value })} />
              <Input type="number" placeholder="Variants" className="h-7 text-xs" value={newTest.variants} onChange={(e) => setNewTest({ ...newTest, variants: parseInt(e.target.value) || 2 })} />
              <Input placeholder="Traffic split (50/50)" className="h-7 text-xs" value={newTest.traffic} onChange={(e) => setNewTest({ ...newTest, traffic: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-violet-500 hover:bg-violet-600 h-7 text-xs" onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tests list */}
      <div className="space-y-1.5" data-animate>
        {tests.map((t: ABTest) => (
          <Card key={t.id} className="group border-border/60 transition-all duration-300 hover:border-violet-500/30 hover:shadow-md hover:shadow-violet-500/5">
            <CardContent className="flex items-center gap-3 py-2.5 px-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                <TestTube2 className="size-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold">{t.name}</p>
                </div>
                <p className="text-[9px] text-muted-foreground">{t.variants} variants · Traffic: {t.traffic}</p>
              </div>

              <Badge variant="outline" className={`text-[9px] ${statusColors[t.status] ?? ''}`}>{t.status}</Badge>
              {t.winner && (
                <Badge className="text-[9px] bg-emerald-500 gap-0.5">
                  <Trophy className="size-2.5" /> {t.winner}
                </Badge>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {t.status !== 'completed' && (
                  <>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handlePauseResume(t.id, t.status)} title={t.status === 'running' ? 'Pause' : 'Resume'}>
                      {t.status === 'running' ? <Pause className="size-3" /> : <Play className="size-3" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleComplete(t.id, 'Variant A')} title="Complete">
                      <Trophy className="size-3 text-emerald-500" />
                    </Button>
                  </>
                )}
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleDelete(t.id)} title="Delete">
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      )}

      {!loading && tests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <TestTube2 className="size-8 mb-2 opacity-30" />
          <p className="text-xs">No A/B tests</p>
          <p className="text-[10px]">Create one to start experimenting</p>
        </div>
      )}
    </>
  );
}
