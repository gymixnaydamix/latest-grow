/* ─── StarredPage ─── Full-page starred-messages view for students ─── */
import { useState } from 'react';
import {
  Star, Search,
  Archive, Trash2, Paperclip, Send,
  Clock, BookOpen, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess } from '@/lib/notify';
import { useStudentMessages } from '@/hooks/api/use-student';

interface StarredMsg {
  id: string;
  from: string;
  initials: string;
  subject: string;
  preview: string;
  date: string;
  category: string;
  color: string;
}

// @ts-expect-error TS6133 — mock data kept for shape reference
const _STARRED: StarredMsg[] = [
  { id: '1', from: 'Mrs. Rodriguez', initials: 'MR', subject: 'Algebra II — Test Review Session', preview: 'Don\'t forget: review session Thursday at 3 PM in Room 204. Bring your formula sheet.', date: 'May 14', category: 'Teacher', color: 'bg-indigo-500/20 text-indigo-400' },
  { id: '2', from: 'School Office', initials: 'SO', subject: 'Updated Schedule for Next Week', preview: 'Due to the assembly on Tuesday, the class schedule will shift by one period.', date: 'May 13', category: 'Admin', color: 'bg-amber-500/20 text-amber-400' },
  { id: '3', from: 'Dr. Chen', initials: 'DC', subject: 'AP Chemistry Lab Report Feedback', preview: 'Great work on the titration lab! A few corrections needed on the error analysis section.', date: 'May 12', category: 'Teacher', color: 'bg-emerald-500/20 text-emerald-400' },
  { id: '4', from: 'Guidance Counselor', initials: 'GC', subject: 'College Prep: SAT Study Materials', preview: 'Here are the recommended study guides and practice test links for the June SAT.', date: 'May 10', category: 'Counselor', color: 'bg-violet-500/20 text-violet-400' },
  { id: '5', from: 'Mr. Thompson', initials: 'MT', subject: 'English Essay — Extended Deadline', preview: 'The essay deadline has been extended to May 20. Feel free to schedule office hours for help.', date: 'May 9', category: 'Teacher', color: 'bg-cyan-500/20 text-cyan-400' },
  { id: '6', from: 'Student Council', initials: 'SC', subject: 'Prom Committee — Volunteer Sign-Up', preview: 'We need volunteers for setup on June 5. Reply if you\'re interested!', date: 'May 8', category: 'Classmate', color: 'bg-rose-500/20 text-rose-400' },
];

export default function StarredPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* ── API data ── */
  const { data: _apiMessages } = useStudentMessages();
  const starred = ((_apiMessages as any[]) ?? []).filter((m: any) => m.starred);

  const selected = starred.find((s: any) => s.id === selectedId);
  const filtered = starred.filter(
    (s: any) => !search || s.from?.toLowerCase().includes(search.toLowerCase()) || s.subject?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Starred Messages" description="Important messages you've saved for quick access" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Starred Messages" value={starred.length} icon={<Star className="h-5 w-5" />} accentColor="text-yellow-400" />
        <StatCard label="From Teachers" value={starred.filter((s: any) => s.category === 'Teacher').length} icon={<BookOpen className="h-5 w-5" />} />
        <StatCard label="From Admin" value={starred.filter((s: any) => s.category === 'Admin').length} icon={<Users className="h-5 w-5" />} />
        <StatCard label="This Week" value={3} icon={<Clock className="h-5 w-5" />} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3" data-animate>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/25" />
          <Input
            placeholder="Search starred messages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25"
          />
        </div>
      </div>

      {/* List + Detail */}
      <div className="flex gap-4 min-h-[500px]">
        {/* Starred list */}
        <div className="w-full max-w-sm shrink-0 space-y-1 overflow-y-auto" data-animate>
          {filtered.length === 0 ? (
            <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardContent className="flex min-h-[300px] items-center justify-center">
                <div className="text-center text-white/30">
                  <Star className="mx-auto mb-2 size-8" />
                  <p className="text-sm">No starred messages</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedId(msg.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all hover:bg-white/4',
                  selectedId === msg.id ? 'border-indigo-500/30 bg-white/5' : 'border-white/6 bg-white/2',
                )}
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className={`text-[10px] ${msg.color}`}>{msg.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate font-medium text-white/80">{msg.from}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] text-white/30">{msg.date}</span>
                    </div>
                  </div>
                  <p className="text-xs truncate text-white/50 font-medium">{msg.subject}</p>
                  <p className="text-[10px] text-white/25 truncate">{msg.preview}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail */}
        <Card className="flex-1 border-white/6 bg-white/3 backdrop-blur-xl" data-animate>
          {selected ? (
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className={`text-xs ${selected.color}`}>{selected.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white/85">{selected.subject}</h3>
                    <p className="text-sm text-white/40">{selected.from} · {selected.date}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300" onClick={() => notifySuccess('Unstarred', 'Message removed from starred')}><Star className="size-3 fill-current" /></Button>
                  <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/70" onClick={() => notifySuccess('Archive', 'Message archived')}><Archive className="size-3" /></Button>
                  <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/70" onClick={() => notifySuccess('Delete', 'Message moved to trash')}><Trash2 className="size-3" /></Button>
                </div>
              </div>
              <Separator className="bg-white/6" />
              <div className="rounded-xl border border-white/6 bg-white/2 p-4">
                <p className="text-sm text-white/60 leading-relaxed">{selected.preview}</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">{selected.category}</Badge>
              <Separator className="bg-white/6" />
              <div className="space-y-2">
                <Textarea placeholder="Reply…" rows={3} className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:bg-white/5" onClick={() => notifySuccess('Attach', 'File picker opened')}><Paperclip className="mr-1 size-3" /> Attach</Button>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => notifySuccess('Reply', 'Reply sent successfully')}><Send className="mr-1 size-3" /> Reply</Button>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="flex min-h-[500px] items-center justify-center">
              <div className="text-center text-white/25">
                <Star className="mx-auto mb-2 size-10" />
                <p className="text-sm">Select a starred message</p>
                <p className="text-[10px] mt-1">Choose from the list on the left</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
