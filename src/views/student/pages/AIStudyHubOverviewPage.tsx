/* ─── AIStudyHubOverviewPage ─── Full-page AI study hub landing ───── */
import { useState } from 'react';
import {
  Sparkles, Brain, Clock, Lightbulb, Zap,
  TrendingUp, MessageSquare, BookOpen, Target,
  ChevronRight, Star, BarChart3,
  FileText, Rocket, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess, notifyError } from '@/lib/notify';
import { useStudentSessions } from '@/hooks/api/use-student';
import { useAIChat } from '@/hooks/api/use-ai';

const FALLBACK_AI_TOOLS = [
  { id: 'ai_tutor', title: 'AI Tutor', desc: 'Ask questions and get instant, personalized explanations', icon: Brain, color: 'bg-violet-500/20 text-violet-400', sessions: 34, streak: 5 },
  { id: 'planner', title: 'Study Planner', desc: 'AI-optimized study schedules tailored to your workload', icon: Clock, color: 'bg-indigo-500/20 text-indigo-400', sessions: 12, streak: 3 },
  { id: 'visualizer', title: 'Concept Visualizer', desc: 'Turn complex topics into mind maps, flowcharts, and diagrams', icon: Lightbulb, color: 'bg-amber-500/20 text-amber-400', sessions: 8, streak: 2 },
];

const FALLBACK_RECENT_SESSIONS = [
  { tool: 'AI Tutor', topic: 'Quadratic formula derivation', time: '25 min', date: '2 h ago', rating: 5 },
  { tool: 'Study Planner', topic: 'Weekly schedule optimization', time: '10 min', date: '1 d ago', rating: 4 },
  { tool: 'AI Tutor', topic: 'Photosynthesis light reactions', time: '18 min', date: '1 d ago', rating: 5 },
  { tool: 'Concept Visualizer', topic: 'French Revolution timeline', time: '15 min', date: '2 d ago', rating: 4 },
  { tool: 'AI Tutor', topic: 'Shakespeare sonnet analysis', time: '20 min', date: '3 d ago', rating: 5 },
];

const FALLBACK_SUGGESTED_TOPICS = [
  { topic: 'Acid-Base Equilibrium', subject: 'Chemistry', reason: 'Upcoming test in 3 days' },
  { topic: 'Integration by Parts', subject: 'Calculus', reason: 'Low quiz score last week' },
  { topic: 'Hamlet Act 3 Analysis', subject: 'English', reason: 'Essay due Friday' },
  { topic: 'Newton\'s Third Law', subject: 'Physics', reason: 'Practice problems pending' },
];

const FALLBACK_WEEKLY_USAGE = [
  { day: 'Mon', minutes: 45 },
  { day: 'Tue', minutes: 30 },
  { day: 'Wed', minutes: 55 },
  { day: 'Thu', minutes: 20 },
  { day: 'Fri', minutes: 40 },
  { day: 'Sat', minutes: 15 },
  { day: 'Sun', minutes: 35 },
];

const FALLBACK_MASTERY = [
  { subject: 'Computer Science', level: 92, improvement: '+8%' },
  { subject: 'English', level: 85, improvement: '+3%' },
  { subject: 'Mathematics', level: 78, improvement: '+12%' },
  { subject: 'Chemistry', level: 70, improvement: '+5%' },
  { subject: 'History', level: 65, improvement: '+7%' },
];

export default function AIStudyHubOverviewPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [quickQuestion, setQuickQuestion] = useState('');
  const { data: apiSessions } = useStudentSessions();
  const aiChat = useAIChat();
  void apiSessions;
  const AI_TOOLS = FALLBACK_AI_TOOLS;
  const RECENT_SESSIONS = FALLBACK_RECENT_SESSIONS;
  const SUGGESTED_TOPICS = FALLBACK_SUGGESTED_TOPICS;
  const WEEKLY_USAGE = FALLBACK_WEEKLY_USAGE;
  const MASTERY = FALLBACK_MASTERY;

  const totalSessions = AI_TOOLS.reduce((s, t) => s + t.sessions, 0);
  const maxMinutes = Math.max(...WEEKLY_USAGE.map((w) => w.minutes));

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="AI Study Hub" description="Your personal AI-powered learning assistant suite" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Sessions" value={totalSessions} icon={<Sparkles className="h-5 w-5" />} trend="up" />
        <StatCard label="Study Streak" value={5} suffix=" days" icon={<Zap className="h-5 w-5" />} accentColor="#a78bfa" />
        <StatCard label="Topics Mastered" value={23} icon={<Target className="h-5 w-5" />} />
        <StatCard label="Time Saved" value={4.2} suffix="h" icon={<TrendingUp className="h-5 w-5" />} decimals={1} />
      </div>

      {/* Quick Ask bar */}
      <Card data-animate className="border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl">
        <CardContent className="p-4 flex items-center gap-3">
          <Brain className="size-6 text-indigo-400 shrink-0" />
          <Input
            placeholder="Ask me anything — math, science, history, language arts…"
            value={quickQuestion}
            onChange={(e) => setQuickQuestion(e.target.value)}
            className="flex-1 h-9 text-sm bg-white/3 border-white/8 text-white/70 placeholder:text-white/25"
          />
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1" disabled={aiChat.isPending} onClick={() => aiChat.mutate({ messages: [{ role: 'user', content: quickQuestion }] } as any, { onSuccess: () => { notifySuccess('AI Tutor', 'Response received!'); setQuickQuestion(''); }, onError: () => notifyError('AI Tutor', 'Failed to process question') })}>
            <Sparkles className="size-3" />{aiChat.isPending ? 'Thinking…' : 'Ask AI'}
          </Button>
        </CardContent>
      </Card>

      {/* AI Tools */}
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {AI_TOOLS.map((tool) => (
          <Card key={tool.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all cursor-pointer group" onClick={() => notifySuccess('AI Tool', 'Opening tool…')}>
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
              <div className={cn('size-14 rounded-2xl flex items-center justify-center', tool.color)}>
                <tool.icon className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/85">{tool.title}</p>
                <p className="text-[10px] text-white/40 mt-1">{tool.desc}</p>
              </div>
              <div className="flex items-center gap-3 text-[9px] text-white/30">
                <span className="flex items-center gap-0.5"><MessageSquare className="size-2.5" />{tool.sessions} sessions</span>
                <span className="flex items-center gap-0.5"><Zap className="size-2.5 text-amber-400" />{tool.streak} day streak</span>
              </div>
              <Button size="sm" className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); notifySuccess('AI Tool', 'Launching tool…'); }}>
                <Rocket className="size-3" />Launch
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent sessions + suggested */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Suggested topics */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Lightbulb className="size-4 text-amber-400" />Suggested for You
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {SUGGESTED_TOPICS.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/2 p-2.5 hover:border-indigo-500/20 transition-all cursor-pointer" onClick={() => notifySuccess('Activity', 'Opening recent session…')}>
                  <div className="size-8 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
                    <BookOpen className="size-3.5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-white/70 truncate">{s.topic}</p>
                    <p className="text-[8px] text-white/25">{s.subject} · {s.reason}</p>
                  </div>
                  <ChevronRight className="size-3 text-white/15 shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent sessions */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Clock className="size-4 text-indigo-400" />Recent Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {RECENT_SESSIONS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-2.5">
                  <div className="size-7 rounded-md bg-violet-500/10 flex items-center justify-center shrink-0">
                    {s.tool === 'AI Tutor' ? <Brain className="size-3 text-violet-400" /> :
                     s.tool === 'Study Planner' ? <Clock className="size-3 text-indigo-400" /> :
                     <Lightbulb className="size-3 text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/70 truncate">{s.topic}</p>
                    <p className="text-[8px] text-white/25">{s.tool} · {s.time}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: s.rating }).map((_, j) => (
                      <Star key={j} className="size-2 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[8px] text-white/20">{s.date}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Weekly usage */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <BarChart3 className="size-4 text-emerald-400" />Weekly Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-20">
                {WEEKLY_USAGE.map((w) => (
                  <div key={w.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-indigo-500/30 to-indigo-500/60"
                      style={{ height: `${(w.minutes / maxMinutes) * 100}%` }}
                    />
                    <span className="text-[7px] text-white/25">{w.day}</span>
                    <span className="text-[8px] text-white/35">{w.minutes}m</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mastery levels */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Eye className="size-4 text-violet-400" />Mastery Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {MASTERY.map((m) => (
                <div key={m.subject}>
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-white/50">{m.subject}</span>
                    <span className="text-emerald-400">{m.improvement}</span>
                  </div>
                  <Progress value={m.level} className="h-1.5 bg-white/5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick tip */}
          <Card data-animate className="border-violet-500/15 bg-violet-500/5 backdrop-blur-xl">
            <CardContent className="p-3 flex items-center gap-2.5">
              <FileText className="size-5 text-violet-400 shrink-0" />
              <div>
                <p className="text-[10px] text-violet-400 font-medium">AI Insight</p>
                <p className="text-[9px] text-violet-300/50">You learn best between 4-6 PM. Try scheduling tough subjects during that window.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
