/* ─── ResourceLibraryView ─── Resources, AI finder, uploads ────── */
import { Plus, FileText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ResourceLibraryView({ subNav }: { subNav: string }) {
  if (subNav === 'create_new') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">Create Resource</h2></div>
        <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">Title</label>
            <Input placeholder="Resource title…" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/60">Type</label>
            <div className="flex gap-2">
              {['Worksheet', 'Video', 'Presentation', 'Assessment'].map((t) => (
                <Badge key={t} variant="outline" className="cursor-pointer border-white/10 text-white/50 hover:bg-white/5 text-[10px]">{t}</Badge>
              ))}
            </div>
          </div>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">Create</Button>
        </div>
      </>
    );
  }

  if (subNav === 'ai_content_finder') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">AI Content Finder</h2></div>
        <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 space-y-4">
          <p className="text-sm text-white/40">Describe what you're looking for and AI will find relevant educational resources.</p>
          <Input placeholder="Find resources about quadratic equations for 10th graders…" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white"><Sparkles className="mr-1 size-3" /> Search with AI</Button>
        </div>
      </>
    );
  }

  const label = subNav === 'school_library' ? 'School Library' : 'My Resources';
  const resources = [
    { title: 'Quadratic Formula Worksheet', type: 'Worksheet', size: '2.4 MB', downloads: 45, color: 'bg-blue-500/10 text-blue-400' },
    { title: 'Geometry Video — Proofs', type: 'Video', size: '85 MB', downloads: 120, color: 'bg-rose-500/10 text-rose-400' },
    { title: 'Statistics Unit Test', type: 'Assessment', size: '1.1 MB', downloads: 28, color: 'bg-amber-500/10 text-amber-400' },
    { title: 'Calculus Review Slides', type: 'Presentation', size: '4.8 MB', downloads: 65, color: 'bg-violet-500/10 text-violet-400' },
  ];

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <h2 className="text-lg font-semibold text-white/90">{label}</h2>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white"><Plus className="mr-1 size-3" /> Upload</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
        {resources.map((r) => (
          <div key={r.title} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors">
            <div className={`flex size-8 items-center justify-center rounded-lg ${r.color}`}>
              <FileText className="size-4" />
            </div>
            <p className="text-sm font-semibold text-white/85 mt-2">{r.title}</p>
            <p className="text-xs text-white/40">{r.type} · {r.size}</p>
            <p className="text-[10px] text-white/30 mt-1">{r.downloads} downloads</p>
          </div>
        ))}
      </div>
    </>
  );
}
