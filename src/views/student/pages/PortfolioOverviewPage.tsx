/* ─── PortfolioOverviewPage ─── Full-page portfolio landing ───────── */
import { useState } from 'react';
import {
  FolderOpen, Award, Star, FileText, Image,
  Code, Presentation, ChevronRight, Eye,
  Download, Sparkles, Trophy,
  BarChart3, Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { useStudentPortfolio, useAddPortfolioWork } from '@/hooks/api/use-student';

const FALLBACK_WORK_TYPES = [
  { type: 'Essay', icon: FileText, color: 'bg-blue-500/20 text-blue-400' },
  { type: 'Art', icon: Image, color: 'bg-pink-500/20 text-pink-400' },
  { type: 'Code', icon: Code, color: 'bg-emerald-500/20 text-emerald-400' },
  { type: 'Presentation', icon: Presentation, color: 'bg-amber-500/20 text-amber-400' },
];

const FALLBACK_PORTFOLIO_ITEMS = [
  { title: 'Climate Change Research Paper', type: 'Essay', subject: 'Science', date: 'May 2025', featured: true, grade: 'A+', views: 142 },
  { title: 'Digital Self-Portrait', type: 'Art', subject: 'Art', date: 'Apr 2025', featured: true, grade: 'A', views: 89 },
  { title: 'Python Data Visualization App', type: 'Code', subject: 'CS', date: 'Mar 2025', featured: true, grade: 'A+', views: 234 },
  { title: 'Renaissance Art Analysis', type: 'Presentation', subject: 'History', date: 'Mar 2025', featured: false, grade: 'B+', views: 56 },
  { title: 'Sustainable Energy Solutions Essay', type: 'Essay', subject: 'Science', date: 'Feb 2025', featured: false, grade: 'A', views: 78 },
  { title: 'Game of Life Simulation', type: 'Code', subject: 'CS', date: 'Feb 2025', featured: true, grade: 'A+', views: 312 },
  { title: 'Watercolor Landscape Series', type: 'Art', subject: 'Art', date: 'Jan 2025', featured: false, grade: 'A-', views: 45 },
  { title: 'Economic Policy Debate Slides', type: 'Presentation', subject: 'Economics', date: 'Jan 2025', featured: false, grade: 'B+', views: 32 },
];

const FALLBACK_SKILLS_MAP = [
  { name: 'Research & Analysis', level: 90 },
  { name: 'Creative Writing', level: 85 },
  { name: 'Programming', level: 82 },
  { name: 'Visual Design', level: 72 },
  { name: 'Public Speaking', level: 68 },
  { name: 'Data Science', level: 60 },
];

const FALLBACK_CERTIFICATES = [
  { title: 'Python Programming', issuer: 'CodeAcademy', date: 'Apr 2025', verified: true },
  { title: 'Digital Art Foundations', issuer: 'Creative Academy', date: 'Mar 2025', verified: true },
  { title: 'Research Methodology', issuer: 'STEM Board', date: 'Feb 2025', verified: true },
  { title: 'Public Speaking', issuer: 'Toastmasters Jr.', date: 'Jan 2025', verified: false },
];

const FALLBACK_CAREER_READINESS = [
  { area: 'Communication', score: 88 },
  { area: 'Technology', score: 85 },
  { area: 'Analysis', score: 82 },
  { area: 'Leadership', score: 70 },
  { area: 'Creativity', score: 75 },
];

export default function PortfolioOverviewPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [filter, setFilter] = useState<string>('all');

  /* ── API data ── */
  const { data: apiPortfolio } = useStudentPortfolio();
  // @ts-expect-error TS6133 — mutation available for wiring
  const _addWorkMut = useAddPortfolioWork();
  const portfolioData = (apiPortfolio as any) ?? {};
  const portfolio = (portfolioData?.items as any[])?.length > 0 ? (portfolioData.items as any[]) : FALLBACK_PORTFOLIO_ITEMS;
  const workTypes = (portfolioData?.workTypes as any[])?.length > 0 ? (portfolioData.workTypes as any[]) : FALLBACK_WORK_TYPES;
  const skillsMap = (portfolioData?.skillsMap as any[])?.length > 0 ? (portfolioData.skillsMap as any[]) : FALLBACK_SKILLS_MAP;
  const certificates = (portfolioData?.certificates as any[])?.length > 0 ? (portfolioData.certificates as any[]) : FALLBACK_CERTIFICATES;
  const careerReadiness = (portfolioData?.careerReadiness as any[])?.length > 0 ? (portfolioData.careerReadiness as any[]) : FALLBACK_CAREER_READINESS;
  const totalViews = portfolio.reduce((s: number, p: any) => s + (p.views ?? 0), 0);

  const filtered = filter === 'all'
    ? portfolio
    : filter === 'featured'
      ? portfolio.filter((p: any) => p.featured)
      : portfolio.filter((p: any) => p.type === filter);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Portfolio" description="Your curated showcase of achievements, projects, and skills" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Portfolio Items" value={portfolio.length} icon={<FolderOpen className="h-5 w-5" />} />
        <StatCard label="Total Views" value={totalViews} icon={<Eye className="h-5 w-5" />} trend="up" />
        <StatCard label="Certificates" value={certificates.length} icon={<Award className="h-5 w-5" />} accentColor="#a78bfa" />
        <StatCard label="Featured Works" value={portfolio.filter((p: any) => p.featured).length} icon={<Star className="h-5 w-5" />} accentColor="#f59e0b" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap" data-animate>
        {[{ key: 'all', label: 'All Works' }, { key: 'featured', label: 'Featured' }, ...workTypes.map((w: any) => ({ key: w.type, label: w.type }))].map((f) => (
          <Button
            key={f.key}
            variant="ghost"
            size="sm"
            onClick={() => setFilter(f.key)}
            className={cn(
              'text-[10px] h-7 px-3 rounded-full border border-white/6 bg-white/3',
              filter === f.key && 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400',
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main – Portfolio grid + Certs */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Portfolio grid */}
          <div className="grid gap-3 sm:grid-cols-2" data-animate>
            {filtered.map((item, i) => {
              const typeInfo = workTypes.find((w: any) => w.type === item.type) ?? workTypes[0];
              return (
                <Card key={i} className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all group cursor-pointer" onClick={() => notifySuccess('Portfolio', 'Opening work details…')}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className={cn('size-8 rounded-lg flex items-center justify-center', typeInfo.color)}>
                        <typeInfo.icon className="size-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.featured && <Star className="size-3 text-amber-400 fill-amber-400" />}
                        <Badge variant="outline" className="text-[8px] border-white/6 text-white/30">{item.grade}</Badge>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-white/80 mb-0.5">{item.title}</p>
                    <p className="text-[9px] text-white/30">{item.subject} · {item.date}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                      <span className="text-[8px] text-white/20 flex items-center gap-0.5"><Eye className="size-2" />{item.views} views</span>
                      <ChevronRight className="size-3 text-white/15 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Certificates */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Award className="size-4 text-violet-400" />Certificates & Awards
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {certificates.map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-2.5">
                  <div className="size-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Trophy className="size-3.5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-white/70">{c.title}</p>
                    <p className="text-[8px] text-white/25">{c.issuer} · {c.date}</p>
                  </div>
                  {c.verified && <Badge className="text-[7px] bg-emerald-500/15 text-emerald-400 border-0">Verified</Badge>}
                  <Download className="size-3 text-white/15 cursor-pointer hover:text-white/40 transition-colors" onClick={() => notifySuccess('Certificate', 'Certificate downloaded')} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Skills map */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <BarChart3 className="size-4 text-cyan-400" />Skill Proficiency
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {skillsMap.map((s: any) => (
                <div key={s.name}>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-white/50">{s.name}</span>
                    <span className="text-white/35">{s.level}%</span>
                  </div>
                  <Progress value={s.level} className="h-1.5 bg-white/5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Career readiness */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Briefcase className="size-4 text-emerald-400" />Career Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {careerReadiness.map((c: any) => (
                <div key={c.area} className="flex items-center gap-2">
                  <span className="text-[9px] text-white/40 w-20">{c.area}</span>
                  <div className="flex-1 h-5 bg-white/3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500/40 to-emerald-500/70 flex items-center justify-end pr-1.5"
                      style={{ width: `${c.score}%` }}
                    >
                      <span className="text-[7px] text-white/60">{c.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Work type distribution */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Sparkles className="size-4 text-amber-400" />Work Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {workTypes.map((w: any) => {
                const count = portfolio.filter((p: any) => p.type === w.type).length;
                return (
                  <div key={w.type} className="flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 p-2">
                    <div className={cn('size-6 rounded-md flex items-center justify-center', w.color)}>
                      <w.icon className="size-3" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50">{w.type}</p>
                      <p className="text-xs font-bold text-white/70">{count}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
