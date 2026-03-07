/* ─── DeptMarketingPage ─── Marketing department requests ──────────── */
import { useState } from 'react';
import {
  Megaphone, Image, Video, Globe, FileText, Clock,
  CheckCircle2, XCircle, AlertTriangle, Send, Plus,
  PenTool, Share2, BarChart3, Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { useStudentDeptRequests } from '@/hooks/api/use-student';

type ReqStatus = 'pending' | 'approved' | 'denied' | 'in-review';

interface MarketingRequest {
  id: string;
  title: string;
  type: 'event_promo' | 'social_media' | 'poster_design' | 'club_feature' | 'photo_video' | 'website_update' | 'other';
  status: ReqStatus;
  submittedAt: string;
  updatedAt: string;
  description: string;
  response?: string;
  priority?: 'low' | 'medium' | 'high';
}

const STATUS_CFG: Record<ReqStatus, { Icon: typeof Clock; cls: string; bg: string; label: string }> = {
  pending:     { Icon: Clock,        cls: 'text-amber-400',   bg: 'bg-amber-400/10',   label: 'Pending' },
  'in-review': { Icon: AlertTriangle, cls: 'text-orange-400', bg: 'bg-orange-400/10',  label: 'In Review' },
  approved:    { Icon: CheckCircle2, cls: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Approved' },
  denied:      { Icon: XCircle,       cls: 'text-red-400',    bg: 'bg-red-400/10',     label: 'Denied' },
};

const TYPE_CFG: Record<MarketingRequest['type'], { label: string; icon: typeof Megaphone; color: string }> = {
  event_promo:    { label: 'Event Promo', icon: Megaphone, color: 'text-pink-400' },
  social_media:   { label: 'Social Media', icon: Share2, color: 'text-sky-400' },
  poster_design:  { label: 'Poster / Design', icon: Palette, color: 'text-violet-400' },
  club_feature:   { label: 'Club Feature', icon: PenTool, color: 'text-emerald-400' },
  photo_video:    { label: 'Photo / Video', icon: Video, color: 'text-amber-400' },
  website_update: { label: 'Website Update', icon: Globe, color: 'text-cyan-400' },
  other:          { label: 'Other', icon: FileText, color: 'text-white/50' },
};

const PRIORITY_CFG = {
  low:    { cls: 'text-white/40 bg-white/5', label: 'Low' },
  medium: { cls: 'text-amber-400 bg-amber-400/10', label: 'Medium' },
  high:   { cls: 'text-red-400 bg-red-400/10', label: 'High' },
};

const FALLBACK_MARKETING_REQUESTS: MarketingRequest[] = [
  { id: '1', title: 'Spring Dance Poster', type: 'poster_design', status: 'approved', priority: 'high', submittedAt: '2026-02-15', updatedAt: '2026-02-17', description: 'Need a poster design for the Spring Dance on April 5th. Theme: Enchanted Garden.', response: '3 design concepts sent to your email. Please select your preferred option.' },
  { id: '2', title: 'Robotics Club Instagram Feature', type: 'club_feature', status: 'in-review', priority: 'medium', submittedAt: '2026-02-22', updatedAt: '2026-02-24', description: 'Robotics Club won regionals. Requesting a feature post on the school Instagram.' },
  { id: '3', title: 'Science Fair Promo Video', type: 'photo_video', status: 'pending', priority: 'high', submittedAt: '2026-03-01', updatedAt: '2026-03-01', description: 'Requesting 30-second promo video for the upcoming Science Fair. Event date: March 28.' },
  { id: '4', title: 'Drama Club Show Promotion', type: 'event_promo', status: 'approved', priority: 'medium', submittedAt: '2026-02-08', updatedAt: '2026-02-12', description: 'Promote upcoming drama production "Romeo & Juliet" across all school channels.', response: 'Campaign live! Social posts scheduled for next 2 weeks. Posters distributed to hallways.' },
  { id: '5', title: 'Student Council Election Social Posts', type: 'social_media', status: 'denied', priority: 'low', submittedAt: '2026-02-20', updatedAt: '2026-02-22', description: 'Want dedicated Instagram stories for each candidate in the student council election.', response: 'We cannot feature individual candidates per fairness policy. We can post a generic "Vote Today" campaign instead.' },
  { id: '6', title: 'Update Club Directory Page', type: 'website_update', status: 'pending', priority: 'low', submittedAt: '2026-03-02', updatedAt: '2026-03-02', description: 'The school website club directory is outdated. Several new clubs need to be added with descriptions and meeting times.' },
];

export default function DeptMarketingPage() {
  const containerRef = useStaggerAnimate([]);
  const [filter, setFilter] = useState<'all' | ReqStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | MarketingRequest['type']>('all');
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');

  /* ── API data ── */
  const { data: apiDeptReqs } = useStudentDeptRequests();
  const marketingReqs = ((apiDeptReqs as any[]) ?? []).filter((r: any) => r.department?.toLowerCase() === 'marketing');

  const filtered = (marketingReqs.length > 0 ? marketingReqs : FALLBACK_MARKETING_REQUESTS)
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) => typeFilter === 'all' || r.type === typeFilter)
    .filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()));

  const mktItems = marketingReqs.length > 0 ? marketingReqs : FALLBACK_MARKETING_REQUESTS;
  const pending = mktItems.filter((r: any) => r.status === 'pending').length;
  const approved = mktItems.filter((r: any) => r.status === 'approved').length;
  const highPriority = mktItems.filter((r: any) => r.priority === 'high').length;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Marketing Requests" description="Submit promotional and design requests to the marketing department" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Requests" value={mktItems.length} icon={<Megaphone className="h-5 w-5" />} />
        <StatCard label="Pending" value={pending} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Approved" value={approved} icon={<CheckCircle2 className="h-5 w-5" />} trend="up" />
        <StatCard label="High Priority" value={highPriority} icon={<BarChart3 className="h-5 w-5" />} trend={highPriority > 0 ? 'up' : 'neutral'} />
      </div>

      {/* Toolbar */}
      <div data-animate className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'in-review', 'approved', 'denied'] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? 'default' : 'outline'}
              onClick={() => setFilter(s)}
              className={cn('text-xs h-7 capitalize', filter !== s && 'border-white/10 text-white/50')}
            >
              {s === 'all' ? 'All' : STATUS_CFG[s].label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            className="h-8 w-48 bg-white/4 border-white/8 text-white/80 text-xs"
          />
          <Button
            onClick={() => setShowNew(!showNew)}
            className="gap-1.5 bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-400/20 text-xs h-8"
          >
            <Plus className="size-3" />New
          </Button>
        </div>
      </div>

      {/* Type filter chips */}
      <div data-animate className="flex flex-wrap gap-2">
        {(['all', ...Object.keys(TYPE_CFG)] as const).map((t) => {
          const cfg = t !== 'all' ? TYPE_CFG[t as MarketingRequest['type']] : null;
          return (
            <Badge
              key={t}
              onClick={() => setTypeFilter(t as typeof typeFilter)}
              className={cn(
                'cursor-pointer text-[10px] transition-colors gap-1',
                typeFilter === t
                  ? 'bg-pink-500/20 text-pink-300 border-pink-400/30'
                  : 'bg-white/4 text-white/40 border-white/8 hover:text-white/60',
              )}
            >
              {cfg && <cfg.icon className={cn('size-3', cfg.color)} />}
              {t === 'all' ? 'All Types' : cfg!.label}
            </Badge>
          );
        })}
      </div>

      {/* New request form */}
      {showNew && (
        <Card data-animate className="border-pink-400/20 bg-pink-500/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white/90 text-sm flex items-center gap-2">
              <Send className="size-4 text-pink-400" />New Marketing Request
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 font-medium">Title</label>
                <Input placeholder="Request title…" className="bg-white/4 border-white/8 text-white/80 text-xs h-8" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 font-medium">Type</label>
                <select className="h-8 rounded-md border border-white/8 bg-white/4 px-3 text-xs text-white/60 outline-none">
                  {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 font-medium">Priority</label>
                <select className="h-8 rounded-md border border-white/8 bg-white/4 px-3 text-xs text-white/60 outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 font-medium">Description</label>
              <textarea rows={3} placeholder="Describe your promotional / design request…" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/80 placeholder:text-white/25 outline-none resize-none focus:border-pink-400/40" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 font-medium">Attachments (optional)</label>
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/2 p-3">
                <Image className="size-4 text-white/30" />
                <span className="text-[10px] text-white/30">Drag & drop images, logos, or reference files</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNew(false)} className="text-xs border-white/10 text-white/50">Cancel</Button>
              <Button size="sm" onClick={() => notifySuccess('Request', 'Marketing request submitted')} className="text-xs bg-pink-500/20 text-pink-300 border border-pink-400/20 gap-1"><Send className="size-3" />Submit</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests list */}
      <div data-animate className="flex flex-col gap-3">
        {!filtered.length && (
          <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="py-10 text-center text-white/30 text-sm">No requests match your filters.</CardContent>
          </Card>
        )}
        {filtered.map((req: any) => {
          const s = STATUS_CFG[req.status as ReqStatus];
          const tc = TYPE_CFG[req.type as keyof typeof TYPE_CFG];
          const pc = req.priority ? PRIORITY_CFG[req.priority as keyof typeof PRIORITY_CFG] : null;
          return (
            <Card key={req.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-colors">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <tc.icon className={cn('size-4 shrink-0', tc.color)} />
                    <div>
                      <p className="text-sm font-semibold text-white/80">{req.title}</p>
                      <p className="text-[10px] text-white/30">{tc.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pc && <Badge className={cn('border-0 text-[9px]', pc.cls)}>{pc.label}</Badge>}
                    <Badge className={cn('border-0 text-[9px]', s.bg, s.cls)}>{s.label}</Badge>
                  </div>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{req.description}</p>
                {req.response && (
                  <div className="rounded-lg border border-white/6 bg-white/2 p-3 flex gap-2">
                    <FileText className="size-3.5 text-pink-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/50 leading-relaxed">{req.response}</p>
                  </div>
                )}
                <div className="flex items-center gap-4 text-[10px] text-white/25">
                  <span>Submitted: {new Date(req.submittedAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(req.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
