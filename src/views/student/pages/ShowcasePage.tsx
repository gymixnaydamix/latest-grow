/* ─── ShowcasePage ─── Student work portfolio gallery ───────────────── */
import { useState } from 'react';
import { FolderOpen, Plus, Image, FileText, Star, Eye, Calendar, Tag, Code, Presentation, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';

type WorkType = 'essay' | 'project' | 'artwork' | 'presentation' | 'code';

interface PortfolioItem {
  id: string; title: string; type: WorkType; subject: string; date: string;
  grade?: string; tags: string[]; featured: boolean; description: string; views: number;
}

const WORK_ICONS: Record<WorkType, typeof FileText> = { essay: FileText, project: FolderOpen, artwork: Image, presentation: Presentation, code: Code };
const WORK_COLORS: Record<WorkType, { text: string; bg: string }> = {
  essay: { text: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  project: { text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  artwork: { text: 'text-violet-400', bg: 'bg-violet-400/10' },
  presentation: { text: 'text-amber-400', bg: 'bg-amber-400/10' },
  code: { text: 'text-cyan-400', bg: 'bg-cyan-400/10' },
};

const PORTFOLIO: PortfolioItem[] = [
  { id: '1', title: 'Climate Change Research Paper', type: 'essay', subject: 'Science', date: '2025-03-10', grade: 'A', tags: ['research', 'environment'], featured: true, description: 'In-depth analysis of climate change effects on coastal ecosystems.', views: 45 },
  { id: '2', title: 'Solar System 3D Model', type: 'project', subject: 'Physics', date: '2025-03-05', grade: 'A+', tags: ['3d', 'physics', 'space'], featured: true, description: 'Interactive 3D model of the solar system with orbital mechanics.', views: 128 },
  { id: '3', title: 'Self-Portrait in Oil', type: 'artwork', subject: 'Art', date: '2025-02-28', tags: ['painting', 'portrait'], featured: false, description: 'Oil painting self-portrait exploring impressionist technique.', views: 67 },
  { id: '4', title: 'History of the Internet', type: 'presentation', subject: 'CS', date: '2025-03-12', grade: 'B+', tags: ['technology', 'history'], featured: false, description: 'Slide deck covering ARPANET through modern web.', views: 34 },
  { id: '5', title: 'Chat Application', type: 'code', subject: 'CS', date: '2025-03-08', grade: 'A', tags: ['react', 'websocket', 'fullstack'], featured: true, description: 'Real-time chat app built with React and WebSocket.', views: 210 },
  { id: '6', title: 'Short Story Collection', type: 'essay', subject: 'English', date: '2025-02-20', tags: ['creative', 'fiction'], featured: false, description: 'Collection of three original short stories.', views: 52 },
  { id: '7', title: 'Machine Learning Predictor', type: 'code', subject: 'CS', date: '2025-03-15', grade: 'A', tags: ['python', 'ml', 'data'], featured: true, description: 'Student grade prediction model using scikit-learn.', views: 156 },
  { id: '8', title: 'Spanish Podcast Series', type: 'project', subject: 'Spanish', date: '2025-03-01', tags: ['audio', 'language', 'culture'], featured: false, description: 'Three-episode podcast about Latin American culture.', views: 89 },
];

export default function ShowcasePage() {
  const containerRef = useStaggerAnimate([]);
  const [filter, setFilter] = useState<'all' | 'featured' | WorkType>('all');

  const filtered = filter === 'all' ? PORTFOLIO
    : filter === 'featured' ? PORTFOLIO.filter((p) => p.featured)
    : PORTFOLIO.filter((p) => p.type === filter);

  const totalViews = PORTFOLIO.reduce((s, p) => s + p.views, 0);
  const featuredCount = PORTFOLIO.filter((p) => p.featured).length;

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader title="Showcase" description="Your best work, displayed for teachers, peers, and colleges" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        <StatCard label="Portfolio Works" value={PORTFOLIO.length} icon={<FolderOpen className="h-5 w-5" />} />
        <StatCard label="Total Views" value={totalViews} icon={<Eye className="h-5 w-5" />} trend="up" />
        <StatCard label="Featured" value={featuredCount} icon={<Star className="h-5 w-5" />} />
      </div>

      {/* Filters */}
      <div data-animate className="flex gap-2 flex-wrap">
        {(['all', 'featured', 'essay', 'project', 'artwork', 'presentation', 'code'] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} className="text-xs h-7 capitalize" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
        <div className="flex-1" />
        <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => notifySuccess('Portfolio', 'New work added to showcase')}><Plus className="size-3" /> Add Work</Button>
      </div>

      {/* Portfolio grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
        {filtered.map((item) => {
          const Icon = WORK_ICONS[item.type];
          const colors = WORK_COLORS[item.type];
          return (
            <Card key={item.id} className="group hover:border-primary/30 transition-colors cursor-pointer overflow-hidden" onClick={() => notifySuccess('Portfolio', 'Opening work details…')}>
              {/* Thumbnail */}
              <div className={cn('h-32 flex items-center justify-center relative', colors.bg)}>
                <Icon className={cn('size-12 opacity-30', colors.text)} />
                {item.featured && <Star className="absolute top-3 right-3 size-4 text-amber-500 fill-amber-500" />}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ExternalLink className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.subject}</p>
                  </div>
                  {item.grade && <Badge variant="outline" className="text-[10px] shrink-0 ml-2">{item.grade}</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-[9px] h-4"><Tag className="size-2 mr-0.5" />{t}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1"><Calendar className="size-2.5" />{new Date(item.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Eye className="size-2.5" />{item.views} views</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
