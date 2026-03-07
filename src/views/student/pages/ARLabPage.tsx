/* ─── ARLabPage ─── Augmented Reality learning lab ─────────────────── */
import { useState } from 'react';
import {
  Camera, Smartphone, Box, Globe, Layers, Download,
  Play, RotateCcw, Eye, Star, Clock, Sparkles,
  ChevronRight, Maximize2, Heart,
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

const FALLBACK_AR_MODELS = [
  { id: '1', title: 'Human Heart', subject: 'Biology', type: '3D Model', views: 2340, rating: 4.9, favorited: true, thumbnail: 'heart' },
  { id: '2', title: 'Solar System', subject: 'Astronomy', type: 'AR Scene', views: 3120, rating: 4.8, favorited: false, thumbnail: 'solar' },
  { id: '3', title: 'Molecule Viewer', subject: 'Chemistry', type: '3D Model', views: 1876, rating: 4.7, favorited: true, thumbnail: 'molecule' },
  { id: '4', title: 'Tectonic Plates', subject: 'Geography', type: 'AR Scene', views: 987, rating: 4.5, favorited: false, thumbnail: 'tectonic' },
  { id: '5', title: 'Ancient Rome', subject: 'History', type: 'AR World', views: 1543, rating: 4.8, favorited: false, thumbnail: 'rome' },
  { id: '6', title: 'Pythagorean Theorem', subject: 'Math', type: '3D Proof', views: 1234, rating: 4.6, favorited: true, thumbnail: 'math' },
];

const SUBJECT_COLORS: Record<string, string> = {
  Biology: 'bg-emerald-500/20 text-emerald-400',
  Astronomy: 'bg-violet-500/20 text-violet-400',
  Chemistry: 'bg-indigo-500/20 text-indigo-400',
  Geography: 'bg-amber-500/20 text-amber-400',
  History: 'bg-rose-500/20 text-rose-400',
  Math: 'bg-cyan-500/20 text-cyan-400',
};

const THUMB_ICONS: Record<string, typeof Camera> = {
  heart: Heart, solar: Globe, molecule: Box, tectonic: Layers, rome: Globe, math: Box,
};

const FALLBACK_RECENT_SESSIONS = [
  { model: 'Human Heart', duration: '12 min', date: '1 d ago', interaction: 14 },
  { model: 'Solar System', duration: '8 min', date: '2 d ago', interaction: 9 },
  { model: 'Molecule Viewer', duration: '15 min', date: '4 d ago', interaction: 21 },
];

export default function ARLabPage() {
  const containerRef = useStaggerAnimate([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const AR_MODELS = FALLBACK_AR_MODELS;
  const RECENT_SESSIONS = FALLBACK_RECENT_SESSIONS;

  const filtered = AR_MODELS.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || m.subject === filter;
    return matchSearch && matchFilter;
  });

  const subjects = ['all', ...new Set(AR_MODELS.map((m) => m.subject))];

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="AR Lab" description="Explore concepts through augmented reality and 3D models" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Models Explored" value={12} icon={<Box className="h-5 w-5" />} />
        <StatCard label="AR Sessions" value={28} icon={<Camera className="h-5 w-5" />} trend="up" />
        <StatCard label="Time in AR" value={3.2} suffix="h" icon={<Clock className="h-5 w-5" />} decimals={1} />
        <StatCard label="Favorites" value={AR_MODELS.filter((m) => m.favorited).length} icon={<Heart className="h-5 w-5" />} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap" data-animate>
        <Input
          placeholder="Search models…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-48 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25"
        />
        <div className="flex gap-1.5">
          {subjects.map((s) => (
            <Button
              key={s} size="sm" variant={filter === s ? 'default' : 'outline'}
              onClick={() => setFilter(s)}
              className={cn('text-[10px] capitalize h-7', filter !== s && 'border-white/10 text-white/40')}
            >{s}</Button>
          ))}
        </div>
      </div>

      {!activeModel ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Model grid */}
          <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((model) => {
              const ThumbIcon = THUMB_ICONS[model.thumbnail] || Box;
              return (
                <Card key={model.id} data-animate className="border-white/6 bg-white/3 backdrop-blur-xl group hover:border-white/12 transition-all cursor-pointer">
                  <CardContent className="p-0">
                    {/* Thumbnail area */}
                    <div className="relative h-28 bg-gradient-to-br from-white/3 to-white/1 rounded-t-xl flex items-center justify-center">
                      <ThumbIcon className="size-10 text-white/10" />
                      <Badge className={cn('absolute top-2 left-2 text-[8px]', SUBJECT_COLORS[model.subject])}>{model.subject}</Badge>
                      {model.favorited && <Heart className="absolute top-2 right-2 size-3 text-rose-400 fill-rose-400" />}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-t-xl">
                        <Button size="sm" className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white gap-1 h-7" onClick={() => setActiveModel(model.id)}>
                          <Play className="size-3" />View
                        </Button>
                        <Button size="sm" variant="outline" className="text-[10px] border-white/20 text-white/60 h-7 gap-1" onClick={() => notifySuccess('AR Camera', 'Camera initialized')}>
                          <Camera className="size-3" />AR
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-white/80">{model.title}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[9px] text-white/30">
                        <Badge variant="outline" className="text-[8px] border-white/6 text-white/25">{model.type}</Badge>
                        <span className="ml-auto flex items-center gap-0.5"><Star className="size-2.5 text-amber-400" />{model.rating}</span>
                        <span className="flex items-center gap-0.5"><Eye className="size-2.5" />{model.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-4">
            {/* Device info */}
            <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-white/90 text-sm">AR Setup</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5 text-xs text-white/50">
                <div className="flex items-center gap-2">
                  <Smartphone className="size-4 text-indigo-400" />
                  <span>Point camera at any flat surface to place models</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize2 className="size-4 text-emerald-400" />
                  <span>Pinch to resize, drag to rotate</span>
                </div>
                <Button size="sm" className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1 mt-1" onClick={() => notifySuccess('AR Camera', 'Launching augmented reality camera…')}>
                  <Camera className="size-3" />Launch AR Camera
                </Button>
              </CardContent>
            </Card>

            {/* Recent sessions */}
            <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-white/90 text-sm">Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {RECENT_SESSIONS.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 p-2">
                    <Box className="size-4 text-indigo-400/50 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-white/60 truncate">{s.model}</p>
                      <p className="text-[8px] text-white/25">{s.duration} · {s.interaction} interactions</p>
                    </div>
                    <span className="text-[8px] text-white/20">{s.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Active model viewer */
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white/90 text-sm">Human Heart — 3D Viewer</CardTitle>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10 text-white/40 gap-1" onClick={() => notifySuccess('AR Mode', 'Switching to AR view')}><Camera className="size-3" />AR Mode</Button>
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10 text-white/40 gap-1" onClick={() => notifySuccess('Download', '3D model downloaded')}><Download className="size-3" />Download</Button>
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10 text-white/40" onClick={() => setActiveModel(null)}><RotateCcw className="size-3" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {/* 3D View */}
            <div className="lg:col-span-2 rounded-xl border border-white/6 bg-black/30 flex items-center justify-center" style={{ minHeight: 360 }}>
              <div className="text-center">
                <Heart className="size-16 text-rose-400/30 mx-auto mb-3" />
                <p className="text-sm text-white/40">3D Model Viewer</p>
                <p className="text-[10px] text-white/20">Click & drag to rotate · Scroll to zoom</p>
              </div>
            </div>

            {/* Info panel */}
            <div className="flex flex-col gap-3">
              <div className="text-xs text-white/50 space-y-2">
                <h4 className="text-white/80 font-medium">About this model</h4>
                <p>Explore the four chambers of the human heart, valves, and major blood vessels in detail.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="text-xs text-white/60 font-medium">Landmarks</h4>
                {['Left Ventricle', 'Right Atrium', 'Aorta', 'Pulmonary Artery', 'Mitral Valve'].map((l) => (
                  <button key={l} className="flex items-center gap-2 rounded-md border border-white/6 bg-white/2 p-2 text-[10px] text-white/50 hover:border-indigo-500/30 transition-all" onClick={() => notifySuccess('Landmark', l)}>
                    <ChevronRight className="size-3 text-indigo-400" />
                    {l}
                  </button>
                ))}
              </div>
              <Badge className="text-[9px] bg-emerald-500/10 text-emerald-400 self-start"><Sparkles className="size-2.5 mr-0.5" />AI: Ask me about this model</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
