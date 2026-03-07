/* ─── ProductivityOverviewPage ─── Header-level overview for Productivity tools ── */
import {
  Timer, GitBranch, Quote, Zap,
  Clock, Target, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifySuccess } from '@/lib/notify';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { useStudentFocusSessions } from '@/hooks/api/use-student';

const FALLBACK_TOOLS = [
  {
    title: 'Focus Timer',
    desc: 'Pomodoro-style focus sessions to maximize study productivity',
    icon: Timer,
    color: 'bg-indigo-500/20 text-indigo-400',
    stats: { sessions: 24, totalHours: '18h', streak: '5 days' },
    lastUsed: '2 hours ago',
  },
  {
    title: 'Mind Mapper',
    desc: 'Visual brainstorming and thought organization for complex topics',
    icon: GitBranch,
    color: 'bg-violet-500/20 text-violet-400',
    stats: { sessions: 8, totalHours: '12h', streak: '3 days' },
    lastUsed: '1 day ago',
  },
  {
    title: 'Citation Generator',
    desc: 'Auto-format citations in APA, MLA, and Chicago styles',
    icon: Quote,
    color: 'bg-cyan-500/20 text-cyan-400',
    stats: { sessions: 15, totalHours: '4h', streak: '2 days' },
    lastUsed: '3 days ago',
  },
];

const FALLBACK_WEEKLY_ACTIVITY = [
  { day: 'Mon', focus: 45, mindMap: 20, citations: 10 },
  { day: 'Tue', focus: 60, mindMap: 0, citations: 15 },
  { day: 'Wed', focus: 30, mindMap: 30, citations: 0 },
  { day: 'Thu', focus: 75, mindMap: 15, citations: 20 },
  { day: 'Fri', focus: 50, mindMap: 25, citations: 5 },
  { day: 'Sat', focus: 20, mindMap: 0, citations: 0 },
  { day: 'Sun', focus: 40, mindMap: 10, citations: 0 },
];

const FALLBACK_ACHIEVEMENTS = [
  { title: 'Focus Master', desc: '100 focus sessions completed', earned: true, icon: Timer, color: 'text-indigo-400' },
  { title: 'Mind Architect', desc: 'Create 10 mind maps', earned: true, icon: GitBranch, color: 'text-violet-400' },
  { title: 'Citation Pro', desc: '50 citations generated', earned: false, icon: Quote, color: 'text-cyan-400' },
  { title: 'Streak Champion', desc: '7-day consecutive streak', earned: false, icon: Zap, color: 'text-amber-400' },
];

export default function ProductivityOverviewPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const { data: apiFocusSessions } = useStudentFocusSessions();
  void apiFocusSessions;
  const TOOLS = FALLBACK_TOOLS;
  const WEEKLY_ACTIVITY = FALLBACK_WEEKLY_ACTIVITY;
  const ACHIEVEMENTS = FALLBACK_ACHIEVEMENTS;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Productivity Tools" description="Boost your study efficiency with focused tools" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Focus Sessions" value={24} icon={<Timer className="h-5 w-5" />} trend="up" trendLabel="+8 this week" />
        <StatCard label="Total Focus Time" value={18} suffix="h" icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Maps Created" value={8} icon={<GitBranch className="h-5 w-5" />} />
        <StatCard label="Productivity Score" value={87} suffix="%" icon={<Target className="h-5 w-5" />} trend="up" />
      </div>

      {/* Tool cards */}
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {TOOLS.map((tool) => (
          <Card key={tool.title} className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 hover:bg-white/5 transition-all cursor-pointer group" onClick={() => notifySuccess('Tool', 'Opening productivity tool…')}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`flex size-12 items-center justify-center rounded-xl ${tool.color} shrink-0 transition-transform group-hover:scale-110`}>
                  <tool.icon className="size-6" />
                </div>
                <ChevronRight className="size-4 text-white/15 group-hover:text-white/40 transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-white/85 mt-3">{tool.title}</h3>
              <p className="text-xs text-white/40 mt-1">{tool.desc}</p>
              <div className="flex items-center gap-3 mt-3 text-[10px] text-white/30">
                <span>{tool.stats.sessions} sessions</span>
                <span>·</span>
                <span>{tool.stats.totalHours} total</span>
                <span>·</span>
                <span>{tool.stats.streak} streak</span>
              </div>
              <p className="text-[10px] text-white/20 mt-1">Last used: {tool.lastUsed}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly activity */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/85">Weekly Activity (minutes)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {WEEKLY_ACTIVITY.map((d) => {
              const total = d.focus + d.mindMap + d.citations;
              return (
                <div key={d.day} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/50 w-8">{d.day}</span>
                    <span className="text-white/30">{total} min</span>
                  </div>
                  <div className="flex h-2 gap-0.5 rounded-full overflow-hidden bg-white/5">
                    {d.focus > 0 && <div className="bg-indigo-500 rounded-full" style={{ width: `${(d.focus / 120) * 100}%` }} />}
                    {d.mindMap > 0 && <div className="bg-violet-500 rounded-full" style={{ width: `${(d.mindMap / 120) * 100}%` }} />}
                    {d.citations > 0 && <div className="bg-cyan-500 rounded-full" style={{ width: `${(d.citations / 120) * 100}%` }} />}
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-4 mt-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-indigo-500" /> Focus</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-violet-500" /> Mind Map</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-cyan-500" /> Citations</span>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/85">Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ACHIEVEMENTS.map((ach) => (
              <div key={ach.title} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-3">
                <div className={`flex size-8 items-center justify-center rounded-lg ${ach.earned ? 'bg-indigo-500/10' : 'bg-white/5'}`}>
                  <ach.icon className={`size-4 ${ach.earned ? ach.color : 'text-white/20'}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${ach.earned ? 'text-white/70' : 'text-white/35'}`}>{ach.title}</p>
                  <p className="text-[10px] text-white/25">{ach.desc}</p>
                </div>
                {ach.earned ? (
                  <Badge className="text-[9px] border-0 bg-emerald-500/10 text-emerald-400">Earned</Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] border-white/10 text-white/25">Locked</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
