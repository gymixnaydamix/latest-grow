/* ─── LibraryPage ─── Resource library / document hub ─────────────── */
import { useState } from 'react';
import { Library, Search, Grid3X3, List, FileText, Video, Image, Download, Eye, Star, Filter, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';import { useLibraryItems } from '@/hooks/api/use-library';
import { useAuthStore } from '@/store/auth.store';
type ResourceType = 'document' | 'video' | 'image' | 'presentation';
type ViewMode = 'grid' | 'list';

interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  subject: string;
  author: string;
  date: string;
  size: string;
  downloads: number;
  starred: boolean;
}

const ICON_MAP: Record<ResourceType, typeof FileText> = {
  document: FileText,
  video: Video,
  image: Image,
  presentation: FileText,
};

const COLOR_MAP: Record<ResourceType, string> = {
  document: 'text-indigo-400 bg-indigo-400/10',
  video: 'text-red-400 bg-red-400/10',
  image: 'text-emerald-400 bg-emerald-400/10',
  presentation: 'text-amber-400 bg-amber-400/10',
};

const FALLBACK_RESOURCES: Resource[] = [
  { id: '1', title: 'Algebra Fundamentals', type: 'document', subject: 'Math', author: 'Dr. Smith', date: '2025-03-10', size: '2.4 MB', downloads: 234, starred: true },
  { id: '2', title: 'Cell Division Lecture', type: 'video', subject: 'Biology', author: 'Ms. Johnson', date: '2025-03-08', size: '156 MB', downloads: 89, starred: false },
  { id: '3', title: 'Solar System Diagram', type: 'image', subject: 'Science', author: 'Mr. Brown', date: '2025-03-05', size: '4.1 MB', downloads: 412, starred: true },
  { id: '4', title: 'World War II Timeline', type: 'presentation', subject: 'History', author: 'Mrs. Davis', date: '2025-03-12', size: '8.7 MB', downloads: 156, starred: false },
  { id: '5', title: 'Grammar Workbook', type: 'document', subject: 'English', author: 'Ms. Wilson', date: '2025-03-01', size: '1.2 MB', downloads: 567, starred: true },
  { id: '6', title: 'Chemical Reactions Lab', type: 'video', subject: 'Chemistry', author: 'Dr. Lee', date: '2025-02-28', size: '98 MB', downloads: 201, starred: false },
  { id: '7', title: 'French Pronunciation Guide', type: 'document', subject: 'French', author: 'Mme. Dubois', date: '2025-03-14', size: '3.5 MB', downloads: 78, starred: false },
  { id: '8', title: 'Coding Workshop Slides', type: 'presentation', subject: 'CS', author: 'Mr. Chen', date: '2025-03-11', size: '12.3 MB', downloads: 345, starred: true },
];

export default function LibraryPage() {
  const containerRef = useStaggerAnimate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const { schoolId } = useAuthStore();
  const { data: apiItems } = useLibraryItems(schoolId);

  const MOCK_RESOURCES: Resource[] = (apiItems as any[])?.map((item: any) => ({
    id: item.id, title: item.title ?? '', type: (item.category?.toLowerCase() ?? 'document') as ResourceType,
    subject: item.subject ?? item.category ?? '', author: item.author ?? '',
    date: item.createdAt ?? '', size: '', downloads: 0, starred: false,
  })) ?? FALLBACK_RESOURCES;

  const filtered = MOCK_RESOURCES.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || r.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div ref={containerRef} className="flex flex-col gap-6 p-4">
      {/* Header bar */}
      <div data-animate className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Library className="size-5 text-indigo-400" />
          <h1 className="text-lg font-bold text-white/90">Resource Library</h1>
          <Badge className="border-0 bg-white/5 text-white/40 text-[10px]">{filtered.length} resources</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search library…" className="pl-9 bg-white/4 border-white/8 text-white/80 text-xs h-8" />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="size-3 text-white/30" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-md border border-white/8 bg-white/4 px-2 py-1 text-[11px] text-white/60 outline-none">
              <option value="all">All Types</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
              <option value="image">Images</option>
              <option value="presentation">Presentations</option>
            </select>
          </div>
          <div className="flex border border-white/8 rounded-md overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={cn('p-1.5', viewMode === 'grid' ? 'bg-white/10 text-white/70' : 'text-white/30')}>
              <Grid3X3 className="size-3.5" />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('p-1.5', viewMode === 'list' ? 'bg-white/10 text-white/70' : 'text-white/30')}>
              <List className="size-3.5" />
            </button>
          </div>
          <Button className="gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-400/20 text-xs h-8">
            <Upload className="size-3" />Upload
          </Button>
        </div>
      </div>

      {/* Grid / List */}
      {viewMode === 'grid' ? (
        <div data-animate className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((r) => {
            const Icon = ICON_MAP[r.type];
            const color = COLOR_MAP[r.type];
            return (
              <Card key={r.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-colors cursor-pointer group">
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between">
                    <div className={cn('size-10 rounded-lg flex items-center justify-center', color)}>
                      <Icon className="size-5" />
                    </div>
                    <button className={cn('text-white/20 hover:text-amber-400', r.starred && 'text-amber-400')}>
                      <Star className={cn('size-3.5', r.starred && 'fill-amber-400')} />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/80 truncate">{r.title}</p>
                    <p className="text-[10px] text-white/30">{r.subject} • {r.author}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/25">
                    <span>{r.size}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5"><Download className="size-2.5" />{r.downloads}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="flex-1 text-[10px] h-6 border-white/8 text-white/50 gap-1">
                      <Eye className="size-2.5" />Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-[10px] h-6 border-white/8 text-white/50 gap-1">
                      <Download className="size-2.5" />Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/6 text-white/40">
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Subject</th>
                  <th className="px-4 py-2 text-left font-medium">Author</th>
                  <th className="px-4 py-2 text-center font-medium">Type</th>
                  <th className="px-4 py-2 text-center font-medium">Size</th>
                  <th className="px-4 py-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const Icon = ICON_MAP[r.type];
                  const color = COLOR_MAP[r.type];
                  return (
                    <tr key={r.id} className="border-b border-white/4 hover:bg-white/2 transition-colors cursor-pointer">
                      <td className="px-4 py-2.5 flex items-center gap-2">
                        <div className={cn('size-6 rounded flex items-center justify-center shrink-0', color)}>
                          <Icon className="size-3" />
                        </div>
                        <span className="text-white/70 font-medium truncate">{r.title}</span>
                        {r.starred && <Star className="size-3 text-amber-400 fill-amber-400 shrink-0" />}
                      </td>
                      <td className="px-4 py-2.5 text-white/50">{r.subject}</td>
                      <td className="px-4 py-2.5 text-white/50">{r.author}</td>
                      <td className="px-4 py-2.5 text-center"><Badge className={cn('border-0 text-[9px] capitalize', color)}>{r.type}</Badge></td>
                      <td className="px-4 py-2.5 text-center text-white/40 font-mono tabular-nums">{r.size}</td>
                      <td className="px-4 py-2.5 text-right text-white/30">{new Date(r.date).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
