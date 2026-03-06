/* ─── ResourcesPage ─── Wellness resources library ─────────────────── */
import { useState } from 'react';
import {
  BookOpen, Heart, Phone, Globe, Play, Download,
  ExternalLink, Search, Star, Clock, Users, Shield,
  Brain, Headphones, Apple, Dumbbell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess } from '@/lib/notify';

type ResourceCategory = 'mental_health' | 'physical' | 'nutrition' | 'mindfulness' | 'crisis' | 'social';
type ResourceType = 'article' | 'video' | 'app' | 'hotline' | 'guide';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  type: ResourceType;
  saved: boolean;
  rating: number;
  readTime?: string;
  url?: string;
}

const CAT_CFG: Record<ResourceCategory, { label: string; icon: typeof Heart; color: string }> = {
  mental_health: { label: 'Mental Health', icon: Brain, color: 'text-violet-400 bg-violet-400/10' },
  physical:      { label: 'Physical', icon: Dumbbell, color: 'text-emerald-400 bg-emerald-400/10' },
  nutrition:     { label: 'Nutrition', icon: Apple, color: 'text-green-400 bg-green-400/10' },
  mindfulness:   { label: 'Mindfulness', icon: Headphones, color: 'text-indigo-400 bg-indigo-400/10' },
  crisis:        { label: 'Crisis Support', icon: Shield, color: 'text-red-400 bg-red-400/10' },
  social:        { label: 'Social', icon: Users, color: 'text-cyan-400 bg-cyan-400/10' },
};

const TYPE_ICONS: Record<ResourceType, typeof BookOpen> = {
  article: BookOpen, video: Play, app: Globe, hotline: Phone, guide: Download,
};

const RESOURCES: Resource[] = [
  { id: '1', title: 'Managing Test Anxiety', description: 'A guide to recognizing and coping with exam stress using evidence-based techniques.', category: 'mental_health', type: 'article', saved: true, rating: 4.8, readTime: '5 min' },
  { id: '2', title: '10-Minute Morning Yoga Routine', description: 'Start your day with a short yoga routine designed for students with tight schedules.', category: 'physical', type: 'video', saved: false, rating: 4.6, readTime: '10 min' },
  { id: '3', title: 'Healthy Dorm Room Meals', description: 'Quick, nutritious recipes you can make with limited kitchen equipment.', category: 'nutrition', type: 'guide', saved: true, rating: 4.4, readTime: '8 min' },
  { id: '4', title: 'Calm — Daily Meditation', description: 'Guided meditation app with student-focused sessions for sleep and focus.', category: 'mindfulness', type: 'app', saved: false, rating: 4.9 },
  { id: '5', title: 'Crisis Text Line', description: 'Free 24/7 support. Text HOME to 741741 to connect with a trained crisis counselor.', category: 'crisis', type: 'hotline', saved: true, rating: 5.0 },
  { id: '6', title: 'Building Healthy Friendships', description: 'Tips on building authentic connections and setting healthy boundaries in college.', category: 'social', type: 'article', saved: false, rating: 4.3, readTime: '6 min' },
  { id: '7', title: 'Sleep Hygiene for Students', description: 'Why sleep matters and how to build a consistent sleep routine around your class schedule.', category: 'mental_health', type: 'article', saved: false, rating: 4.7, readTime: '4 min' },
  { id: '8', title: 'Headspace — Focus Music', description: 'Curated playlists and soundscapes designed to boost concentration while studying.', category: 'mindfulness', type: 'app', saved: true, rating: 4.5 },
  { id: '9', title: '7-Minute HIIT Workout', description: 'No equipment needed. Perfect between classes for an energy boost.', category: 'physical', type: 'video', saved: false, rating: 4.2, readTime: '7 min' },
  { id: '10', title: 'National Suicide Prevention Lifeline', description: 'Call or text 988 for free, confidential support 24/7.', category: 'crisis', type: 'hotline', saved: true, rating: 5.0 },
];

export default function ResourcesPage() {
  const containerRef = useStaggerAnimate([]);
  const [catFilter, setCatFilter] = useState<'all' | ResourceCategory>('all');
  const [typeFilter] = useState<'all' | ResourceType>('all');
  const [search, setSearch] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);

  const filtered = RESOURCES
    .filter((r) => catFilter === 'all' || r.category === catFilter)
    .filter((r) => typeFilter === 'all' || r.type === typeFilter)
    .filter((r) => !savedOnly || r.saved)
    .filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()));

  const saved = RESOURCES.filter((r) => r.saved).length;
  const crisis = RESOURCES.filter((r) => r.category === 'crisis').length;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Wellness Resources" description="Articles, videos, apps, and support for your wellbeing" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Resources" value={RESOURCES.length} icon={<BookOpen className="h-5 w-5" />} />
        <StatCard label="Saved" value={saved} icon={<Star className="h-5 w-5" />} trend="up" />
        <StatCard label="Categories" value={Object.keys(CAT_CFG).length} icon={<Heart className="h-5 w-5" />} />
        <StatCard label="Crisis Resources" value={crisis} icon={<Shield className="h-5 w-5" />} />
      </div>

      {/* Crisis banner */}
      <Card data-animate className="border-red-400/20 bg-red-500/5 backdrop-blur-xl">
        <CardContent className="flex items-center gap-3 p-4">
          <Shield className="size-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80">Need immediate help?</p>
            <p className="text-[11px] text-white/40">Call/text 988 (Suicide & Crisis) or text HOME to 741741 (Crisis Text Line)</p>
          </div>
          <Button size="sm" className="bg-red-500/20 text-red-300 border border-red-400/20 text-xs" onClick={() => notifySuccess('Help', 'Connecting you with support…')}>Get Help Now</Button>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div data-animate className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', ...Object.keys(CAT_CFG)] as const).map((c) => {
            const cfg = c !== 'all' ? CAT_CFG[c as ResourceCategory] : null;
            return (
              <Badge
                key={c}
                onClick={() => setCatFilter(c as typeof catFilter)}
                className={cn(
                  'cursor-pointer text-[10px] transition-colors gap-1',
                  catFilter === c
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                    : 'bg-white/4 text-white/40 border-white/8 hover:text-white/60',
                )}
              >
                {cfg && <cfg.icon className="size-2.5" />}
                {c === 'all' ? 'All' : cfg!.label}
              </Badge>
            );
          })}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-white/30" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources…" className="h-8 w-48 pl-7 bg-white/4 border-white/8 text-white/80 text-xs" />
          </div>
          <Button
            size="sm"
            variant={savedOnly ? 'default' : 'outline'}
            onClick={() => setSavedOnly(!savedOnly)}
            className={cn('text-xs h-8 gap-1', !savedOnly && 'border-white/10 text-white/50')}
          >
            <Star className="size-3" />Saved
          </Button>
        </div>
      </div>

      {/* Resource grid */}
      <div data-animate className="grid gap-3 sm:grid-cols-2">
        {!filtered.length && (
          <Card className="border-white/6 bg-white/3 backdrop-blur-xl sm:col-span-2">
            <CardContent className="py-10 text-center text-white/30 text-sm">No resources match your filters.</CardContent>
          </Card>
        )}
        {filtered.map((res) => {
          const cat = CAT_CFG[res.category];
          const TypeIcon = TYPE_ICONS[res.type];
          return (
            <Card key={res.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => notifySuccess('Resource', 'Opening resource details…')}>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('size-8 rounded-lg flex items-center justify-center', cat.color)}>
                      <cat.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/80">{res.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className="border-0 text-[9px] bg-white/5 text-white/40 gap-0.5"><TypeIcon className="size-2.5" />{res.type}</Badge>
                        {res.readTime && <span className="text-[9px] text-white/25 flex items-center gap-0.5"><Clock className="size-2.5" />{res.readTime}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className={cn('size-3', res.saved ? 'text-amber-400 fill-amber-400' : 'text-white/20')} />
                    <span className="text-[9px] text-white/30">{res.rating}</span>
                  </div>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{res.description}</p>
                <div className="flex items-center justify-between">
                  <Badge className={cn('border-0 text-[9px]', cat.color)}>{cat.label}</Badge>
                  <Button size="sm" variant="outline" className="text-[10px] h-6 border-white/10 text-white/40 gap-1" onClick={(e) => { e.stopPropagation(); notifySuccess('Resource', 'Opening external resource…'); }}>
                    <ExternalLink className="size-2.5" />Open
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
