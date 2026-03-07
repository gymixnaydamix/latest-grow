/* ─── CareerCompassPage ─── Career exploration & guidance ──────────── */
import { useState } from 'react';
import { Compass, Target, Briefcase, GraduationCap, TrendingUp, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { useStudentProfile } from '@/hooks/api/use-student';

interface CareerPath {
  id: string; title: string; field: string; matchPct: number;
  salary: string; growth: string; education: string; description: string;
  skills: string[]; saved: boolean;
}

const FALLBACK_CAREERS: CareerPath[] = [
  { id: '1', title: 'Software Engineer', field: 'Technology', matchPct: 92, salary: '$85k–$150k', growth: '+25% by 2030', education: "Bachelor's in CS", description: 'Design, develop, and maintain software applications and systems.', skills: ['React', 'JS', 'APIs', 'Problem Solving'], saved: true },
  { id: '2', title: 'Data Scientist', field: 'Technology', matchPct: 85, salary: '$90k–$140k', growth: '+36% by 2030', education: "Bachelor's/Master's", description: 'Analyze complex data to help organizations make decisions.', skills: ['Python', 'Statistics', 'ML', 'Data Viz'], saved: false },
  { id: '3', title: 'UX Designer', field: 'Design', matchPct: 78, salary: '$70k–$120k', growth: '+13% by 2030', education: "Bachelor's in Design", description: 'Create intuitive, accessible digital experiences for users.', skills: ['Design', 'Research', 'Prototyping', 'Empathy'], saved: true },
  { id: '4', title: 'Environmental Scientist', field: 'Science', matchPct: 72, salary: '$55k–$100k', growth: '+8% by 2030', education: "Bachelor's in Env. Sci.", description: 'Study and develop solutions for environmental problems.', skills: ['Research', 'Chemistry', 'Data', 'Writing'], saved: false },
  { id: '5', title: 'Technical Writer', field: 'Communication', matchPct: 70, salary: '$60k–$100k', growth: '+12% by 2030', education: "Bachelor's in English/CS", description: 'Create documentation, guides, and technical content.', skills: ['Writing', 'Tech', 'Organization', 'Research'], saved: false },
  { id: '6', title: 'Game Developer', field: 'Technology', matchPct: 88, salary: '$60k–$130k', growth: '+16% by 2030', education: "Bachelor's in CS/Design", description: 'Build interactive gaming experiences across platforms.', skills: ['Game Design', 'Programming', '3D', 'Creativity'], saved: true },
];

const FALLBACK_INTERESTS = ['Technology', 'Science', 'Writing', 'Design', 'Mathematics', 'Art', 'Languages'];

export default function CareerCompassPage() {
  const containerRef = useStaggerAnimate([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Technology', 'Science', 'Writing']);
  const [view, setView] = useState<'explore' | 'saved'>('explore');
  const { data: apiProfile } = useStudentProfile();
  void apiProfile;
  const CAREERS = FALLBACK_CAREERS;
  const INTERESTS = FALLBACK_INTERESTS;

  const toggle = (i: string) =>
    setSelectedInterests((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  const displayed = view === 'saved' ? CAREERS.filter((c) => c.saved) : CAREERS;
  const topMatch = Math.max(...CAREERS.map((c) => c.matchPct));

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader title="Career Compass" description="Discover career paths aligned with your skills and interests" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        <StatCard label="Top Match" value={topMatch} suffix="%" icon={<Target className="h-5 w-5" />} trend="up" />
        <StatCard label="Careers Explored" value={CAREERS.length} icon={<Compass className="h-5 w-5" />} />
        <StatCard label="Saved Paths" value={CAREERS.filter((c) => c.saved).length} icon={<Heart className="h-5 w-5" />} />
      </div>

      {/* Interests */}
      <Card data-animate>
        <CardHeader>
          <CardTitle className="text-sm">Your Interests</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <Badge
              key={i}
              variant={selectedInterests.includes(i) ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => toggle(i)}
            >
              {i}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* View toggle */}
      <div data-animate className="flex gap-2">
        <Button size="sm" variant={view === 'explore' ? 'default' : 'outline'} className="text-xs h-8" onClick={() => setView('explore')}>
          <Compass className="size-3 mr-1" /> Explore All
        </Button>
        <Button size="sm" variant={view === 'saved' ? 'default' : 'outline'} className="text-xs h-8" onClick={() => setView('saved')}>
          <Heart className="size-3 mr-1" /> Saved ({CAREERS.filter((c) => c.saved).length})
        </Button>
      </div>

      {/* Career cards */}
      <div className="grid gap-4 sm:grid-cols-2" data-animate>
        {displayed.map((career) => (
          <Card key={career.id} className="hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => notifySuccess('Career', 'Opening career details…')}>
            <CardContent className="pt-5 pb-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold">{career.title}</p>
                    {career.saved && <Heart className="size-3.5 text-red-400 fill-red-400" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{career.field}</p>
                </div>
                <div className="text-right">
                  <span className={cn('text-lg font-bold', career.matchPct >= 80 ? 'text-emerald-500' : career.matchPct >= 60 ? 'text-amber-500' : 'text-muted-foreground')}>
                    {career.matchPct}%
                  </span>
                  <p className="text-[9px] text-muted-foreground">match</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{career.description}</p>

              <div className="flex flex-wrap gap-1">
                {career.skills.map((s) => (
                  <Badge key={s} variant="outline" className="text-[9px] h-4">{s}</Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground pt-1 border-t">
                <div className="flex items-center gap-1"><Briefcase className="size-2.5" />{career.salary}</div>
                <div className="flex items-center gap-1"><TrendingUp className="size-2.5 text-emerald-500" />{career.growth}</div>
                <div className="flex items-center gap-1"><GraduationCap className="size-2.5" />{career.education}</div>
              </div>

              <Progress value={career.matchPct} className="h-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
