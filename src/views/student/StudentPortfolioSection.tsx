/* ─── StudentPortfolioSection ─── Student work portfolio showcase ──── */
import { useState } from 'react';
import { FolderOpen, Plus, Image, FileText, Star, Eye, Calendar, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useStudentStore } from '@/store/student-data.store';
import { notifySuccess } from '@/lib/notify';

type WorkType = 'essay' | 'project' | 'artwork' | 'presentation' | 'code';

interface PortfolioItem {
  id: string;
  title: string;
  type: WorkType;
  subject: string;
  date: string;
  grade?: string;
  thumbnail?: string;
  tags: string[];
  featured: boolean;
  description: string;
}

const WORK_ICONS: Record<WorkType, typeof FileText> = { essay: FileText, project: FolderOpen, artwork: Image, presentation: FileText, code: FileText };
const WORK_COLORS: Record<WorkType, string> = {
  essay: 'text-indigo-400 bg-indigo-400/10',
  project: 'text-emerald-400 bg-emerald-400/10',
  artwork: 'text-violet-400 bg-violet-400/10',
  presentation: 'text-amber-400 bg-amber-400/10',
  code: 'text-cyan-400 bg-cyan-400/10',
};

const MOCK: PortfolioItem[] = [
  { id: '1', title: 'Climate Change Research Paper', type: 'essay', subject: 'Science', date: '2025-03-10', grade: 'A', tags: ['research', 'environment'], featured: true, description: 'In-depth analysis of climate change effects on coastal ecosystems.' },
  { id: '2', title: 'Solar System 3D Model', type: 'project', subject: 'Physics', date: '2025-03-05', grade: 'A+', tags: ['3d', 'physics', 'space'], featured: true, description: 'Interactive 3D model of the solar system with orbital mechanics.' },
  { id: '3', title: 'Self-Portrait in Oil', type: 'artwork', subject: 'Art', date: '2025-02-28', tags: ['painting', 'portrait'], featured: false, description: 'Oil painting self-portrait exploring impressionist technique.' },
  { id: '4', title: 'History of the Internet', type: 'presentation', subject: 'CS', date: '2025-03-12', grade: 'B+', tags: ['technology', 'history'], featured: false, description: 'Slide deck covering ARPANET through modern web.' },
  { id: '5', title: 'Chat Application', type: 'code', subject: 'CS', date: '2025-03-08', grade: 'A', tags: ['react', 'websocket', 'fullstack'], featured: true, description: 'Real-time chat app built with React and WebSocket.' },
  { id: '6', title: 'Short Story Collection', type: 'essay', subject: 'English', date: '2025-02-20', tags: ['creative', 'fiction'], featured: false, description: 'Collection of three original short stories.' },
];

export default function StudentPortfolioSection() {
  const containerRef = useStaggerAnimate([]);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const store = useStudentStore();

  const items = filter === 'featured' ? MOCK.filter((m) => m.featured) : MOCK;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Header */}
      <div data-animate className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-5 text-violet-400" />
          <h2 className="text-lg font-bold text-white/90">My Portfolio</h2>
          <Badge className="border-0 bg-white/5 text-white/40 text-[10px]">{MOCK.length} works</Badge>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-white/8 rounded-md overflow-hidden text-[11px]">
            {(['all', 'featured'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1 capitalize', filter === f ? 'bg-white/10 text-white/70' : 'text-white/30')}>
                {f}
              </button>
            ))}
          </div>
          <Button className="gap-1.5 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-400/20 text-xs h-8" onClick={() => { store.addPortfolioWork({ title: 'New Portfolio Item', type: 'project', description: 'A new project work' }); notifySuccess('Portfolio', 'New work added to your portfolio'); }}>
            <Plus className="size-3" />Add Work
          </Button>
        </div>
      </div>

      {/* Portfolio grid */}
      <div data-animate className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = WORK_ICONS[item.type];
          const color = WORK_COLORS[item.type];
          return (
            <Card key={item.id} className="border-white/6 bg-white/3 backdrop-blur-xl group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => notifySuccess(item.title, `Opening ${item.type} — ${item.subject}`)}>
              {/* Thumbnail area */}
              <div className={cn('h-32 rounded-t-xl flex items-center justify-center', color.split(' ')[1])}>
                <Icon className={cn('size-10 opacity-40', color.split(' ')[0])} />
                {item.featured && (
                  <Star className="absolute top-3 right-3 size-4 text-amber-400 fill-amber-400" />
                )}
              </div>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white/80">{item.title}</p>
                    <p className="text-[10px] text-white/30">{item.subject}</p>
                  </div>
                  {item.grade && (
                    <Badge className="border-0 bg-emerald-400/10 text-emerald-400 text-[10px]">{item.grade}</Badge>
                  )}
                </div>
                <p className="text-[11px] text-white/40 line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((t) => (
                    <Badge key={t} variant="outline" className="border-white/8 text-white/30 text-[9px]">
                      <Tag className="size-2 mr-0.5" />{t}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/25 mt-1">
                  <span className="flex items-center gap-1"><Calendar className="size-2.5" />{new Date(item.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="size-2.5" />View
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
