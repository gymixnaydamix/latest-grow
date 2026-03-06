/* ─── SkillLabsOverviewPage ─── Header-level overview for Skill Labs ── */
import {
  FlaskConical, MessageCircle, Glasses, DollarSign,
  Zap, Clock,
  ChevronRight, Star,
} from 'lucide-react';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';

const LABS = [
  {
    title: 'Debate Simulator',
    desc: 'AI-powered debate practice with real-time feedback and scoring',
    icon: MessageCircle,
    color: 'bg-indigo-500/20 text-indigo-400',
    progress: 72,
    sessions: 15,
    bestScore: 91,
    lastUsed: '1 day ago',
  },
  {
    title: 'Virtual Labs',
    desc: 'Interactive science experiments in a safe virtual environment',
    icon: FlaskConical,
    color: 'bg-emerald-500/20 text-emerald-400',
    progress: 50,
    sessions: 12,
    bestScore: 95,
    lastUsed: '2 days ago',
  },
  {
    title: 'AR Lab',
    desc: 'Augmented reality 3D models and molecular structures',
    icon: Glasses,
    color: 'bg-cyan-500/20 text-cyan-400',
    progress: 35,
    sessions: 6,
    bestScore: 88,
    lastUsed: '5 days ago',
  },
  {
    title: 'Finance Simulator',
    desc: 'Learn investing, budgeting, and financial literacy',
    icon: DollarSign,
    color: 'bg-amber-500/20 text-amber-400',
    progress: 60,
    sessions: 10,
    bestScore: 82,
    lastUsed: '3 days ago',
  },
];

const SKILL_POINTS = [
  { skill: 'Critical Thinking', points: 340, max: 500, color: 'from-indigo-500 to-violet-600' },
  { skill: 'Scientific Method', points: 280, max: 500, color: 'from-emerald-500 to-teal-600' },
  { skill: 'Public Speaking', points: 210, max: 500, color: 'from-amber-500 to-orange-600' },
  { skill: 'Financial Literacy', points: 180, max: 500, color: 'from-cyan-500 to-blue-600' },
  { skill: 'Spatial Reasoning', points: 150, max: 500, color: 'from-rose-500 to-pink-600' },
];

const RECENT_RESULTS = [
  { lab: 'Debate Simulator', topic: 'Universal Basic Income', score: 91, date: 'May 14' },
  { lab: 'Virtual Labs', topic: 'Titration Experiment', score: 95, date: 'May 12' },
  { lab: 'Finance Sim', topic: 'Stock Market Basics', score: 85, date: 'May 11' },
  { lab: 'AR Lab', topic: '3D Molecule Viewer', score: 88, date: 'May 9' },
];

export default function SkillLabsOverviewPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Skill Labs" description="Interactive labs for real-world skill building" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Labs Completed" value={12} icon={<FlaskConical className="h-5 w-5" />} />
        <StatCard label="Skill Points" value={1160} icon={<Zap className="h-5 w-5" />} trend="up" trendLabel="+120 this week" />
        <StatCard label="Best Score" value={95} suffix="%" icon={<Star className="h-5 w-5" />} />
        <StatCard label="Total Sessions" value={43} icon={<Clock className="h-5 w-5" />} />
      </div>

      {/* Lab cards */}
      <div className="grid gap-4 sm:grid-cols-2" data-animate>
        {LABS.map((lab) => (
          <Card key={lab.title} className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 hover:bg-white/5 transition-all cursor-pointer group" onClick={() => notifySuccess('Skill Lab', 'Opening skill lab…')}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`flex size-11 items-center justify-center rounded-xl ${lab.color} shrink-0 transition-transform group-hover:scale-110`}>
                    <lab.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white/85">{lab.title}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{lab.desc}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-white/15 group-hover:text-white/40 transition-colors shrink-0" />
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40">Progress</span>
                  <span className="text-indigo-400 font-medium">{lab.progress}%</span>
                </div>
                <Progress value={lab.progress} className="h-1.5 bg-white/5" />
              </div>
              <div className="flex items-center gap-3 mt-3 text-[10px] text-white/30">
                <span>{lab.sessions} sessions</span>
                <span>·</span>
                <span>Best: {lab.bestScore}%</span>
                <span>·</span>
                <span>Last: {lab.lastUsed}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill points */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/85">Skill Points Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SKILL_POINTS.map((s) => (
              <div key={s.skill} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">{s.skill}</span>
                  <span className="text-white/40 font-medium">{s.points} / {s.max}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5">
                  <div className={`h-full rounded-full bg-gradient-to-r ${s.color}`} style={{ width: `${(s.points / s.max) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 text-center">
              <p className="text-xs text-white/35">Total: <span className="text-indigo-400 font-semibold">1,160</span> / 2,500 skill points</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent results */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/85">Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RECENT_RESULTS.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 p-3">
                <div>
                  <p className="text-xs font-medium text-white/70">{r.topic}</p>
                  <p className="text-[10px] text-white/30">{r.lab} · {r.date}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    r.score >= 90 ? 'border-emerald-500/30 text-emerald-400'
                      : r.score >= 80 ? 'border-blue-500/30 text-blue-400'
                        : 'border-amber-500/30 text-amber-400'
                  }`}
                >
                  {r.score}%
                </Badge>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs border-white/10 text-white/40 hover:bg-white/5" onClick={() => notifySuccess('Results', 'Loading all skill lab results…')}>
                View All Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
