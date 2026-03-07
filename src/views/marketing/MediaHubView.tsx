/* ─── MediaHubView ─── Marketing media & content hub ──────────────── */
import { useState } from 'react';
import { Image, Video, FileText, Upload, Search, Eye, Download, Heart, Share2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUploadDocument } from '@/hooks/api/use-upload';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { FileUploader } from '@/components/features/FileUploader';

type MediaType = 'image' | 'video' | 'document' | 'social';

interface MediaAsset {
  id: string;
  title: string;
  type: MediaType;
  campaign: string;
  date: string;
  dimensions?: string;
  duration?: string;
  size: string;
  views: number;
  likes: number;
  status: 'published' | 'draft' | 'scheduled';
}

const TYPE_CFG: Record<MediaType, { Icon: typeof Image; cls: string; bg: string }> = {
  image: { Icon: Image, cls: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  video: { Icon: Video, cls: 'text-red-400', bg: 'bg-red-400/10' },
  document: { Icon: FileText, cls: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  social: { Icon: Share2, cls: 'text-violet-400', bg: 'bg-violet-400/10' },
};

const MOCK_ASSETS: MediaAsset[] = [
  { id: '1', title: 'Spring Open House Banner', type: 'image', campaign: 'Spring Enrollment', date: '2025-03-14', dimensions: '1920×1080', size: '2.4 MB', views: 1250, likes: 89, status: 'published' },
  { id: '2', title: 'Campus Tour Video', type: 'video', campaign: 'Virtual Tours', date: '2025-03-10', duration: '4:32', size: '156 MB', views: 3400, likes: 245, status: 'published' },
  { id: '3', title: 'Enrollment Brochure 2025', type: 'document', campaign: 'Spring Enrollment', date: '2025-03-12', size: '8.7 MB', views: 890, likes: 0, status: 'published' },
  { id: '4', title: 'Instagram Story — Science Fair', type: 'social', campaign: 'Social Media', date: '2025-03-13', dimensions: '1080×1920', size: '1.2 MB', views: 4200, likes: 312, status: 'published' },
  { id: '5', title: 'Summer Camp Promo', type: 'video', campaign: 'Summer Programs', date: '2025-03-15', duration: '1:45', size: '45 MB', views: 0, likes: 0, status: 'scheduled' },
  { id: '6', title: 'New Facility Photos', type: 'image', campaign: 'Campus Updates', date: '2025-03-11', dimensions: '4096×2731', size: '12 MB', views: 567, likes: 42, status: 'published' },
  { id: '7', title: 'Parent Testimonial Video', type: 'video', campaign: 'Testimonials', date: '2025-03-09', duration: '2:15', size: '78 MB', views: 2100, likes: 178, status: 'published' },
  { id: '8', title: 'Facebook Ad — Fall Registration', type: 'social', campaign: 'Fall Enrollment', date: '2025-03-15', dimensions: '1200×628', size: '0.8 MB', views: 0, likes: 0, status: 'draft' },
];

const STATUS_CLR = { published: 'bg-emerald-400/10 text-emerald-400', draft: 'bg-white/5 text-white/40', scheduled: 'bg-amber-400/10 text-amber-400' };

export default function MediaHubView() {
  const containerRef = useStaggerAnimate([]);
  const uploadDoc = useUploadDocument();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | MediaType>('all');

  const filtered = MOCK_ASSETS.filter((a) => {
    const t = typeFilter === 'all' || a.type === typeFilter;
    const q = a.title.toLowerCase().includes(search.toLowerCase()) || a.campaign.toLowerCase().includes(search.toLowerCase());
    return t && q;
  });

  const totalViews = MOCK_ASSETS.reduce((s, a) => s + a.views, 0);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div data-animate className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="size-5 text-violet-400" />
          <h2 className="text-lg font-bold text-white/90">Media Hub</h2>
          <Badge className="border-0 bg-white/5 text-white/40 text-[10px]">{MOCK_ASSETS.length} assets</Badge>
        </div>
        <Button className="gap-1.5 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-400/20 text-xs h-8">
          <Upload className="size-3" />Upload
        </Button>
      </div>

      {/* Stats */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl"><CardContent className="flex flex-col gap-1 p-4"><span className="text-[10px] text-white/40 uppercase">Total Views</span><span className="text-xl font-bold text-white/90 tabular-nums">{totalViews.toLocaleString()}</span></CardContent></Card>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl"><CardContent className="flex flex-col gap-1 p-4"><span className="text-[10px] text-white/40 uppercase">Published</span><span className="text-xl font-bold text-emerald-400">{MOCK_ASSETS.filter((a) => a.status === 'published').length}</span></CardContent></Card>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl"><CardContent className="flex flex-col gap-1 p-4"><span className="text-[10px] text-white/40 uppercase">Scheduled</span><span className="text-xl font-bold text-amber-400">{MOCK_ASSETS.filter((a) => a.status === 'scheduled').length}</span></CardContent></Card>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl"><CardContent className="flex flex-col gap-1 p-4"><span className="text-[10px] text-white/40 uppercase">Drafts</span><span className="text-xl font-bold text-white/50">{MOCK_ASSETS.filter((a) => a.status === 'draft').length}</span></CardContent></Card>
      </div>

      {/* Filter */}
      <div data-animate className="flex gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets…" className="pl-9 bg-white/4 border-white/8 text-white/80 text-xs h-8" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | MediaType)} className="rounded-md border border-white/8 bg-white/4 px-2 py-1 text-[11px] text-white/60 outline-none">
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
          <option value="social">Social</option>
        </select>
      </div>

      {/* Upload Zone */}
      <div data-animate>
        <FileUploader
          accept="image/*,video/*,application/pdf"
          multiple
          maxSizeMB={200}
          onUpload={(files) => {
            files.forEach((file) => uploadDoc.mutate({ file, category: 'media' }));
          }}
        />
      </div>

      {/* Grid */}
      <div data-animate className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((asset) => {
          const tc = TYPE_CFG[asset.type];
          return (
            <Card key={asset.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-colors group cursor-pointer">
              {/* Thumbnail */}
              <div className={cn('relative h-32 rounded-t-xl flex items-center justify-center', tc.bg)}>
                <tc.Icon className={cn('size-10 opacity-30', tc.cls)} />
                {asset.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-10 rounded-full bg-black/50 flex items-center justify-center"><Play className="size-5 text-white fill-white" /></div>
                  </div>
                )}
                <Badge className={cn('absolute top-2 right-2 border-0 text-[8px] capitalize', STATUS_CLR[asset.status])}>{asset.status}</Badge>
              </div>
              <CardContent className="flex flex-col gap-2 p-3">
                <p className="text-xs font-semibold text-white/80 truncate">{asset.title}</p>
                <p className="text-[10px] text-white/30">{asset.campaign}</p>
                <div className="flex items-center justify-between text-[10px] text-white/25">
                  <span>{asset.dimensions || asset.duration || asset.size}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Eye className="size-2.5" />{asset.views}</span>
                    <span className="flex items-center gap-0.5"><Heart className="size-2.5" />{asset.likes}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" className="flex-1 text-[10px] h-6 border-white/8 text-white/50 gap-0.5"><Eye className="size-2.5" />View</Button>
                  <Button variant="outline" size="sm" className="flex-1 text-[10px] h-6 border-white/8 text-white/50 gap-0.5"><Download className="size-2.5" />DL</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
