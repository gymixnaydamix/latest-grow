/* ─── VisualizerPage ─── AI concept visualizer ─────────────────────── */
import { useState } from 'react';
import { Sparkles, Network, GitBranch, Clock, Layers, ZoomIn, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';

type VizType = 'mindmap' | 'flowchart' | 'timeline' | 'diagram';

const VIZ_MODES: { key: VizType; label: string; icon: typeof Network; color: string }[] = [
  { key: 'mindmap', label: 'Mind Map', icon: Network, color: 'text-violet-400 bg-violet-400/10' },
  { key: 'flowchart', label: 'Flowchart', icon: GitBranch, color: 'text-blue-400 bg-blue-400/10' },
  { key: 'timeline', label: 'Timeline', icon: Clock, color: 'text-emerald-400 bg-emerald-400/10' },
  { key: 'diagram', label: 'Diagram', icon: Layers, color: 'text-amber-400 bg-amber-400/10' },
];

const FALLBACK_RECENT = [
  { concept: 'Photosynthesis process', type: 'flowchart' as VizType, date: '2 hours ago' },
  { concept: 'French Revolution causes', type: 'timeline' as VizType, date: 'Yesterday' },
  { concept: 'Cell structure', type: 'diagram' as VizType, date: '3 days ago' },
  { concept: 'Quadratic formula derivation', type: 'mindmap' as VizType, date: 'Last week' },
];

export default function VisualizerPage() {
  const containerRef = useStaggerAnimate([]);
  const [concept, setConcept] = useState('');
  const [vizType, setVizType] = useState<VizType>('mindmap');
  const [generated, setGenerated] = useState(false);
  const RECENT = FALLBACK_RECENT;

  const generate = () => {
    if (concept.trim()) setGenerated(true);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader title="Concept Visualizer" description="Turn any concept into visual learning aids with AI" />

      {/* Input area */}
      <Card data-animate>
        <CardContent className="pt-5 pb-4 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Photosynthesis, Quadratic Formula, French Revolution…"
              className="flex-1 h-11"
              value={concept}
              onChange={(e) => { setConcept(e.target.value); setGenerated(false); }}
            />
            <Button className="h-11 gap-1.5" onClick={generate} disabled={!concept.trim()}>
              <Sparkles className="size-4" /> Visualize
            </Button>
          </div>

          {/* Mode selector */}
          <div className="flex gap-2">
            {VIZ_MODES.map((m) => (
              <Button
                key={m.key}
                variant={vizType === m.key ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={() => { setVizType(m.key); setGenerated(false); }}
              >
                <m.icon className="size-3" /> {m.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visualization output */}
      {generated ? (
        <Card data-animate>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{VIZ_MODES.find((m) => m.key === vizType)?.label}: {concept}</CardTitle>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="size-8" onClick={() => notifySuccess('Zoom', 'Zoomed in')}><ZoomIn className="size-4" /></Button>
              <Button variant="outline" size="icon" className="size-8" onClick={() => notifySuccess('Download', 'Visualization exported')}><Download className="size-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 rounded-xl border border-dashed border-primary/20 bg-primary/5 flex items-center justify-center">
              <div className="text-center space-y-3">
                {(() => { const m = VIZ_MODES.find((v) => v.key === vizType)!; return <m.icon className={cn('size-16 mx-auto opacity-40', m.color.split(' ')[0])} />; })()}
                <p className="text-sm font-medium text-muted-foreground">AI-generated {vizType} for "{concept}"</p>
                <p className="text-xs text-muted-foreground/60">Connect to AI service to render real visualizations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Recent visualizations */
        <div data-animate>
          <h3 className="text-base font-semibold mb-3">Recent Visualizations</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {RECENT.map((r) => {
              const m = VIZ_MODES.find((v) => v.key === r.type)!;
              return (
                <Card key={r.concept} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => { setConcept(r.concept); setVizType(r.type); }}>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('size-10 rounded-lg flex items-center justify-center', m.color.split(' ')[1])}>
                        <m.icon className={cn('size-5', m.color.split(' ')[0])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{r.concept}</p>
                        <p className="text-[10px] text-muted-foreground">{m.label} · {r.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
