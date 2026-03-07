/* ─── CommunityOverviewPage ─── Header-level overview for Community ─── */
import {
  Hash, Megaphone, Users, MessageSquare,
  TrendingUp, Bell, Award, Calendar,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess } from '@/lib/notify';
import { useStudentCommunity } from '@/hooks/api/use-student';

const CHANNELS = [
  { name: 'General', desc: 'Open discussion for all students and staff', members: 450, messages: 1240, icon: Hash, color: 'bg-indigo-500/20 text-indigo-400', active: '2 min ago' },
  { name: 'Announcements', desc: 'Official school announcements and updates', members: 550, messages: 89, icon: Megaphone, color: 'bg-amber-500/20 text-amber-400', active: '1 hour ago' },
];

const RECENT_POSTS = [
  { author: 'School Admin', channel: 'Announcements', preview: 'Final exam schedule released — check your portal', time: '1h ago', initials: 'SA', color: 'bg-amber-500/20 text-amber-400' },
  { author: 'Emma Wilson', channel: 'General', preview: 'Anyone want to form a Chemistry study group?', time: '2h ago', initials: 'EW', color: 'bg-indigo-500/20 text-indigo-400' },
  { author: 'Mr. Kim', channel: 'General', preview: 'Coding club meeting moved to Thursday', time: '3h ago', initials: 'MK', color: 'bg-emerald-500/20 text-emerald-400' },
  { author: 'Student Council', channel: 'Announcements', preview: 'Prom tickets on sale now!', time: '5h ago', initials: 'SC', color: 'bg-violet-500/20 text-violet-400' },
  { author: 'Library Staff', channel: 'General', preview: 'New books arrived — 50+ new titles!', time: '6h ago', initials: 'LS', color: 'bg-cyan-500/20 text-cyan-400' },
];

const TRENDING = [
  { tag: '#SpiritWeek', posts: 34 },
  { tag: '#APExams', posts: 45 },
  { tag: '#StudyGroup', posts: 18 },
];

export default function CommunityOverviewPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);

  /* ── API data ── */
  const { data: _apiCommunity } = useStudentCommunity();
  const recentPosts = (_apiCommunity as any[]) ?? [];

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Community" description="Connect with classmates, teachers, and staff" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Community Members" value={550} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Posts Today" value={24} icon={<MessageSquare className="h-5 w-5" />} trend="up" trendLabel="+12%" />
        <StatCard label="Channels" value={2} icon={<Hash className="h-5 w-5" />} />
        <StatCard label="Active Now" value={38} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      {/* Channels */}
      <div data-animate>
        <h3 className="text-sm font-semibold text-white/70 mb-3">Your Channels</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((ch) => (
            <Card key={ch.name} className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 hover:bg-white/5 transition-all cursor-pointer group" onClick={() => notifySuccess('Channel', 'Opening channel…')}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`flex size-12 items-center justify-center rounded-xl ${ch.color} shrink-0 transition-transform group-hover:scale-110`}>
                    <ch.icon className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/85"># {ch.name}</p>
                      <ChevronRight className="size-4 text-white/20 group-hover:text-white/40 transition-colors" />
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{ch.desc}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                      <span className="flex items-center gap-1"><Users className="size-3" /> {ch.members}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="size-3" /> {ch.messages}</span>
                      <span>Active {ch.active}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Recent posts */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/85">Recent Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(recentPosts.length > 0 ? recentPosts : RECENT_POSTS).map((post: any, i: number) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-white/6 bg-white/2 p-3 hover:bg-white/4 transition-colors cursor-pointer" onClick={() => notifySuccess('Post', 'Opening post…')}>
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className={`text-[10px] ${post.color}`}>{post.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white/70">{post.author}</span>
                    <Badge variant="outline" className="text-[8px] border-white/10 text-white/30">{post.channel}</Badge>
                    <span className="text-[10px] text-white/25">{post.time}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5 truncate">{post.preview}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trending */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-white/60">Trending</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {TRENDING.map((t) => (
                <div key={t.tag} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 px-2.5 py-1.5 hover:bg-white/4 cursor-pointer transition-colors" onClick={() => notifySuccess('Topic', 'Opening trending topic…')}>
                  <span className="text-xs font-medium text-indigo-400">{t.tag}</span>
                  <span className="text-[10px] text-white/30">{t.posts} posts</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-white/60">Community Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Community Guidelines', icon: Award, color: 'text-amber-400' },
                { label: 'Report an Issue', icon: Bell, color: 'text-rose-400' },
                { label: 'Upcoming Events', icon: Calendar, color: 'text-indigo-400' },
              ].map((link) => (
                <div key={link.label} className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/2 px-2.5 py-2 hover:bg-white/4 cursor-pointer transition-colors" onClick={() => notifySuccess('Community', 'Opening community info…')}>
                  <link.icon className={`size-3.5 ${link.color}`} />
                  <span className="text-xs text-white/55">{link.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
