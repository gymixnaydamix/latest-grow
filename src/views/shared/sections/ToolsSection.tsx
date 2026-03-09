/* ─── ToolsSection ─── Shared productivity / skill-lab views ─────── */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Wrench, Timer, GitBranch, Quote, MessageCircle,
  FlaskConical, Glasses,
  Play, Pause, RotateCcw, Lightbulb, Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { usePlatformConfigs } from '@/hooks/api/use-settings';

/* ── SubNav → Route mapping (student-specific split pages) ── */
const STUDENT_SUB_NAV_ROUTES: Record<string, string> = {
  focus_timer: '/student/focus-timer',
  mind_mapper: '/student/mind-mapper',
  citation_generator: '/student/citation-generator',
  debate_simulator: '/student/debate-simulator',
  virtual_labs: '/student/virtual-labs',
  ar_lab: '/student/ar-lab',
  finance_sim: '/student/finance-sim',
};

/* ── Header → Overview-page route mapping (student-specific) ── */
const STUDENT_HEADER_ROUTES: Record<string, string> = {
  productivity: '/student/productivity-overview',
  skill_labs: '/student/skill-labs-overview',
};

/* ── Main Export ───────────────────────────────────────────────── */
export function ToolsSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);
  const role = useAuthStore((s) => s.user?.role);
  const navigate = useNavigate();

  // Student-specific: navigate to split pages when subnav/header selected
  useEffect(() => {
    if (role !== 'STUDENT') return;
    if (activeSubNav && STUDENT_SUB_NAV_ROUTES[activeSubNav]) {
      navigate(STUDENT_SUB_NAV_ROUTES[activeSubNav]);
    } else if (activeHeader && STUDENT_HEADER_ROUTES[activeHeader]) {
      navigate(STUDENT_HEADER_ROUTES[activeHeader]);
    }
  }, [activeSubNav, activeHeader, navigate, role]);

  const view = (() => {
    switch (activeHeader) {
      case 'overview':
      case 'tools_overview': return <ToolsOverview />;
      case 'productivity': return <ProductivityView subNav={activeSubNav} />;
      case 'skill_labs': return <SkillLabsView subNav={activeSubNav} />;
      default: return <ToolsOverview />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── Overview ──────────────────────────────────────────────────── */

function ToolsOverview() {
  const { data: platformConfigsData } = usePlatformConfigs();
  const configs = (platformConfigsData as any);

  const overviewStats = [
    { label: 'Focus Sessions', value: String(configs?.focusSessions ?? 0), desc: 'This week', icon: Timer, color: 'bg-indigo-500/10 text-indigo-400' },
    { label: 'Mind Maps', value: String(configs?.mindMaps ?? 0), desc: 'Created', icon: GitBranch, color: 'bg-violet-500/10 text-violet-400' },
    { label: 'Lab Experiments', value: String(configs?.labExperiments ?? 0), desc: 'Completed', icon: FlaskConical, color: 'bg-emerald-500/10 text-emerald-400' },
    { label: 'Skill Points', value: String(configs?.skillPoints ?? 0), desc: 'Earned', icon: Zap, color: 'bg-amber-500/10 text-amber-400' },
  ];

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Tools &amp; Labs</h2>
        <p className="text-sm text-white/40">Productivity tools and interactive skill-building labs</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        {overviewStats.map((m) => (
          <div key={m.label} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-4 flex items-center gap-3">
            <div className={`flex size-9 items-center justify-center rounded-lg ${m.color}`}>
              <m.icon className="size-4" />
            </div>
            <div>
              <p className="text-xs text-white/40">{m.label}</p>
              <p className="text-lg font-bold text-white/90">{m.value}</p>
              <p className="text-[10px] text-white/30">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2" data-animate>
        <div className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
          <h3 className="text-sm font-semibold text-white/85 mb-3">Quick Access — Productivity</h3>
          <div className="space-y-2">
            {['Focus Timer', 'Mind Mapper', 'Citation Generator'].map((t) => (
              <div key={t} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3 cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors">
                <span className="text-sm text-white/70">{t}</span>
                <Wrench className="size-4 text-white/30" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
          <h3 className="text-sm font-semibold text-white/85 mb-3">Quick Access — Skill Labs</h3>
          <div className="space-y-2">
            {['Debate Simulator', 'Virtual Labs', 'AR Lab', 'Finance Sim'].map((t) => (
              <div key={t} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3 cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors">
                <span className="text-sm text-white/70">{t}</span>
                <FlaskConical className="size-4 text-white/30" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Productivity ──────────────────────────────────────────────── */

function ProductivityView({ subNav }: { subNav: string }) {
  switch (subNav) {
    case 'focus_timer': return <FocusTimerView />;
    case 'mind_mapper': return <MindMapperView />;
    case 'citation_generator': return <CitationGeneratorView />;
    default: return <FocusTimerView />;
  }
}

function FocusTimerView() {
  const [running, setRunning] = useState(false);
  const [minutes] = useState(25);

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Focus Timer</h2>
        <p className="text-sm text-white/40">Pomodoro-style focus sessions</p>
      </div>

      <div data-animate className="max-w-md mx-auto rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-6 py-8 px-6">
          <div className="relative flex size-40 items-center justify-center rounded-full border-4 border-indigo-500/20 bg-indigo-500/5">
            <span className="text-3xl font-bold text-white/90">{minutes}:00</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className={running ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'} onClick={() => setRunning(!running)}>
              {running ? <><Pause className="mr-1 size-3" /> Pause</> : <><Play className="mr-1 size-3" /> Start</>}
            </Button>
            <Button size="sm" className="border border-white/10 bg-transparent text-white/60 hover:bg-white/5"><RotateCcw className="mr-1 size-3" /> Reset</Button>
          </div>
          <div className="flex gap-6 text-center text-xs text-white/40">
            <div><p className="text-lg font-bold text-white/90">12</p>Sessions today</div>
            <div><p className="text-lg font-bold text-white/90">5h</p>Total focus</div>
            <div><p className="text-lg font-bold text-white/90">94%</p>Completion</div>
          </div>
        </div>
      </div>
    </>
  );
}

function MindMapperView() {
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Mind Mapper</h2>
        <p className="text-sm text-white/40">Visual thought organization and brainstorming</p>
      </div>

      <div className="flex gap-2" data-animate>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white"><Lightbulb className="mr-1 size-3" /> New Map</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
        {[
          { title: 'Biology Chapter 5', nodes: 24, updated: '2h ago' },
          { title: 'History Essay Outline', nodes: 18, updated: '1d ago' },
          { title: 'Project Brainstorm', nodes: 32, updated: '3d ago' },
          { title: 'Study Plan — Finals', nodes: 15, updated: '5d ago' },
        ].map((m) => (
          <div key={m.title} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10">
                <GitBranch className="size-4 text-violet-400" />
              </div>
              <p className="text-sm font-semibold text-white/85">{m.title}</p>
            </div>
            <p className="text-xs text-white/40 mt-2">{m.nodes} nodes · Updated {m.updated}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function CitationGeneratorView() {
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Citation Generator</h2>
        <p className="text-sm text-white/40">Auto-format citations in APA, MLA, Chicago styles</p>
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Source URL or Title</label>
          <Input placeholder="Paste a URL or enter a title…" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
        </div>
        <div className="flex gap-2">
          {['APA 7', 'MLA 9', 'Chicago'].map((s) => (
            <Badge key={s} variant="outline" className="cursor-pointer border-white/10 text-white/60 hover:bg-white/5">{s}</Badge>
          ))}
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white"><Quote className="mr-1 size-3" /> Generate Citation</Button>
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
        <h3 className="text-sm font-semibold text-white/85 mb-3">Recent Citations</h3>
        <div className="space-y-2">
          {[
            { title: 'The Impact of AI on Education', style: 'APA 7', date: 'May 14' },
            { title: 'Modern Teaching Methods', style: 'MLA 9', date: 'May 13' },
            { title: 'Educational Psychology Textbook', style: 'Chicago', date: 'May 11' },
          ].map((c) => (
            <div key={c.title} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3">
              <div className="flex items-center gap-2">
                <Quote className="size-3 text-white/30" />
                <span className="text-sm text-white/70">{c.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400">{c.style}</Badge>
                <span className="text-xs text-white/30">{c.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Skill Labs ────────────────────────────────────────────────── */

function SkillLabsView({ subNav }: { subNav: string }) {
  switch (subNav) {
    case 'debate_simulator': return <DebateSimView />;
    case 'virtual_labs': return <VirtualLabsView />;
    case 'ar_lab': return <ARLabView />;
    case 'finance_sim': return <FinanceSimView />;
    default: return <DebateSimView />;
  }
}

function DebateSimView() {
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Debate Simulator</h2>
        <p className="text-sm text-white/40">AI-powered debate practice with real-time feedback</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2" data-animate>
        <div className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-6 text-center cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors">
          <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-500/10 mx-auto">
            <MessageCircle className="size-6 text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-white/85 mt-3">Start New Debate</p>
          <p className="text-xs text-white/40 mt-1">Choose a topic and position</p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
          <p className="text-sm font-semibold text-white/85">Recent Sessions</p>
          <div className="mt-3 space-y-2">
            {[
              { topic: 'Universal Basic Income', score: 82 },
              { topic: 'Space Exploration Funding', score: 76 },
              { topic: 'Renewable Energy Mandates', score: 91 },
            ].map((s) => (
              <div key={s.topic} className="flex items-center justify-between text-sm rounded-xl border border-white/6 bg-white/2 p-2.5">
                <span className="text-white/60">{s.topic}</span>
                <Badge variant="outline" className={`text-[10px] ${s.score >= 90 ? 'border-emerald-500/30 text-emerald-400' : s.score >= 80 ? 'border-blue-500/30 text-blue-400' : 'border-amber-500/30 text-amber-400'}`}>{s.score}%</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function VirtualLabsView() {
  const diffColor: Record<string, string> = { Easy: 'border-emerald-500/30 text-emerald-400', Medium: 'border-amber-500/30 text-amber-400', Hard: 'border-rose-500/30 text-rose-400' };
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Virtual Labs</h2>
        <p className="text-sm text-white/40">Interactive science experiments in a virtual environment</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
        {[
          { title: 'Chemistry — Titration', difficulty: 'Medium', time: '30 min', completed: true },
          { title: 'Physics — Projectile Motion', difficulty: 'Easy', time: '20 min', completed: true },
          { title: 'Biology — Cell Division', difficulty: 'Hard', time: '45 min', completed: false },
          { title: 'Chemistry — Electrochemistry', difficulty: 'Hard', time: '40 min', completed: false },
          { title: 'Physics — Circuits', difficulty: 'Medium', time: '25 min', completed: false },
          { title: 'Biology — Ecosystem Sim', difficulty: 'Medium', time: '35 min', completed: true },
        ].map((lab) => (
          <div key={lab.title} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <FlaskConical className="size-4 text-emerald-400" />
              </div>
              {lab.completed && <Badge className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-400">Done</Badge>}
            </div>
            <p className="text-sm font-semibold text-white/85 mt-2">{lab.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`text-[10px] ${diffColor[lab.difficulty] ?? 'border-white/10 text-white/40'}`}>{lab.difficulty}</Badge>
              <span className="text-xs text-white/30">{lab.time}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ARLabView() {
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">AR Lab</h2>
        <p className="text-sm text-white/40">Augmented reality learning experiences</p>
      </div>
      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-5 py-8 px-6">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-cyan-500/10">
            <Glasses className="size-8 text-cyan-400" />
          </div>
          <h3 className="text-base font-semibold text-white/90">Augmented Reality Lab</h3>
          <p className="text-sm text-white/40 text-center max-w-md">
            Point your device camera at supported markers to interact with 3D models, dissections, and molecular structures.
          </p>
          <div className="grid gap-3 sm:grid-cols-3 w-full max-w-lg">
            {['3D Molecule Viewer', 'Anatomy Explorer', 'Geology Layers'].map((t) => (
              <div key={t} className="rounded-xl border border-white/6 bg-white/2 p-3 text-center text-sm text-white/70 hover:bg-white/4 hover:border-white/12 cursor-pointer transition-colors">
                {t}
              </div>
            ))}
          </div>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white"><Play className="mr-1 size-3" /> Launch AR Mode</Button>
        </div>
      </div>
    </>
  );
}

function FinanceSimView() {
  const FALLBACK_SIM_METRICS = [
    { label: 'Portfolio Value', value: '$10,450', change: '+4.5%', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Budget Remaining', value: '$1,320', change: '44% left', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Credit Score', value: '742', change: '+12 pts', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const FALLBACK_MODULES = [
    { title: 'Stock Market Basics', progress: 85, from: 'from-indigo-500', to: 'to-violet-600' },
    { title: 'Creating a Budget', progress: 100, from: 'from-emerald-500', to: 'to-teal-600' },
    { title: 'Understanding Loans', progress: 60, from: 'from-amber-500', to: 'to-orange-600' },
    { title: 'Investment Portfolio', progress: 40, from: 'from-rose-500', to: 'to-pink-600' },
  ];

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Finance Simulator</h2>
        <p className="text-sm text-white/40">Learn investing, budgeting, and financial literacy</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {FALLBACK_SIM_METRICS.map((m) => (
          <div key={m.label} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 text-center">
            <p className="text-xs text-white/40">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            <p className="text-xs text-white/30">{m.change}</p>
          </div>
        ))}
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
        <h3 className="text-sm font-semibold text-white/85 mb-4">Simulation Modules</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {FALLBACK_MODULES.map((mod) => (
            <div key={mod.title} className="space-y-1.5 rounded-xl border border-white/6 bg-white/2 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">{mod.title}</span>
                <span className="text-xs font-medium text-indigo-400">{mod.progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5">
                <div className={`h-full rounded-full bg-gradient-to-r ${mod.from} ${mod.to}`} style={{ width: `${mod.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
