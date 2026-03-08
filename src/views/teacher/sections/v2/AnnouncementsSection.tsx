/* ─── Announcements Section ───────────────────────────────────────
 * Routes: announcement_feed (default) | create_announcement
 * ──────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  ChevronRight, Eye,
  Megaphone, Plus, Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCreateTeacherAnnouncement, useTeacherAnnouncements } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import {
  TeacherSectionShell, GlassCard, MetricCard, PriorityBadge, EmptyState,
} from './shared';
import type { TeacherSectionProps } from './shared';
import {
  announcementsDemo as FALLBACK_announcementsDemo, formatDateLabel, type AnnouncementDemo,
} from './teacher-demo-data';

/* ── Priority accent map ── */
const priorityAccent: Record<string, { border: string; bg: string; ring: string }> = {
  HIGH: { border: 'border-rose-500/25', bg: 'bg-rose-500/5', ring: 'ring-rose-500/10' },
  MEDIUM: { border: 'border-amber-500/20', bg: 'bg-amber-500/3', ring: 'ring-amber-500/10' },
  LOW: { border: 'border-border/60', bg: 'bg-card/60', ring: '' },
};

export function AnnouncementsSection({ schoolId: _schoolId }: TeacherSectionProps) {
  const { activeHeader, setHeader } = useNavigationStore();
  const header = activeHeader || 'announcement_feed';
  const createAnnouncement = useCreateTeacherAnnouncement();

  const { data: apiAnnouncements } = useTeacherAnnouncements();
  const announcements: AnnouncementDemo[] =
    (apiAnnouncements as unknown as AnnouncementDemo[]) ?? FALLBACK_announcementsDemo;

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ── Create form state ── */
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [audiences, setAudiences] = useState<Set<string>>(new Set());

  const unreadCount = announcements.filter(a => !a.read).length;

  const filtered = useMemo(() => {
    let result = announcements;
    if (filterPriority !== 'all') result = result.filter(a => a.priority === filterPriority);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q),
      );
    }
    return result;
  }, [announcements, filterPriority, search]);

  const toggleAudience = (audience: string) => {
    setAudiences(prev => {
      const next = new Set(prev);
      next.has(audience) ? next.delete(audience) : next.add(audience);
      return next;
    });
  };

  const handleCreate = () => {
    if (!newTitle.trim() || !newBody.trim() || audiences.size === 0) return;
    createAnnouncement.mutate(
      { title: newTitle, body: newBody, priority: newPriority, audiences: [...audiences] },
      {
        onSuccess: () => {
          notifySuccess('Announcement published', `"${newTitle}" has been published`);
          setNewTitle(''); setNewBody(''); setNewPriority('MEDIUM'); setAudiences(new Set());
          setHeader('announcement_feed');
        },
      },
    );
  };

  return (
    <TeacherSectionShell
      title="Announcements"
      description={`${announcements.length} announcements · ${unreadCount} unread`}
      actions={
        <Button
          size="sm"
          className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
          onClick={() => setHeader('create_announcement')}
        >
          <Plus className="size-3.5" /> New Announcement
        </Button>
      }
    >
      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-animate>
        <MetricCard label="Total" value={announcements.length} accent="#818cf8" />
        <MetricCard label="Unread" value={unreadCount} accent="#f472b6" />
        <MetricCard label="High Priority" value={announcements.filter(a => a.priority === 'HIGH').length} accent="#f87171" />
        <MetricCard label="This Week" value={announcements.filter(a => a.publishedAt >= '2026-03-01').length} accent="#34d399" />
      </div>

      {/* ── FEED VIEW ── */}
      {header === 'announcement_feed' && (
        <div className="space-y-4" data-animate>
          {/* Search + Filter */}
          <GlassCard className="flex flex-wrap items-center gap-3 p-3!">
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
              <Input
                placeholder="Search announcements..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="flex gap-1.5">
              {['all', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    filterPriority === p
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-card/80 text-muted-foreground border border-border/50 hover:bg-muted/70'
                  }`}
                >
                  {p === 'all' ? 'All' : p}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Announcement Cards */}
          {filtered.length === 0 ? (
            <EmptyState title="No announcements" message="No announcements match your filters." icon={<Megaphone className="size-8" />} />
          ) : (
            <div className="space-y-3">
              {filtered.map(ann => {
                const accent = priorityAccent[ann.priority] ?? priorityAccent.LOW;
                const isExpanded = expandedId === ann.id;

                return (
                  <button
                    key={ann.id}
                    onClick={() => setExpandedId(isExpanded ? null : ann.id)}
                    className={`w-full text-left rounded-xl border px-5 py-4 transition-all ${accent.border} ${accent.bg} ${
                      isExpanded ? `ring-1 ${accent.ring}` : 'hover:bg-muted/60'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {ann.read ? (
                          <Eye className="size-4 text-muted-foreground/40" />
                        ) : (
                          <div className="size-2.5 rounded-full bg-indigo-400 mt-1" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${ann.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {ann.title}
                          </span>
                          <PriorityBadge priority={ann.priority} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground/80">
                          <span>{ann.author}</span>
                          <span>·</span>
                          <span>{formatDateLabel(ann.publishedAt)}</span>
                          <span>·</span>
                          <Badge variant="outline" className="text-[9px] border-border/70 text-muted-foreground/70">
                            {ann.audience}
                          </Badge>
                        </div>

                        {/* Expanded Body */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-sm text-muted-foreground leading-relaxed">{ann.body}</p>
                          </div>
                        )}
                      </div>

                      <ChevronRight className={`size-4 text-muted-foreground/50 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CREATE ANNOUNCEMENT VIEW ── */}
      {header === 'create_announcement' && (
        <GlassCard data-animate>
          <div className="flex items-center gap-2 mb-5">
            <Megaphone className="size-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-foreground/80">Create Announcement</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input
                placeholder="Announcement title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Body</Label>
              <Textarea
                placeholder="Write the announcement details..."
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                rows={5}
                className="bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60 resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Audience</Label>
                <div className="space-y-2">
                  {[
                    { value: 'TEACHER', label: 'Teachers' },
                    { value: 'STUDENT', label: 'Students' },
                    { value: 'PARENT', label: 'Parents' },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-card/60 px-3 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors"
                    >
                      <Checkbox
                        checked={audiences.has(opt.value)}
                        onCheckedChange={() => toggleAudience(opt.value)}
                        className="border-border data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                      />
                      <span className="text-sm text-muted-foreground">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select value={newPriority} onValueChange={v => setNewPriority(v as 'HIGH' | 'MEDIUM' | 'LOW')}>
                  <SelectTrigger className="bg-card/80 border-border/60 text-foreground/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/70">
                    <SelectItem value="HIGH">High Priority</SelectItem>
                    <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                    <SelectItem value="LOW">Low Priority</SelectItem>
                  </SelectContent>
                </Select>

                {/* Preview Badge */}
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/70">
                  Preview: <PriorityBadge priority={newPriority} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-muted-foreground"
                onClick={() => setHeader('announcement_feed')}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newBody.trim() || audiences.size === 0}
              >
                <Megaphone className="size-3.5" /> Publish
              </Button>
            </div>
          </div>
        </GlassCard>
      )}
    </TeacherSectionShell>
  );
}
