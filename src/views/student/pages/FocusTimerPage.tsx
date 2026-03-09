/* ─── FocusTimerPage ─── Full-page Pomodoro focus timer ────────────── */
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, RotateCcw, Timer, Coffee, Zap,
  TrendingUp, Clock, BarChart3, Volume2, VolumeX,
  Plus, Minus, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { useStudentFocusSessions, useCreateFocusSession } from '@/hooks/api/use-student';

type TimerMode = 'focus' | 'short_break' | 'long_break';

const MODE_CFG: Record<TimerMode, { label: string; defaultMins: number; color: string; icon: typeof Timer }> = {
  focus:       { label: 'Focus', defaultMins: 25, color: 'text-indigo-400', icon: Zap },
  short_break: { label: 'Short Break', defaultMins: 5, color: 'text-emerald-400', icon: Coffee },
  long_break:  { label: 'Long Break', defaultMins: 15, color: 'text-violet-400', icon: Coffee },
};

const TASKS = [
  { id: '1', title: 'Chemistry Chapter 12 Notes', pomos: 2, done: false },
  { id: '2', title: 'Math Problem Set #9', pomos: 3, done: false },
  { id: '3', title: 'History Essay — Outline', pomos: 1, done: true },
  { id: '4', title: 'English Reading Response', pomos: 2, done: false },
];

const HISTORY = [
  { date: '2026-03-04', sessions: 4, totalMinutes: 100 },
  { date: '2026-03-03', sessions: 6, totalMinutes: 150 },
  { date: '2026-03-02', sessions: 3, totalMinutes: 75 },
  { date: '2026-03-01', sessions: 5, totalMinutes: 125 },
  { date: '2026-02-28', sessions: 4, totalMinutes: 100 },
  { date: '2026-02-27', sessions: 2, totalMinutes: 50 },
  { date: '2026-02-26', sessions: 7, totalMinutes: 175 },
];

export default function FocusTimerPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [sessionsToday, setSessionsToday] = useState(4);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  /* ── API data ── */
  const { data: _apiFocus } = useStudentFocusSessions();
  const createFocusMut = useCreateFocusSession();
  const focusSessions = (_apiFocus as any[]) ?? [];

  const switchMode = useCallback((m: TimerMode) => {
    setMode(m);
    const secs = MODE_CFG[m].defaultMins * 60;
    setDuration(secs);
    setRemaining(secs);
    setRunning(false);
  }, []);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => setRemaining((r) => r - 1), 1000);
    } else if (remaining === 0 && running) {
      setRunning(false);
      if (mode === 'focus') setSessionsToday((s) => s + 1);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, remaining, mode]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;
  const focusHistory = focusSessions.length > 0 ? focusSessions : HISTORY;
  const totalSessions = focusHistory.reduce((s: number, h: any) => s + (h.sessions ?? 0), 0);
  const totalHours = +(focusHistory.reduce((s: number, h: any) => s + (h.totalMinutes ?? 0), 0) / 60).toFixed(1);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Focus Timer" description="Pomodoro-style focus sessions to boost productivity" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Today's Sessions" value={sessionsToday} icon={<Timer className="h-5 w-5" />} />
        <StatCard label="Week Total" value={totalSessions} icon={<BarChart3 className="h-5 w-5" />} trend="up" />
        <StatCard label="Hours Focused" value={totalHours} icon={<Clock className="h-5 w-5" />} decimals={1} />
        <StatCard label="Best Day" value={focusHistory.length > 0 ? Math.max(...focusHistory.map((h: any) => h.sessions ?? 0)) : 0} suffix=" sessions" icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Timer */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl lg:col-span-2">
          <CardContent className="flex flex-col items-center gap-6 py-8">
            {/* Mode tabs */}
            <div className="flex gap-2">
              {(Object.entries(MODE_CFG) as [TimerMode, typeof MODE_CFG[TimerMode]][]).map(([key, cfg]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={mode === key ? 'default' : 'outline'}
                  onClick={() => switchMode(key)}
                  className={cn('text-xs gap-1.5', mode !== key && 'border-white/10 text-white/50')}
                >
                  <cfg.icon className="size-3" />{cfg.label}
                </Button>
              ))}
            </div>

            {/* Clock display */}
            <div className="relative flex size-52 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle
                  cx="100" cy="100" r="90" fill="none"
                  stroke={mode === 'focus' ? 'rgba(99,102,241,0.6)' : mode === 'short_break' ? 'rgba(52,211,153,0.6)' : 'rgba(139,92,246,0.6)'}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 90}
                  strokeDashoffset={2 * Math.PI * 90 * (1 - pct / 100)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="text-center">
                <span className="text-5xl font-bold text-white/90 tabular-nums">
                  {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </span>
                <p className={cn('text-xs mt-1', MODE_CFG[mode].color)}>{MODE_CFG[mode].label}</p>
              </div>
            </div>

            {/* Adjust duration */}
            {!running && (
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" className="size-7 p-0 border-white/10 text-white/50" onClick={() => { const n = Math.max(60, remaining - 300); setRemaining(n); setDuration(n); }}>
                  <Minus className="size-3" />
                </Button>
                <span className="text-xs text-white/40 w-16 text-center">{Math.floor(duration / 60)} min</span>
                <Button size="sm" variant="outline" className="size-7 p-0 border-white/10 text-white/50" onClick={() => { const n = remaining + 300; setRemaining(n); setDuration(n); }}>
                  <Plus className="size-3" />
                </Button>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setRunning(!running)}
                className={cn('gap-2 px-6', running ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white')}
              >
                {running ? <><Pause className="size-4" />Pause</> : <><Play className="size-4" />Start</>}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setRemaining(duration); setRunning(false); }} className="border-white/10 text-white/50">
                <RotateCcw className="size-3.5 mr-1" />Reset
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSoundOn(!soundOn)} className="border-white/10 text-white/50">
                {soundOn ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
              </Button>
            </div>

            {/* Progress */}
            <Progress value={pct} className="h-1.5 w-64 bg-white/5" />
          </CardContent>
        </Card>

        {/* Task list */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white/90 text-sm">Focus Tasks</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {TASKS.map((t) => (
              <div key={t.id} className={cn('flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/2 p-2.5 transition-colors', t.done && 'opacity-50')}>
                <CheckCircle2 className={cn('size-4 shrink-0', t.done ? 'text-emerald-400' : 'text-white/15')} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs text-white/70 truncate', t.done && 'line-through')}>{t.title}</p>
                  <p className="text-[9px] text-white/30">{t.pomos} pomodoro{t.pomos > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" className="text-xs border-white/8 text-white/40 gap-1 w-full mt-1" onClick={() => createFocusMut.mutate({} as any, { onSuccess: () => notifySuccess('Task', 'New task added to focus session') })}>
              <Plus className="size-3" />Add Task
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader><CardTitle className="text-white/90 text-sm">Recent Focus Sessions</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-28">
            {focusHistory.map((h: any) => (
              <div key={h.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-indigo-500/30 to-indigo-500/60"
                  style={{ height: `${(h.sessions / 7) * 100}%` }}
                />
                <span className="text-[8px] text-white/30">{new Date(h.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <span className="text-[9px] text-white/40 font-medium">{h.sessions}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
