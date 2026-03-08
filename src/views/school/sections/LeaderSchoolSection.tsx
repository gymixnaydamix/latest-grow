/* ─── LeaderSchoolSection ─── Announcements, calendar, branding, policies, goals, compliance
 * All creation / edit / delete wired to mutation hooks.
 * ──────────────────────────────────────────────────────────────────── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Megaphone, Calendar, Palette, FileText,
  Plus, Edit, Download, Sparkles, Trash2,
  Check, X, Save,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useAnnouncements, useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '@/hooks/api/use-announcements';
import { useEvents, usePolicies, useGoals, useCreateEvent, useUpdateEvent, useDeleteEvent, useCreatePolicy, useUpdatePolicy, useCreateGoal, useUpdateGoal } from '@/hooks/api/use-operations';
import { useSaveSchoolProfile } from '@/hooks/api/use-school-ops';
import { useAIPolicyGenerator } from '@/hooks/api/use-ai';
import { notifySuccess, notifyError } from '@/lib/notify';
import type { Announcement, SchoolEvent, Policy, StrategicGoal } from '@root/types';
import ComplianceSectionView from '@/views/school/ComplianceSection';

export function LeaderSchoolSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader]);

  const view = (() => {
    switch (activeHeader) {
      case 'announcements': return <AnnouncementsView />;
      case 'school_calendar': return <SchoolCalendarView />;
      case 'school_branding': return <SchoolBrandingView />;
      case 'policy_generator': return <PolicyGeneratorView />;
      case 'strategic_goals': return <StrategicGoalsView />;
      case 'compliance': return <ComplianceSectionView />;
      default: return <AnnouncementsView />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ══════════════════════════════════════════════════════════════════
 *  ANNOUNCEMENTS — Create / Edit (inline) / Delete
 * ══════════════════════════════════════════════════════════════════ */
function AnnouncementsView() {
  const schoolId = useAuthStore((s) => s.schoolId) ?? '';
  const { data: announcements = [], isLoading } = useAnnouncements(schoolId || null);

  /* create form */
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const createMut = useCreateAnnouncement(schoolId);

  /* inline edit */
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const updateMut = useUpdateAnnouncement();
  const deleteMut = useDeleteAnnouncement();

  function handleCreate() {
    if (!newTitle.trim()) return;
    createMut.mutate(
      { title: newTitle.trim(), body: newBody.trim(), audience: newAudience ? newAudience.split(',').map(s => s.trim()) : [] },
      {
        onSuccess: () => { notifySuccess('Announcement created'); setShowCreate(false); setNewTitle(''); setNewBody(''); setNewAudience(''); },
        onError: () => notifyError('Failed to create announcement'),
      },
    );
  }

  function startEdit(a: Announcement) { setEditId(a.id); setEditTitle(a.title); }

  function handleSaveEdit() {
    if (!editId || !editTitle.trim()) return;
    updateMut.mutate(
      { id: editId, title: editTitle.trim() },
      { onSuccess: () => { notifySuccess('Announcement updated'); setEditId(null); }, onError: () => notifyError('Update failed') },
    );
  }

  function handleDelete(id: string) {
    deleteMut.mutate(id, {
      onSuccess: () => notifySuccess('Announcement deleted'),
      onError: () => notifyError('Delete failed'),
    });
  }

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <h2 className="text-lg font-semibold">School Announcements</h2>
        <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? <><X className="mr-1 size-3" /> Cancel</> : <><Plus className="mr-1 size-3" /> New Announcement</>}
        </Button>
      </div>

      {showCreate && (
        <Card data-animate>
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Textarea placeholder="Body" rows={3} value={newBody} onChange={(e) => setNewBody(e.target.value)} />
            <Input placeholder="Audience (comma-separated)" value={newAudience} onChange={(e) => setNewAudience(e.target.value)} />
            <Button size="sm" onClick={handleCreate} disabled={createMut.isPending || !newTitle.trim()}>
              {createMut.isPending ? 'Creating…' : 'Create'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2" data-animate>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="py-3"><Skeleton className="h-10 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center" data-animate>No announcements yet.</p>
      ) : (
        <div className="space-y-2" data-animate>
          {announcements.map((a) => {
            const status = a.publishedAt ? 'published' : 'draft';
            const isEditing = editId === a.id;
            return (
              <Card key={a.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="rounded bg-primary/10 p-2 shrink-0">
                      <Megaphone className="size-4 text-primary" />
                    </div>
                    {isEditing ? (
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-7 text-sm" />
                    ) : (
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.audience.join(', ') || 'All'} · {new Date(a.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge variant={status === 'published' ? 'default' : 'outline'} className="text-[10px]">{status}</Badge>
                    {isEditing ? (
                      <>
                        <Button size="icon" variant="ghost" className="size-7" onClick={handleSaveEdit} disabled={updateMut.isPending}>
                          <Check className="size-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditId(null)}>
                          <X className="size-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => startEdit(a)}>
                          <Edit className="size-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => handleDelete(a.id)} disabled={deleteMut.isPending}>
                          <Trash2 className="size-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  SCHOOL CALENDAR — Add / Edit / Delete events
 * ══════════════════════════════════════════════════════════════════ */
function SchoolCalendarView() {
  const schoolId = useAuthStore((s) => s.schoolId) ?? '';
  const { data, isLoading } = useEvents(schoolId || null);
  const events: SchoolEvent[] = data ?? [];

  /* create */
  const [showCreate, setShowCreate] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evStart, setEvStart] = useState('');
  const [evEnd, setEvEnd] = useState('');
  const [evType, setEvType] = useState('GENERAL');
  const createMut = useCreateEvent(schoolId);

  /* inline edit */
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const updateMut = useUpdateEvent();
  const deleteMut = useDeleteEvent();

  function handleCreate() {
    if (!evTitle.trim() || !evStart || !evEnd) return;
    createMut.mutate(
      { title: evTitle.trim(), description: evDesc.trim(), startDate: evStart, endDate: evEnd, type: evType },
      {
        onSuccess: () => { notifySuccess('Event created'); setShowCreate(false); setEvTitle(''); setEvDesc(''); setEvStart(''); setEvEnd(''); },
        onError: () => notifyError('Failed to create event'),
      },
    );
  }

  function handleSaveEdit() {
    if (!editId || !editTitle.trim()) return;
    updateMut.mutate(
      { id: editId, title: editTitle.trim() },
      { onSuccess: () => { notifySuccess('Event updated'); setEditId(null); }, onError: () => notifyError('Update failed') },
    );
  }

  function handleDelete(id: string) {
    deleteMut.mutate(id, {
      onSuccess: () => notifySuccess('Event deleted'),
      onError: () => notifyError('Delete failed'),
    });
  }

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <h2 className="text-lg font-semibold">School Calendar</h2>
        <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? <><X className="mr-1 size-3" /> Cancel</> : <><Plus className="mr-1 size-3" /> Add Event</>}
        </Button>
      </div>

      {showCreate && (
        <Card data-animate>
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Event title" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} />
            <Textarea placeholder="Description" rows={2} value={evDesc} onChange={(e) => setEvDesc(e.target.value)} />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1"><label className="text-xs font-medium">Start</label><Input type="date" value={evStart} onChange={(e) => setEvStart(e.target.value)} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">End</label><Input type="date" value={evEnd} onChange={(e) => setEvEnd(e.target.value)} /></div>
              <div className="space-y-1"><label className="text-xs font-medium">Type</label><Input value={evType} onChange={(e) => setEvType(e.target.value)} /></div>
            </div>
            <Button size="sm" onClick={handleCreate} disabled={createMut.isPending || !evTitle.trim() || !evStart || !evEnd}>
              {createMut.isPending ? 'Creating…' : 'Create Event'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {[
          { label: 'Total Events', value: String(events.length) },
          { label: 'This Month', value: String(events.filter(e => new Date(e.startDate).getMonth() === new Date().getMonth()).length) },
          { label: 'Upcoming', value: String(events.filter(e => new Date(e.startDate) > new Date()).length) },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold mt-1">{isLoading ? <Skeleton className="h-7 w-10 mx-auto" /> : m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2" data-animate>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-3"><Skeleton className="h-8 w-full" /></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center" data-animate>No events scheduled.</p>
      ) : (
        <div className="space-y-2" data-animate>
          {events.map((e) => {
            const isEditing = editId === e.id;
            return (
              <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Calendar className="size-4 text-primary shrink-0" />
                  {isEditing ? (
                    <Input value={editTitle} onChange={(ev) => setEditTitle(ev.target.value)} className="h-7 text-sm" />
                  ) : (
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
                  {isEditing ? (
                    <>
                      <Button size="icon" variant="ghost" className="size-7" onClick={handleSaveEdit} disabled={updateMut.isPending}>
                        <Check className="size-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditId(null)}>
                        <X className="size-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => { setEditId(e.id); setEditTitle(e.title); }}>
                        <Edit className="size-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => handleDelete(e.id)} disabled={deleteMut.isPending}>
                        <Trash2 className="size-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  SCHOOL BRANDING — Controlled form with save
 * ══════════════════════════════════════════════════════════════════ */
function SchoolBrandingView() {
  const schoolId = useAuthStore((s) => s.schoolId) ?? '';
  const saveMut = useSaveSchoolProfile(schoolId || null);
  const [schoolName, setSchoolName] = useState('Lincoln High School');
  const [motto, setMotto] = useState('Excellence in Education');
  const [website, setWebsite] = useState('www.lincolnhigh.edu');
  const [phone, setPhone] = useState('(555) 123-4567');
  const [dirty, setDirty] = useState(false);

  function markDirty<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setDirty(true); };
  }

  function handleSave() {
    saveMut.mutate(
      { name: schoolName.trim(), motto: motto.trim(), website: website.trim(), phone: phone.trim() },
      {
        onSuccess: () => { setDirty(false); notifySuccess('Branding saved'); },
        onError: () => notifyError('Failed to save branding'),
      },
    );
  }

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <h2 className="text-lg font-semibold">School Branding</h2>
        {dirty && (
          <Button size="sm" onClick={handleSave} disabled={saveMut.isPending}>
            <Save className="mr-1 size-3" /> {saveMut.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2" data-animate>
        <Card>
          <CardHeader><CardTitle className="text-sm">Logo & Identity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-video rounded bg-muted flex items-center justify-center">
              <Palette className="size-8 text-muted-foreground" />
            </div>
            <Button size="sm" variant="outline">Upload New Logo</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Brand Colors</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Primary', color: '#1e40af', hex: '#1E40AF' },
              { name: 'Secondary', color: '#059669', hex: '#059669' },
              { name: 'Accent', color: '#d97706', hex: '#D97706' },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="size-8 rounded" style={{ backgroundColor: c.color }} />
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.hex}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card data-animate>
        <CardHeader><CardTitle className="text-sm">School Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1"><label className="text-xs font-medium">School Name</label><Input value={schoolName} onChange={(e) => markDirty(setSchoolName)(e.target.value)} /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Motto</label><Input value={motto} onChange={(e) => markDirty(setMotto)(e.target.value)} /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Website</label><Input value={website} onChange={(e) => markDirty(setWebsite)(e.target.value)} /></div>
            <div className="space-y-1"><label className="text-xs font-medium">Phone</label><Input value={phone} onChange={(e) => markDirty(setPhone)(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  POLICY GENERATOR — Create / Edit / AI-generate stub
 * ══════════════════════════════════════════════════════════════════ */
function PolicyGeneratorView() {
  const schoolId = useAuthStore((s) => s.schoolId) ?? '';
  const { data, isLoading } = usePolicies(schoolId || null);
  const policies: Policy[] = data ?? [];

  /* create */
  const [showCreate, setShowCreate] = useState(false);
  const [polTitle, setPolTitle] = useState('');
  const [polBody, setPolBody] = useState('');
  const createMut = useCreatePolicy(schoolId);

  /* inline edit */
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const updateMut = useUpdatePolicy();

  function handleCreate() {
    if (!polTitle.trim()) return;
    createMut.mutate(
      { title: polTitle.trim(), body: polBody.trim() },
      {
        onSuccess: () => { notifySuccess('Policy created'); setShowCreate(false); setPolTitle(''); setPolBody(''); },
        onError: () => notifyError('Failed to create policy'),
      },
    );
  }

  function handleSaveEdit() {
    if (!editId || !editTitle.trim()) return;
    updateMut.mutate(
      { id: editId, title: editTitle.trim() },
      { onSuccess: () => { notifySuccess('Policy updated'); setEditId(null); }, onError: () => notifyError('Update failed') },
    );
  }

  const aiPolicyMut = useAIPolicyGenerator();

  function handleAiGenerate() {
    aiPolicyMut.mutate(
      { topic: 'student data handling', context: `School ${schoolId}` },
      {
        onSuccess: (data) => {
          setShowCreate(true);
          setPolTitle('AI-Generated Policy');
          setPolBody(data?.text ?? 'This policy covers the key requirements for student data handling, access controls, and compliance with applicable regulations…');
          notifySuccess('AI draft generated — review and save');
        },
        onError: () => notifyError('AI generation failed — try again'),
      },
    );
  }

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <h2 className="text-lg font-semibold">Policy Generator</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleAiGenerate} disabled={aiPolicyMut.isPending}>
            <Sparkles className="mr-1 size-3" /> {aiPolicyMut.isPending ? 'Generating…' : 'AI Generate'}
          </Button>
          <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? <><X className="mr-1 size-3" /> Cancel</> : <><Plus className="mr-1 size-3" /> New Policy</>}
          </Button>
        </div>
      </div>

      {showCreate && (
        <Card data-animate>
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Policy title" value={polTitle} onChange={(e) => setPolTitle(e.target.value)} />
            <Textarea placeholder="Policy body" rows={4} value={polBody} onChange={(e) => setPolBody(e.target.value)} />
            <Button size="sm" onClick={handleCreate} disabled={createMut.isPending || !polTitle.trim()}>
              {createMut.isPending ? 'Creating…' : 'Create Policy'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2" data-animate>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="py-3"><Skeleton className="h-10 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : policies.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center" data-animate>No policies created yet.</p>
      ) : (
        <div className="space-y-2" data-animate>
          {policies.map((p) => {
            const isEditing = editId === p.id;
            return (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="size-4 text-primary shrink-0" />
                    {isEditing ? (
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-7 text-sm" />
                    ) : (
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground">
                          v{p.version} · Updated {new Date(p.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge variant={p.status === 'PUBLISHED' ? 'default' : 'outline'} className="text-[10px]">
                      {p.status.toLowerCase()}
                    </Badge>
                    {isEditing ? (
                      <>
                        <Button size="icon" variant="ghost" className="size-7" onClick={handleSaveEdit} disabled={updateMut.isPending}>
                          <Check className="size-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditId(null)}>
                          <X className="size-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => { setEditId(p.id); setEditTitle(p.title); }}>
                          <Edit className="size-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="size-7"><Download className="size-3" /></Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
 *  STRATEGIC GOALS — Create / Inline-edit progress + title
 * ══════════════════════════════════════════════════════════════════ */
function StrategicGoalsView() {
  const schoolId = useAuthStore((s) => s.schoolId) ?? '';
  const { data, isLoading } = useGoals(schoolId || null);
  const goals: StrategicGoal[] = data ?? [];

  /* create */
  const [showCreate, setShowCreate] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const createMut = useCreateGoal(schoolId);

  /* inline edit */
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editProgress, setEditProgress] = useState(0);
  const updateMut = useUpdateGoal();

  function handleCreate() {
    if (!goalTitle.trim() || !goalTarget) return;
    createMut.mutate(
      { title: goalTitle.trim(), description: goalDesc.trim(), targetDate: goalTarget },
      {
        onSuccess: () => { notifySuccess('Goal created'); setShowCreate(false); setGoalTitle(''); setGoalDesc(''); setGoalTarget(''); },
        onError: () => notifyError('Failed to create goal'),
      },
    );
  }

  function startEdit(g: StrategicGoal) {
    setEditId(g.id); setEditTitle(g.title); setEditProgress(g.progress);
  }

  function handleSaveEdit() {
    if (!editId) return;
    updateMut.mutate(
      { id: editId, title: editTitle.trim(), progress: editProgress },
      { onSuccess: () => { notifySuccess('Goal updated'); setEditId(null); }, onError: () => notifyError('Update failed') },
    );
  }

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <h2 className="text-lg font-semibold">Strategic Goals</h2>
        <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? <><X className="mr-1 size-3" /> Cancel</> : <><Plus className="mr-1 size-3" /> Add Goal</>}
        </Button>
      </div>

      {showCreate && (
        <Card data-animate>
          <CardContent className="pt-4 space-y-3">
            <Input placeholder="Goal title" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} />
            <Textarea placeholder="Description" rows={2} value={goalDesc} onChange={(e) => setGoalDesc(e.target.value)} />
            <div className="space-y-1"><label className="text-xs font-medium">Target date</label><Input type="date" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} /></div>
            <Button size="sm" onClick={handleCreate} disabled={createMut.isPending || !goalTitle.trim() || !goalTarget}>
              {createMut.isPending ? 'Creating…' : 'Create Goal'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3" data-animate>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center" data-animate>No strategic goals defined.</p>
      ) : (
        <div className="space-y-3" data-animate>
          {goals.map((g) => {
            const isEditing = editId === g.id;
            return (
              <Card key={g.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    {isEditing ? (
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-7 text-sm flex-1 mr-2" />
                    ) : (
                      <p className="text-sm font-semibold">{g.title}</p>
                    )}
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <Input type="number" min={0} max={100} value={editProgress} onChange={(e) => setEditProgress(Number(e.target.value))} className="h-7 w-16 text-sm text-right" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{g.progress}%</span>
                      )}
                      {isEditing ? (
                        <>
                          <Button size="icon" variant="ghost" className="size-7" onClick={handleSaveEdit} disabled={updateMut.isPending}>
                            <Check className="size-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditId(null)}>
                            <X className="size-3" />
                          </Button>
                        </>
                      ) : (
                        <Button size="icon" variant="ghost" className="size-7" onClick={() => startEdit(g)}>
                          <Edit className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Progress value={isEditing ? editProgress : g.progress} className="mt-2 h-2" />
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{g.description}</span>
                    <span>{g.status} · {new Date(g.targetDate).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}




