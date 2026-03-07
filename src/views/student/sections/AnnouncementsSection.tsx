/* ─── AnnouncementsSection ─── School & class announcements ──────────
 * All, unread, academic, events, urgent, bookmarked views
 * ─────────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  Bell, Search, Bookmark, BookmarkCheck,
  Pin, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { type Announcement } from '@/store/student-data.store';
import { useStudentData } from '@/hooks/use-student-data';
import { EmptyState } from '@/components/features/EmptyState';

type AnncFilter = 'all' | 'unread' | 'academic' | 'events' | 'urgent' | 'saved';

export function AnnouncementsSection() {
  const store = useStudentData();
  const [filter, setFilter] = useState<AnncFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = store.announcements;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a: Announcement) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
    }

    switch (filter) {
      case 'unread': list = list.filter((a: Announcement) => !a.read); break;
      case 'academic': list = list.filter((a: Announcement) => a.category === 'academic'); break;
      case 'events': list = list.filter((a: Announcement) => a.category === 'event'); break;
      case 'urgent': list = list.filter((a: Announcement) => a.category === 'urgent'); break;
      case 'saved': list = list.filter((a: Announcement) => a.bookmarked); break;
    }

    return list.sort((a: Announcement, b: Announcement) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [store.announcements, filter, search]);

  const unreadCount = store.announcements.filter((a: Announcement) => !a.read).length;
  const urgentCount = store.announcements.filter((a: Announcement) => a.category === 'urgent' && !a.read).length;

  const filters: { id: AnncFilter; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: store.announcements.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'academic', label: 'Academic' },
    { id: 'events', label: 'Events' },
    { id: 'urgent', label: 'Urgent', count: urgentCount },
    { id: 'saved', label: 'Saved' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white/90">Announcements</h2>
        <p className="text-sm text-white/40">{store.announcements.length} announcements · {unreadCount} unread</p>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 overflow-x-auto">
          {filters.map(f => (
            <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'ghost'}
              onClick={() => setFilter(f.id)}
              className={cn('text-xs flex-shrink-0', filter !== f.id && 'text-white/40')}>
              {f.label} {f.count !== undefined && f.count > 0 && <span className="ml-1 text-[10px] opacity-60">({f.count})</span>}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..."
            className="pl-9 h-8 text-xs bg-white/[0.03] border-white/8" />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState title="No announcements" description={filter !== 'all' ? 'Try a different filter.' : 'No announcements posted yet.'} />
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-3 pr-2">
            {filtered.map((a: Announcement) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

/* ── Announcement Card ── */
function AnnouncementCard({ announcement: a }: { announcement: Announcement }) {
  const store = useStudentData();
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (!a.read) store.markAnnouncementRead(a.id);
    setExpanded(!expanded);
  };

  return (
    <Card className={cn(
      'border-white/8 bg-white/[0.02] transition-all',
      !a.read && 'border-l-2 border-l-indigo-500/50',
      a.category === 'urgent' && 'border-red-500/10',
    )}>
      <CardContent className="py-3 px-4">
        {/* Header row */}
        <div className="flex items-start gap-3 cursor-pointer" onClick={handleClick}>
          <div className={cn(
            'flex items-center justify-center size-8 rounded-lg flex-shrink-0 mt-0.5',
            a.category === 'urgent' ? 'bg-red-500/10' : 'bg-white/[0.03]',
          )}>
            {a.pinned ? <Pin className="size-3.5 text-amber-400" /> :
             a.category === 'urgent' ? <AlertTriangle className="size-3.5 text-red-400" /> :
             <Bell className="size-3.5 text-white/30" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn('text-sm font-medium', a.read ? 'text-white/60' : 'text-white/85')}>{a.title}</span>
              <CategoryBadge category={a.category} />
              {a.category === 'urgent' && <Badge className="text-[8px] bg-red-500/20 text-red-400 border-0">Urgent</Badge>}
              {a.pinned && <Badge className="text-[8px] bg-amber-500/15 text-amber-400 border-0">Pinned</Badge>}
              {!a.read && <Badge className="text-[8px] bg-indigo-500/20 text-indigo-400 border-0">New</Badge>}
            </div>
            <p className={cn('text-[11px] leading-relaxed', expanded ? 'text-white/55' : 'text-white/35 line-clamp-2')}>{a.body}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[10px] text-white/25">{new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <button onClick={e => { e.stopPropagation(); store.toggleBookmark(a.id); }}
              className="text-white/20 hover:text-amber-400 transition-colors">
              {a.bookmarked ? <BookmarkCheck className="size-3.5 text-amber-400" /> : <Bookmark className="size-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-4 text-[10px] text-white/30">
              <span>Posted by {a.author}</span>
              <span>{a.targetAudience}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Helpers ── */
function CategoryBadge({ category }: { category: string }) {
  const c: Record<string, string> = {
    academic: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    event: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    urgent: 'text-red-400 bg-red-500/10 border-red-500/20',
    general: 'text-white/40 bg-white/5 border-white/10',
    exam: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };
  return <Badge variant="outline" className={cn('text-[8px] capitalize', c[category] || 'border-white/10 text-white/40')}>{category}</Badge>;
}
