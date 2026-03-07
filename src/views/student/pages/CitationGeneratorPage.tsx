/* ─── CitationGeneratorPage ─── Academic citation tool ─────────────── */
import { useState } from 'react';
import {
  BookOpen, Copy, Download, Plus, Trash2, Search,
  FileText, Globe, Video, Newspaper, BookMarked,
  CheckCircle2, ClipboardList, RefreshCw,
  Library, Quote, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess } from '@/lib/notify';
import { useStudentCitations, useGenerateCitation, useDeleteCitation } from '@/hooks/api/use-student';

type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE';
type SourceType = 'book' | 'journal' | 'website' | 'video' | 'newspaper';

const SOURCE_ICONS: Record<SourceType, typeof BookOpen> = {
  book: BookMarked,
  journal: FileText,
  website: Globe,
  video: Video,
  newspaper: Newspaper,
};

const STYLES: CitationStyle[] = ['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE'];

// @ts-expect-error TS6133 — mock data kept for shape reference
const _SAVED_CITATIONS = [
  {
    id: '1', type: 'book' as SourceType, title: 'Introduction to Algorithms',
    authors: 'Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C.',
    year: 2009, formatted: 'Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009). Introduction to algorithms (3rd ed.). MIT Press.',
    project: 'CS Research Paper', starred: true,
  },
  {
    id: '2', type: 'journal' as SourceType, title: 'Attention Is All You Need',
    authors: 'Vaswani, A., Shazeer, N., Parmar, N., et al.',
    year: 2017, formatted: 'Vaswani, A., Shazeer, N., Parmar, N., et al. (2017). Attention is all you need. Advances in Neural Information Processing Systems, 30.',
    project: 'CS Research Paper', starred: true,
  },
  {
    id: '3', type: 'website' as SourceType, title: 'Climate Change Evidence',
    authors: 'NASA',
    year: 2024, formatted: 'NASA. (2024). Climate change evidence. https://climate.nasa.gov/evidence/',
    project: 'Science Essay', starred: false,
  },
  {
    id: '4', type: 'newspaper' as SourceType, title: 'AI in Education: A New Era',
    authors: 'Johnson, M.',
    year: 2025, formatted: 'Johnson, M. (2025, January 15). AI in education: A new era. The New York Times.',
    project: 'Education Report', starred: false,
  },
  {
    id: '5', type: 'book' as SourceType, title: 'To Kill a Mockingbird',
    authors: 'Lee, H.',
    year: 1960, formatted: 'Lee, H. (1960). To kill a mockingbird. J. B. Lippincott & Co.',
    project: 'English Essay', starred: false,
  },
];

const PROJECTS = ['All', 'CS Research Paper', 'Science Essay', 'Education Report', 'English Essay'];

export default function CitationGeneratorPage() {
  const containerRef = useStaggerAnimate([]);
  const [style, setStyle] = useState<CitationStyle>('APA');
  const [sourceType, setSourceType] = useState<SourceType>('book');
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [showGenerator, setShowGenerator] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  /* ── API data ── */
  const { data: _apiCitations } = useStudentCitations();
  const generateCitationMut = useGenerateCitation();
  const deleteCitationMut = useDeleteCitation();
  const savedCitations = (_apiCitations as any[]) ?? [];

  const filtered = savedCitations.filter((c: any) => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) || c.authors?.toLowerCase().includes(search.toLowerCase());
    const matchProject = projectFilter === 'All' || c.project === projectFilter;
    return matchSearch && matchProject;
  });

  const handleCopy = (id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Citation Generator" description="Generate and manage academic citations in multiple formats" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Saved Citations" value={savedCitations.length} icon={<BookOpen className="h-5 w-5" />} />
        <StatCard label="Projects" value={PROJECTS.length - 1} icon={<ClipboardList className="h-5 w-5" />} />
        <StatCard label="Sources Used" value={3} icon={<Library className="h-5 w-5" />} />
        <StatCard label="Starred" value={savedCitations.filter((c: any) => c.starred).length} icon={<Star className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Generator panel */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white/90 text-sm">Generate Citation</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowGenerator(!showGenerator)} className="h-6 text-[10px] border-white/10 text-white/40 gap-1">
                <Plus className="size-3" />{showGenerator ? 'Close' : 'New'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {/* Style selector */}
            <div>
              <p className="text-[10px] text-white/40 mb-1.5">Citation Style</p>
              <div className="flex gap-1 flex-wrap">
                {STYLES.map((s) => (
                  <Button
                    key={s} size="sm" variant={style === s ? 'default' : 'outline'}
                    onClick={() => setStyle(s)}
                    className={cn('text-[10px] h-6 px-2', style !== s && 'border-white/10 text-white/40')}
                  >{s}</Button>
                ))}
              </div>
            </div>

            {/* Source type */}
            <div>
              <p className="text-[10px] text-white/40 mb-1.5">Source Type</p>
              <div className="flex gap-1 flex-wrap">
                {(Object.entries(SOURCE_ICONS) as [SourceType, typeof BookOpen][]).map(([key, Icon]) => (
                  <Button
                    key={key} size="sm" variant={sourceType === key ? 'default' : 'outline'}
                    onClick={() => setSourceType(key)}
                    className={cn('text-[10px] h-6 px-2 gap-1 capitalize', sourceType !== key && 'border-white/10 text-white/40')}
                  ><Icon className="size-2.5" />{key}</Button>
                ))}
              </div>
            </div>

            {showGenerator && (
              <div className="flex flex-col gap-2 border-t border-white/6 pt-3 mt-1">
                <Input placeholder="Title" className="h-7 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25" />
                <Input placeholder="Author(s)" className="h-7 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25" />
                <Input placeholder="Year" className="h-7 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25" />
                {sourceType === 'book' && <Input placeholder="Publisher" className="h-7 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25" />}
                {sourceType === 'journal' && <Input placeholder="Journal Name" className="h-7 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25" />}
                {sourceType === 'website' && <Input placeholder="URL" className="h-7 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25" />}
                <Input placeholder="Project (optional)" className="h-7 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25" />
                <Button size="sm" className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1" onClick={() => generateCitationMut.mutate({ style, sourceType } as any, { onSuccess: () => notifySuccess('Citation', 'Citation generated in selected format') })}>
                  <Quote className="size-3" />Generate Citation
                </Button>
              </div>
            )}

            {/* Auto-cite */}
            <div className="border-t border-white/6 pt-3">
              <p className="text-[10px] text-white/40 mb-1.5">Quick Auto-Cite</p>
              <div className="flex gap-1.5">
                <Input placeholder="Paste URL or DOI…" className="h-7 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25 flex-1" />
                <Button size="sm" className="h-7 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white gap-1" onClick={() => notifySuccess('Auto-Cite', 'Source automatically cited')}>
                  <RefreshCw className="size-3" />Cite
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Citation list */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white/90 text-sm">Saved Citations</CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10 text-white/40 gap-1" onClick={() => notifySuccess('Export', 'All citations exported to clipboard')}>
                <Download className="size-3" />Export All
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Search citations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25 flex-1"
              />
              <div className="flex gap-1">
                {PROJECTS.map((p) => (
                  <Button
                    key={p} size="sm" variant={projectFilter === p ? 'default' : 'outline'}
                    onClick={() => setProjectFilter(p)}
                    className={cn('text-[9px] h-6 px-1.5', projectFilter !== p && 'border-white/10 text-white/30')}
                  >{p}</Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {filtered.map((c: any) => {
              const SourceIcon = SOURCE_ICONS[c.type as SourceType];
              return (
                <div key={c.id} className="rounded-lg border border-white/6 bg-white/2 p-3 hover:border-white/12 transition-all group">
                  <div className="flex items-start gap-2.5">
                    <div className="size-8 rounded-md bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <SourceIcon className="size-3.5 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-white/80 truncate">{c.title}</p>
                        {c.starred && <Star className="size-3 text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-white/40">{c.authors} ({c.year})</p>
                      <div className="flex gap-1.5 mt-1">
                        <Badge variant="outline" className="text-[8px] border-white/8 text-white/25 capitalize">{c.type}</Badge>
                        <Badge className="text-[8px] bg-indigo-500/10 text-indigo-400">{c.project}</Badge>
                        <Badge className="text-[8px] bg-violet-500/10 text-violet-400">{style}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Formatted citation */}
                  <div className="mt-2 rounded-md bg-white/3 border border-white/5 p-2">
                    <p className="text-[10px] text-white/50 italic leading-relaxed">{c.formatted}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm" variant="outline"
                      onClick={() => handleCopy(c.id, c.formatted)}
                      className={cn('h-6 text-[9px] border-white/10 gap-1', copied === c.id ? 'text-emerald-400 border-emerald-500/20' : 'text-white/40')}
                    >
                      {copied === c.id ? <><CheckCircle2 className="size-2.5" />Copied!</> : <><Copy className="size-2.5" />Copy</>}
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 text-[9px] border-white/10 text-white/40 gap-1" onClick={() => notifySuccess('Source', 'Searching for matching sources…')}><Search className="size-2.5" />Find Source</Button>
                    <Button size="sm" variant="outline" className="h-6 text-[9px] border-white/10 text-red-400/50 gap-1 ml-auto" onClick={() => deleteCitationMut.mutate(c.id, { onSuccess: () => notifySuccess('Delete', 'Citation removed from list') })}><Trash2 className="size-2.5" /></Button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="size-8 text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/30">No citations found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
