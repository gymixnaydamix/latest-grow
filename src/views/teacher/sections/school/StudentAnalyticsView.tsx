/* ─── StudentAnalyticsView ─── Progress, at-risk, engagement ───── */
import { Search, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function StudentAnalyticsView({ subNav }: { subNav: string }) {
  if (subNav === 'individual_progress') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">Individual Student Progress</h2></div>
        <div className="flex gap-3 mb-4" data-animate>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
            <Input placeholder="Search student…" className="pl-9 border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
          </div>
        </div>
        <div className="space-y-2" data-animate>
          {[
            { name: 'Alice Chen', grade: 'A', trend: 'up', gp: 3.9 },
            { name: 'Bob Williams', grade: 'B', trend: 'stable', gp: 3.0 },
            { name: 'Carol Davis', grade: 'A+', trend: 'up', gp: 4.0 },
            { name: 'David Kim', grade: 'D', trend: 'down', gp: 1.3 },
          ].map((s) => (
            <div key={s.name} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-8 border border-white/10"><AvatarFallback className="text-[10px] bg-indigo-500/10 text-indigo-400">{s.name.split(' ').map(w => w[0]).join('')}</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm font-medium text-white/80">{s.name}</p>
                  <p className="text-xs text-white/40">Current: {s.grade} · GPA {s.gp}</p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${s.trend === 'up' ? 'border-emerald-500/30 text-emerald-400' : s.trend === 'down' ? 'border-rose-500/30 text-rose-400' : 'border-white/10 text-white/40'}`}>{s.trend}</Badge>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (subNav === 'at_risk_students') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">At-Risk Students</h2></div>
        <div className="space-y-2" data-animate>
          {[
            { name: 'David Kim', reason: 'Grade below 65% — declining trend', risk: 'high' },
            { name: 'Frank Lee', reason: '4 absences this month', risk: 'medium' },
            { name: 'Jenny Park', reason: 'Missing 3 assignments', risk: 'medium' },
          ].map((s) => (
            <div key={s.name} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-4 border-l-4 border-l-rose-500/40 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/85">{s.name}</p>
                <p className="text-xs text-white/40">{s.reason}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] ${s.risk === 'high' ? 'border-rose-500/30 text-rose-400' : 'border-amber-500/30 text-amber-400'}`}>{s.risk} risk</Badge>
                <Button size="sm" className="border border-white/10 bg-transparent text-white/60 hover:bg-white/5"><Send className="mr-1 size-3" /> Alert</Button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (subNav === 'engagement_metrics') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">Engagement Metrics</h2></div>
        <div className="grid gap-4 sm:grid-cols-4" data-animate>
          {[
            { label: 'Assignment Completion', value: '89%', color: 'text-emerald-400' },
            { label: 'Avg Time on Task', value: '45 min', color: 'text-blue-400' },
            { label: 'Discussion Posts', value: '156', color: 'text-violet-400' },
            { label: 'Resource Views', value: '424', color: 'text-amber-400' },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 text-center">
              <p className="text-xs text-white/40">{m.label}</p>
              <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Default: class_performance
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold text-white/90">Class Performance</h2></div>
      <div className="space-y-3" data-animate>
        {[
          { class: 'Algebra II', avg: 84, highest: 98, lowest: 52, from: 'from-indigo-500', to: 'to-violet-600' },
          { class: 'AP Calculus', avg: 88, highest: 100, lowest: 65, from: 'from-emerald-500', to: 'to-teal-600' },
          { class: 'Geometry', avg: 82, highest: 96, lowest: 48, from: 'from-amber-500', to: 'to-orange-600' },
          { class: 'Statistics', avg: 78, highest: 94, lowest: 55, from: 'from-rose-500', to: 'to-pink-600' },
        ].map((c) => (
          <div key={c.class} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white/85">{c.class}</p>
              <span className="text-sm font-bold text-indigo-400">{c.avg}% avg</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-white/5">
              <div className={`h-full rounded-full bg-gradient-to-r ${c.from} ${c.to}`} style={{ width: `${c.avg}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-white/30">
              <span>Low: {c.lowest}%</span>
              <span>High: {c.highest}%</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
