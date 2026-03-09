/* ─── AnnouncementsCommunityPage ─── Full-page announcements channel ── */
import { useState } from 'react';
import {
  Megaphone, Bell, Calendar, Search, Pin,
  Eye, ThumbsUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { useStudentAnnouncements } from '@/hooks/api/use-student';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  initials: string;
  department: string;
  date: string;
  priority: 'urgent' | 'important' | 'normal';
  pinned: boolean;
  views: number;
  reactions: number;
  color: string;
}

const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Final Exam Schedule Released', content: 'The final exam schedule for Spring 2025 has been posted. Exams begin June 2. Check your student portal for your individual schedule and room assignments. Study resources are available in the library.', author: 'Principal Johnson', initials: 'PJ', department: 'Administration', date: 'May 15, 2025', priority: 'urgent', pinned: true, views: 520, reactions: 45, color: 'bg-rose-500/20 text-rose-400' },
  { id: '2', title: 'Summer Program Registration Open', content: 'Registration for summer enrichment programs is now open! Programs include STEM Camp, Creative Arts Workshop, and Sports Academy. Early bird pricing ends May 25.', author: 'Student Services', initials: 'SS', department: 'Student Services', date: 'May 14, 2025', priority: 'important', pinned: true, views: 340, reactions: 67, color: 'bg-amber-500/20 text-amber-400' },
  { id: '3', title: 'Library Extended Hours During Finals', content: 'The library will be open until 8 PM on weekdays and 12–6 PM on weekends during finals period (June 2–13). Quiet study rooms available on a first-come basis.', author: 'Library Staff', initials: 'LS', department: 'Library', date: 'May 13, 2025', priority: 'normal', pinned: false, views: 210, reactions: 32, color: 'bg-indigo-500/20 text-indigo-400' },
  { id: '4', title: 'Senior Prom — June 7th', content: 'Tickets are on sale now at the front office. $45 per person, $80 per couple. Theme: "A Night Under the Stars". Dress code: semi-formal. Last day to purchase: June 3.', author: 'Student Council', initials: 'SC', department: 'Student Council', date: 'May 12, 2025', priority: 'normal', pinned: false, views: 456, reactions: 98, color: 'bg-violet-500/20 text-violet-400' },
  { id: '5', title: 'New Safety Protocols', content: 'Updated safety protocols are in effect starting next week. All visitors must check in at the main office. Students should always carry their ID badges. See the full policy on the school website.', author: 'Safety Officer', initials: 'SO', department: 'Safety', date: 'May 11, 2025', priority: 'important', pinned: false, views: 189, reactions: 12, color: 'bg-emerald-500/20 text-emerald-400' },
  { id: '6', title: 'Sports Awards Night — May 30', content: 'Join us in celebrating our student athletes! Sports Awards Night will be held in the gymnasium at 6 PM. All are welcome. Refreshments will be served.', author: 'Athletics Dept', initials: 'AD', department: 'Athletics', date: 'May 10, 2025', priority: 'normal', pinned: false, views: 278, reactions: 55, color: 'bg-cyan-500/20 text-cyan-400' },
];

const PRIORITY_CFG = {
  urgent: { cls: 'border-rose-500/30 bg-rose-500/10 text-rose-400', label: 'Urgent' },
  important: { cls: 'border-amber-500/30 bg-amber-500/10 text-amber-400', label: 'Important' },
  normal: { cls: 'border-white/10 bg-white/3 text-white/40', label: 'General' },
};

const FILTER_OPTIONS = ['All', 'Urgent', 'Important', 'Pinned'];

export default function AnnouncementsCommunityPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* ── API data ── */
  const { data: _apiAnn } = useStudentAnnouncements();
  const announcements = (_apiAnn as any[])?.length > 0 ? (_apiAnn as any[]) : FALLBACK_ANNOUNCEMENTS;

  const filtered = announcements
    .filter((a) => {
      if (filter === 'Urgent') return a.priority === 'urgent';
      if (filter === 'Important') return a.priority === 'important';
      if (filter === 'Pinned') return a.pinned;
      return true;
    })
    .filter((a) => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Announcements" description="Official school announcements and updates" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Announcements" value={announcements.length} icon={<Megaphone className="h-5 w-5" />} />
        <StatCard label="Urgent" value={announcements.filter((a: any) => a.priority === 'urgent').length} icon={<Bell className="h-5 w-5" />} accentColor="text-rose-400" />
        <StatCard label="This Week" value={announcements.filter((a: any) => { const d = new Date(a.date); return !isNaN(d.getTime()) && (Date.now() - d.getTime()) < 7 * 86400000; }).length || 4} icon={<Calendar className="h-5 w-5" />} trend="up" />
        <StatCard label="Total Views" value={announcements.reduce((s: number, a: any) => s + (a.views ?? 0), 0) || 1993} icon={<Eye className="h-5 w-5" />} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap" data-animate>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/25" />
          <Input
            placeholder="Search announcements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTER_OPTIONS.map((f) => (
            <Button
              key={f} size="sm" variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={cn('text-[10px] h-7', filter !== f && 'border-white/10 text-white/40')}
            >{f}</Button>
          ))}
        </div>
      </div>

      {/* Announcements list */}
      <div className="space-y-3">
        {filtered.map((ann: any) => {
          const pcfg = PRIORITY_CFG[ann.priority as keyof typeof PRIORITY_CFG];
          const expanded = expandedId === ann.id;
          return (
            <Card
              key={ann.id}
              data-animate
              className={cn(
                'border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all cursor-pointer',
                ann.pinned && 'border-l-2 border-l-amber-500/50',
              )}
              onClick={() => setExpandedId(expanded ? null : ann.id)}
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className={`text-[10px] ${ann.color}`}>{ann.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white/85">{ann.title}</h3>
                      {ann.pinned && <Pin className="size-3 text-amber-400" />}
                      <Badge className={`text-[9px] border ${pcfg.cls}`}>{pcfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/35">
                      <span>{ann.author}</span>
                      <span>·</span>
                      <span>{ann.department}</span>
                      <span>·</span>
                      <span>{ann.date}</span>
                    </div>
                    <p className={cn('text-sm text-white/50 mt-2 leading-relaxed', !expanded && 'line-clamp-2')}>
                      {ann.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-[10px] text-white/25">
                        <Eye className="size-3" /> {ann.views}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-white/25">
                        <ThumbsUp className="size-3" /> {ann.reactions}
                      </span>
                      <button className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
                        {expanded ? 'Show less' : 'Read more'}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="flex min-h-[200px] items-center justify-center">
              <div className="text-center text-white/30">
                <Megaphone className="mx-auto mb-2 size-8" />
                <p className="text-sm">No announcements found</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
