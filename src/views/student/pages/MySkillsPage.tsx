/* ─── MySkillsPage ─── Student skills / competencies tracker ───────── */
import { useState } from 'react';
import { Zap, Star, TrendingUp, Award, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface Skill {
  id: string; name: string; category: string; level: SkillLevel;
  progress: number; endorsements: number; verified: boolean;
}

const LEVEL_CFG: Record<SkillLevel, { color: string; bg: string; next: string }> = {
  beginner: { color: 'text-blue-400', bg: 'bg-blue-400/10', next: 'Intermediate' },
  intermediate: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', next: 'Advanced' },
  advanced: { color: 'text-violet-400', bg: 'bg-violet-400/10', next: 'Expert' },
  expert: { color: 'text-amber-400', bg: 'bg-amber-400/10', next: 'Mastered' },
};

const SKILLS: Skill[] = [
  { id: '1', name: 'React Development', category: 'Technology', level: 'advanced', progress: 78, endorsements: 5, verified: true },
  { id: '2', name: 'Data Analysis', category: 'Mathematics', level: 'intermediate', progress: 55, endorsements: 3, verified: false },
  { id: '3', name: 'Creative Writing', category: 'Language Arts', level: 'advanced', progress: 82, endorsements: 7, verified: true },
  { id: '4', name: 'Public Speaking', category: 'Communication', level: 'intermediate', progress: 45, endorsements: 2, verified: false },
  { id: '5', name: 'Chemistry Lab', category: 'Science', level: 'beginner', progress: 30, endorsements: 1, verified: false },
  { id: '6', name: 'Spanish Language', category: 'Languages', level: 'intermediate', progress: 62, endorsements: 4, verified: true },
  { id: '7', name: 'Photography', category: 'Art', level: 'beginner', progress: 20, endorsements: 0, verified: false },
  { id: '8', name: 'Game Design', category: 'Technology', level: 'expert', progress: 95, endorsements: 12, verified: true },
];

export default function MySkillsPage() {
  const containerRef = useStaggerAnimate([]);
  const [filter, setFilter] = useState<'all' | SkillLevel>('all');
  const categories = [...new Set(SKILLS.map((s) => s.category))];
  const [catFilter, setCatFilter] = useState<string>('all');

  const filtered = SKILLS
    .filter((s) => filter === 'all' || s.level === filter)
    .filter((s) => catFilter === 'all' || s.category === catFilter);

  const verified = SKILLS.filter((s) => s.verified).length;
  const avgProgress = Math.round(SKILLS.reduce((a, s) => a + s.progress, 0) / SKILLS.length);
  const totalEndorsements = SKILLS.reduce((a, s) => a + s.endorsements, 0);

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader title="My Skills" description="Track, build, and showcase your competencies" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Skills" value={SKILLS.length} icon={<Zap className="h-5 w-5" />} />
        <StatCard label="Avg. Progress" value={avgProgress} suffix="%" icon={<TrendingUp className="h-5 w-5" />} trend="up" />
        <StatCard label="Endorsements" value={totalEndorsements} icon={<Star className="h-5 w-5" />} />
        <StatCard label="Verified" value={verified} icon={<Award className="h-5 w-5" />} trend="up" />
      </div>

      {/* Filters */}
      <div data-animate className="flex flex-wrap gap-2">
        {(['all', 'beginner', 'intermediate', 'advanced', 'expert'] as const).map((l) => (
          <Button key={l} size="sm" variant={filter === l ? 'default' : 'outline'} className="text-xs h-7 capitalize" onClick={() => setFilter(l)}>
            {l}
          </Button>
        ))}
        <span className="border-l border-border mx-1" />
        <Button size="sm" variant={catFilter === 'all' ? 'default' : 'outline'} className="text-xs h-7" onClick={() => setCatFilter('all')}>All Categories</Button>
        {categories.map((c) => (
          <Button key={c} size="sm" variant={catFilter === c ? 'default' : 'outline'} className="text-xs h-7" onClick={() => setCatFilter(c)}>
            {c}
          </Button>
        ))}
      </div>

      {/* Skills grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
        {filtered.map((skill) => {
          const cfg = LEVEL_CFG[skill.level];
          return (
            <Card key={skill.id} className="hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => notifySuccess('Skill', 'Opening skill details…')}>
              <CardContent className="pt-5 pb-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{skill.name}</p>
                      {skill.verified && <Award className="size-3.5 text-emerald-500" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{skill.category}</p>
                  </div>
                  <Badge className={cn('text-[9px] border capitalize', cfg.bg, cfg.color, 'border-current/20')}>
                    {skill.level}
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Progress to {cfg.next}</span>
                    <span className="font-medium">{skill.progress}%</span>
                  </div>
                  <Progress value={skill.progress} className="h-1.5" />
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="size-3 text-amber-500" />{skill.endorsements} endorsements</span>
                  <ChevronRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add skill card */}
        <Card className="border-dashed cursor-pointer hover:border-primary/30 transition-colors" onClick={() => notifySuccess('Skill', 'Add new skill dialog opened')}>
          <CardContent className="flex flex-col items-center justify-center h-full py-10">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Plus className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Add a Skill</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
