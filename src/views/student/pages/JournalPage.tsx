/* ─── JournalPage ─── Wellness journaling ──────────────────────────── */
import { useState } from 'react';
import {
  BookOpen, Plus, Calendar, Search, Tag,
  Heart, ChevronDown, ChevronUp, Edit3,
  Smile, Meh, Frown, Star, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';

type Mood = 'great' | 'good' | 'okay' | 'low' | 'bad';

const MOOD_CFG: Record<Mood, { Icon: typeof Smile; cls: string; label: string }> = {
  great: { Icon: Smile, cls: 'text-emerald-400', label: 'Great' },
  good:  { Icon: Smile, cls: 'text-green-400', label: 'Good' },
  okay:  { Icon: Meh, cls: 'text-amber-400', label: 'Okay' },
  low:   { Icon: Frown, cls: 'text-orange-400', label: 'Low' },
  bad:   { Icon: Frown, cls: 'text-red-400', label: 'Bad' },
};

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
  isPrivate: boolean;
  gratitude?: string[];
}

const ENTRIES: JournalEntry[] = [
  { id: '1', date: '2026-03-04', title: 'Feeling productive!', mood: 'great', content: 'Had an amazing study session today. Finally understood how recursion works in CS class. Also went for a 30-minute run in the morning which really set the tone.', tags: ['academic', 'exercise'], isPrivate: false, gratitude: ['Understanding recursion', 'Good weather for running', 'Helpful TA in office hours'] },
  { id: '2', date: '2026-03-03', title: 'Pre-exam anxiety', mood: 'low', content: 'Math exam is tomorrow and I\'m feeling overwhelmed. Tried the breathing exercises from the wellness center. They helped a bit but still nervous.', tags: ['stress', 'exams'], isPrivate: true },
  { id: '3', date: '2026-03-02', title: 'Social Sunday', mood: 'good', content: 'Spent the afternoon at the library with friends. We studied together and grabbed dinner after. Feeling grateful for my study group.', tags: ['social', 'gratitude'], isPrivate: false, gratitude: ['Study group friends', 'Library cafe open late', 'Finished homework early'] },
  { id: '4', date: '2026-03-01', title: 'Mindfulness practice', mood: 'okay', content: 'Tried a 15-min guided meditation from the resources section. Was hard to focus at first but felt calmer afterward. Want to make this a daily habit.', tags: ['mindfulness', 'growth'], isPrivate: false },
  { id: '5', date: '2026-02-28', title: 'Creative flow', mood: 'great', content: 'Art class was incredible today. We worked on watercolors and I got into a real flow state. Didn\'t even notice time passing.', tags: ['creative', 'flow'], isPrivate: false, gratitude: ['Art supplies', 'Inspiring teacher', 'Flow state experience'] },
  { id: '6', date: '2026-02-27', title: 'Tough day but managed', mood: 'low', content: 'Didn\'t sleep well. Got a B- on my English paper when I was hoping for an A. Talked to my counselor which helped me put things in perspective.', tags: ['sleep', 'grades', 'support'], isPrivate: true },
];

export default function JournalPage() {
  const containerRef = useStaggerAnimate([]);
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState<'all' | Mood>('all');
  const [showNew, setShowNew] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1']));
  const [newMood, setNewMood] = useState<Mood>('good');

  const toggle = (id: string) => setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = ENTRIES
    .filter((e) => moodFilter === 'all' || e.mood === moodFilter)
    .filter((e) => !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.content.toLowerCase().includes(search.toLowerCase()));

  const streak = 6;
  const totalEntries = ENTRIES.length;
  const avgMood = +(ENTRIES.reduce((s, e) => s + (['great', 'good', 'okay', 'low', 'bad'].indexOf(e.mood) <= 1 ? 4 : ['great', 'good', 'okay', 'low', 'bad'].indexOf(e.mood) <= 2 ? 3 : 2), 0) / ENTRIES.length).toFixed(1);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Journal" description="Reflect on your day, track emotions, and practice gratitude" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Entries" value={totalEntries} icon={<BookOpen className="h-5 w-5" />} />
        <StatCard label="Writing Streak" value={streak} suffix=" days" icon={<Star className="h-5 w-5" />} trend="up" />
        <StatCard label="Avg Mood" value={avgMood} suffix="/5" icon={<Heart className="h-5 w-5" />} decimals={1} />
        <StatCard label="This Week" value={4} icon={<Calendar className="h-5 w-5" />} />
      </div>

      {/* Toolbar */}
      <div data-animate className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', ...Object.keys(MOOD_CFG)] as const).map((m) => {
            const cfg = m !== 'all' ? MOOD_CFG[m as Mood] : null;
            return (
              <Badge
                key={m}
                onClick={() => setMoodFilter(m as typeof moodFilter)}
                className={cn(
                  'cursor-pointer text-[10px] transition-colors gap-1',
                  moodFilter === m
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                    : 'bg-white/4 text-white/40 border-white/8 hover:text-white/60',
                )}
              >
                {cfg && <cfg.Icon className="size-2.5" />}
                {m === 'all' ? 'All Moods' : cfg!.label}
              </Badge>
            );
          })}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-white/30" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries…" className="h-8 w-48 pl-7 bg-white/4 border-white/8 text-white/80 text-xs" />
          </div>
          <Button onClick={() => setShowNew(!showNew)} className="gap-1.5 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-400/20 text-xs h-8">
            <Plus className="size-3" />New Entry
          </Button>
        </div>
      </div>

      {/* New entry form */}
      {showNew && (
        <Card data-animate className="border-violet-400/20 bg-violet-500/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white/90 text-sm flex items-center gap-2"><Edit3 className="size-4 text-violet-400" />New Journal Entry</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input placeholder="Entry title…" className="bg-white/4 border-white/8 text-white/80 text-xs h-8" />
            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-white/40">Mood:</span>
              {(Object.entries(MOOD_CFG) as [Mood, typeof MOOD_CFG[Mood]][]).map(([key, cfg]) => (
                <button key={key} onClick={() => setNewMood(key)} className={cn('p-1.5 rounded-lg border transition-all', newMood === key ? 'border-violet-400/40 bg-violet-500/10' : 'border-white/6 bg-white/2')}>
                  <cfg.Icon className={cn('size-4', cfg.cls)} />
                </button>
              ))}
            </div>
            <textarea rows={4} placeholder="Write about your day…" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/80 placeholder:text-white/25 outline-none resize-none focus:border-violet-400/40" />
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40">Gratitude (comma-separated, optional)</label>
              <Input placeholder="e.g., Good weather, Helpful friend…" className="bg-white/4 border-white/8 text-white/80 text-xs h-8" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNew(false)} className="text-xs border-white/10 text-white/50">Cancel</Button>
              <Button size="sm" onClick={() => notifySuccess('Journal', 'Entry saved successfully')} className="text-xs bg-violet-500/20 text-violet-300 border border-violet-400/20 gap-1"><BookOpen className="size-3" />Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries list */}
      <div data-animate className="flex flex-col gap-3">
        {!filtered.length && (
          <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="py-10 text-center text-white/30 text-sm">No journal entries match your filters.</CardContent>
          </Card>
        )}
        {filtered.map((entry) => {
          const cfg = MOOD_CFG[entry.mood];
          const isOpen = expanded.has(entry.id);
          return (
            <Card key={entry.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-colors">
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between cursor-pointer" onClick={() => toggle(entry.id)}>
                  <div className="flex items-center gap-2">
                    <cfg.Icon className={cn('size-4 shrink-0', cfg.cls)} />
                    <div>
                      <p className="text-sm font-semibold text-white/80">{entry.title}</p>
                      <p className="text-[10px] text-white/30 flex items-center gap-1.5">
                        <Calendar className="size-2.5" />{new Date(entry.date).toLocaleDateString()}
                        {entry.isPrivate && <><Lock className="size-2.5 text-amber-400" />Private</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className={cn('border-0 text-[9px]', cfg.cls, 'bg-white/5')}>{cfg.label}</Badge>
                    {isOpen ? <ChevronUp className="size-3.5 text-white/30" /> : <ChevronDown className="size-3.5 text-white/30" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="flex flex-col gap-2 mt-1">
                    <p className="text-[11px] text-white/50 leading-relaxed">{entry.content}</p>
                    {entry.gratitude && (
                      <div className="rounded-lg border border-white/6 bg-white/2 p-2.5">
                        <p className="text-[10px] text-white/40 font-medium mb-1.5">Gratitude:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.gratitude.map((g) => (
                            <Badge key={g} className="border-0 text-[9px] bg-emerald-400/10 text-emerald-400">{g}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {entry.tags.map((t) => <Badge key={t} className="border-0 text-[9px] bg-white/5 text-white/30"><Tag className="size-2 mr-0.5" />{t}</Badge>)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
