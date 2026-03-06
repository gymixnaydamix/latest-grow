/* ─── LessonPlannerView ─── Calendar, plans, standards ─────────── */
import { Plus, Edit, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LessonPlannerView({ subNav }: { subNav: string }) {
  if (subNav === 'create_plan') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">Create Lesson Plan</h2></div>
        <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">Title</label>
              <Input placeholder="Lesson title…" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60">Class</label>
              <Input placeholder="Select class…" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">Learning Objectives</label>
            <Input placeholder="Students will be able to…" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">Activities &amp; Materials</label>
            <Input placeholder="Describe lesson activities…" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">Save Plan</Button>
            <Button size="sm" className="border border-white/10 bg-transparent text-white/60 hover:bg-white/5"><Sparkles className="mr-1 size-3" /> AI Generate</Button>
          </div>
        </div>
      </>
    );
  }

  if (subNav === 'my_plans') {
    return (
      <>
        <div className="flex items-center justify-between" data-animate>
          <h2 className="text-lg font-semibold text-white/90">My Lesson Plans</h2>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white"><Plus className="mr-1 size-3" /> New Plan</Button>
        </div>
        <div className="space-y-2" data-animate>
          {[
            { title: 'Quadratic Equations', class: 'Algebra II', date: 'May 15', status: 'ready' },
            { title: 'Derivatives Introduction', class: 'AP Calculus', date: 'May 16', status: 'draft' },
            { title: 'Triangle Proofs', class: 'Geometry', date: 'May 17', status: 'ready' },
            { title: 'Normal Distribution', class: 'Statistics', date: 'May 18', status: 'draft' },
          ].map((p) => (
            <div key={p.title} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/85">{p.title}</p>
                <p className="text-xs text-white/40">{p.class} · {p.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] ${p.status === 'ready' ? 'border-emerald-500/30 text-emerald-400' : 'border-white/10 text-white/40'}`}>{p.status}</Badge>
                <Button size="icon" className="size-7 bg-transparent text-white/30 hover:text-white/60 hover:bg-white/5"><Edit className="size-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (subNav === 'curriculum_standards') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">Curriculum Standards</h2></div>
        <div className="space-y-2" data-animate>
          {['Common Core Math — HSA', 'Common Core Math — HSF', 'Common Core Math — HSG', 'State Standards — Mathematics'].map((s) => (
            <div key={s} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors">
              <p className="text-sm font-medium text-white/70">{s}</p>
              <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400">View Standards</Badge>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Calendar view (default)
  const schedule = [
    { day: 'Monday', lessons: ['Algebra II: Quadratics', 'AP Calc: Limits Review', 'Geometry: Proof Intro'] },
    { day: 'Tuesday', lessons: ['Algebra II: Practice', 'Statistics: Normal Dist', 'Math Lab'] },
    { day: 'Wednesday', lessons: ['AP Calc: Derivatives', 'Geometry: Triangles', 'Office Hours'] },
    { day: 'Thursday', lessons: ['Algebra II: Quiz', 'AP Calc: Practice', 'Statistics: Review'] },
    { day: 'Friday', lessons: ['Geometry: Lab', 'Math Lab: Tutoring', 'Grading Time'] },
  ];

  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold text-white/90">Lesson Calendar</h2></div>
      <div className="grid gap-4 sm:grid-cols-5" data-animate>
        {schedule.map((day) => (
          <div key={day.day} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-4">
            <p className="text-xs font-semibold text-white/60 mb-2">{day.day}</p>
            <div className="space-y-1">
              {day.lessons.map((l) => (
                <div key={l} className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 px-2 py-1.5 text-[11px] text-white/60">{l}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
