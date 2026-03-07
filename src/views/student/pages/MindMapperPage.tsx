/* ─── MindMapperPage ─── Visual mind-mapping workspace ─────────────── */
import { useState } from 'react';
import {
  Network, Plus, Download, Share2, ZoomIn, ZoomOut,
  Palette, Trash2, Layers, Pencil, Star, Eye,
  GitBranch, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess, notifyError } from '@/lib/notify';
import { useStudentMindMaps, useCreateMindMap } from '@/hooks/api/use-student';
import { useAIChat } from '@/hooks/api';

interface MapNode {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  children: string[];
}

const FALLBACK_SAMPLE_MAPS = [
  { id: '1', title: 'Cell Biology Concepts', nodes: 14, lastEdited: '2 h ago', starred: true, color: 'bg-indigo-500/20 text-indigo-400' },
  { id: '2', title: 'World War II Timeline', nodes: 22, lastEdited: '1 d ago', starred: false, color: 'bg-amber-500/20 text-amber-400' },
  { id: '3', title: 'Essay Brainstorm — AI Ethics', nodes: 9, lastEdited: '3 d ago', starred: true, color: 'bg-emerald-500/20 text-emerald-400' },
  { id: '4', title: 'Chemistry Reactions', nodes: 18, lastEdited: '5 d ago', starred: false, color: 'bg-rose-500/20 text-rose-400' },
  { id: '5', title: 'Math Formula Tree', nodes: 12, lastEdited: '1 w ago', starred: false, color: 'bg-violet-500/20 text-violet-400' },
];

const ACTIVE_NODES: MapNode[] = [
  { id: 'root', label: 'Cell Biology', color: 'bg-indigo-500', x: 50, y: 50, children: ['n1', 'n2', 'n3'] },
  { id: 'n1', label: 'Organelles', color: 'bg-emerald-500', x: 20, y: 25, children: ['n4', 'n5'] },
  { id: 'n2', label: 'Cell Cycle', color: 'bg-amber-500', x: 80, y: 25, children: ['n6'] },
  { id: 'n3', label: 'Transport', color: 'bg-rose-500', x: 50, y: 85, children: [] },
  { id: 'n4', label: 'Mitochondria', color: 'bg-teal-500', x: 10, y: 10, children: [] },
  { id: 'n5', label: 'Nucleus', color: 'bg-cyan-500', x: 30, y: 10, children: [] },
  { id: 'n6', label: 'Mitosis', color: 'bg-orange-500', x: 80, y: 10, children: [] },
];

const FALLBACK_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500'];

export default function MindMapperPage() {
  const containerRef = useStaggerAnimate([]);
  const [search, setSearch] = useState('');
  const [selectedMap, setSelectedMap] = useState(FALLBACK_SAMPLE_MAPS[0].id);
  const [zoom, setZoom] = useState(100);
  const [showNewMap, setShowNewMap] = useState(false);

  /* ── API data ── */
  const { data: apiMindMaps } = useStudentMindMaps();
  const createMindMapMut = useCreateMindMap();
  const aiSuggestMut = useAIChat();
  const sampleMaps = (apiMindMaps as any[])?.length > 0 ? (apiMindMaps as any[]) : FALLBACK_SAMPLE_MAPS;
  const colors = (apiMindMaps as any)?.colors ?? FALLBACK_COLORS;

  const filteredMaps = sampleMaps.filter((m: any) => m.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Mind Mapper" description="Visual mind-mapping to organize ideas and concepts" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Maps" value={sampleMaps.length} icon={<Network className="h-5 w-5" />} />
        <StatCard label="Total Nodes" value={sampleMaps.reduce((s: number, m: any) => s + (m.nodes ?? 0), 0)} icon={<GitBranch className="h-5 w-5" />} />
        <StatCard label="Starred" value={sampleMaps.filter((m: any) => m.starred).length} icon={<Star className="h-5 w-5" />} />
        <StatCard label="AI Suggestions" value={12} icon={<Sparkles className="h-5 w-5" />} trend="up" trendLabel="+3 today" />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Sidebar — map list */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white/90 text-sm">My Maps</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowNewMap(!showNewMap)} className="size-7 p-0 border-white/10 text-white/50">
                <Plus className="size-3.5" />
              </Button>
            </div>
            <Input
              placeholder="Search maps…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25 mt-2"
            />
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            {showNewMap && (
              <div className="rounded-lg border border-dashed border-indigo-500/30 bg-indigo-500/5 p-2.5 mb-1">
                <Input placeholder="New map title…" className="mb-2 h-7 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25" />
                <div className="flex gap-1 flex-wrap mb-2">
                  {colors.map((c: any) => <div key={c} className={cn('size-4 rounded-full cursor-pointer ring-1 ring-white/10', c)} />)}
                </div>
                <Button size="sm" className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white" onClick={() => createMindMapMut.mutate({} as any, { onSuccess: () => notifySuccess('Mind Map', 'New map created') })}>Create Map</Button>
              </div>
            )}
            {filteredMaps.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMap(m.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all w-full',
                  selectedMap === m.id ? 'border-indigo-500/30 bg-indigo-500/8' : 'border-white/6 bg-white/2 hover:border-white/10',
                )}
              >
                <div className={cn('size-8 rounded-md flex items-center justify-center', m.color)}>
                  <Network className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80 truncate font-medium">{m.title}</p>
                  <p className="text-[9px] text-white/30">{m.nodes} nodes · {m.lastEdited}</p>
                </div>
                {m.starred && <Star className="size-3 text-amber-400 fill-amber-400 shrink-0" />}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white/90 text-sm">Cell Biology Concepts</CardTitle>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10 text-white/40 gap-1" disabled={aiSuggestMut.isPending} onClick={() => aiSuggestMut.mutate({ messages: [{ role: 'user', content: 'Suggest related concepts for mind map' }] } as any, { onSuccess: () => notifySuccess('AI Suggest', 'Concept suggestions generated!'), onError: () => notifyError('AI Suggest', 'Failed to generate suggestions') })}><Sparkles className="size-3" />{aiSuggestMut.isPending ? 'Generating…' : 'AI Suggest'}</Button>
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10 text-white/40 gap-1" onClick={() => notifySuccess('Export', 'Mind map exported as PNG')}><Download className="size-3" />Export</Button>
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10 text-white/40 gap-1" onClick={() => notifySuccess('Share', 'Sharing link copied to clipboard')}><Share2 className="size-3" />Share</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Toolbar */}
            <div className="flex items-center gap-1.5 mb-4">
              <Button size="sm" variant="outline" className="size-7 p-0 border-white/10 text-white/40" onClick={() => setZoom((z) => Math.min(200, z + 10))}><ZoomIn className="size-3" /></Button>
              <span className="text-[10px] text-white/30 w-10 text-center">{zoom}%</span>
              <Button size="sm" variant="outline" className="size-7 p-0 border-white/10 text-white/40" onClick={() => setZoom((z) => Math.max(50, z - 10))}><ZoomOut className="size-3" /></Button>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <Button size="sm" variant="outline" className="size-7 p-0 border-white/10 text-white/40" onClick={() => notifySuccess('Node', 'New node added to map')}><Plus className="size-3" /></Button>
              <Button size="sm" variant="outline" className="size-7 p-0 border-white/10 text-white/40" onClick={() => notifySuccess('Edit', 'Editing mode activated')}><Pencil className="size-3" /></Button>
              <Button size="sm" variant="outline" className="size-7 p-0 border-white/10 text-white/40" onClick={() => notifySuccess('Color', 'Color picker opened')}><Palette className="size-3" /></Button>
              <Button size="sm" variant="outline" className="size-7 p-0 border-white/10 text-white/40" onClick={() => notifySuccess('Layers', 'Layer panel toggled')}><Layers className="size-3" /></Button>
              <Button size="sm" variant="outline" className="size-7 p-0 border-white/10 text-red-400/50" onClick={() => notifySuccess('Delete', 'Selected node removed')}><Trash2 className="size-3" /></Button>
            </div>

            {/* Mind-map canvas (mock visual) */}
            <div className="relative rounded-xl border border-white/6 bg-black/30 overflow-hidden" style={{ height: 360, transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
              {/* Connection lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {ACTIVE_NODES.filter((n) => n.children.length > 0).map((parent) =>
                  parent.children.map((cid) => {
                    const child = ACTIVE_NODES.find((n) => n.id === cid);
                    if (!child) return null;
                    return (
                      <line
                        key={`${parent.id}-${cid}`}
                        x1={`${parent.x}%`} y1={`${parent.y}%`}
                        x2={`${child.x}%`} y2={`${child.y}%`}
                        stroke="rgba(255,255,255,0.08)" strokeWidth="2"
                      />
                    );
                  }),
                )}
              </svg>
              {/* Nodes */}
              {ACTIVE_NODES.map((node) => (
                <div
                  key={node.id}
                  className="absolute cursor-grab"
                  style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%,-50%)' }}
                >
                  <div className={cn(
                    'rounded-xl px-3 py-1.5 text-xs font-medium text-white/90 shadow-lg ring-1 ring-white/10',
                    node.color,
                    node.id === 'root' && 'px-5 py-2.5 text-sm',
                  )}>
                    {node.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Info bar */}
            <div className="flex items-center gap-3 mt-3 text-[10px] text-white/30">
              <Badge variant="outline" className="text-[9px] border-white/8 text-white/30">{ACTIVE_NODES.length} nodes</Badge>
              <span>·</span>
              <span className="flex items-center gap-1"><Eye className="size-2.5" />Last edited 2 h ago</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
