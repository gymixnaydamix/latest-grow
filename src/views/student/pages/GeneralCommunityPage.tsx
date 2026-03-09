/* ─── GeneralCommunityPage ─── Full-page general community channel ─── */
import { useState } from 'react';
import {
  Hash, Send, ThumbsUp, MessageSquare, Users,
  Image, Smile, AtSign, Pin,
  TrendingUp, Bookmark,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess } from '@/lib/notify';
import { useStudentCommunity, useCreateCommunityPost, useLikeCommunityPost, useBookmarkCommunityPost } from '@/hooks/api/use-student';

interface Post {
  id: string;
  author: string;
  initials: string;
  role: string;
  content: string;
  time: string;
  likes: number;
  replies: number;
  pinned?: boolean;
  color: string;
}

const POSTS: Post[] = [
  { id: '1', author: 'School Admin', initials: 'SA', role: 'Admin', content: '📢 Reminder: Spirit Week starts next Monday! Dress-up themes will be posted on the bulletin board by Friday. Let\'s show our school spirit!', time: '1 hour ago', likes: 45, replies: 12, pinned: true, color: 'bg-amber-500/20 text-amber-400' },
  { id: '2', author: 'Emma Wilson', initials: 'EW', role: 'Student', content: 'Anyone else struggling with the Chemistry homework? Want to form a study group for this weekend? 📚', time: '2 hours ago', likes: 23, replies: 8, color: 'bg-indigo-500/20 text-indigo-400' },
  { id: '3', author: 'Mr. Kim', initials: 'MK', role: 'Teacher', content: 'Coding club meeting moved to Thursday this week, same room (Lab 301). We\'ll be working on our hackathon project! 💻', time: '3 hours ago', likes: 18, replies: 5, color: 'bg-emerald-500/20 text-emerald-400' },
  { id: '4', author: 'Jake Martinez', initials: 'JM', role: 'Student', content: 'Lost my blue water bottle in the cafeteria during lunch. Has anyone seen it? It has stickers on it 😅', time: '4 hours ago', likes: 7, replies: 3, color: 'bg-violet-500/20 text-violet-400' },
  { id: '5', author: 'Library Staff', initials: 'LS', role: 'Staff', content: 'New books arrived! We\'ve added 50+ new titles to our collection, including popular YA fiction and SAT prep guides. Come check them out!', time: '5 hours ago', likes: 32, replies: 6, color: 'bg-cyan-500/20 text-cyan-400' },
  { id: '6', author: 'Sarah Chen', initials: 'SC', role: 'Student', content: 'Just got my AP Chemistry score back — passed with a 5! Thank you Dr. Chen for an amazing class this year! 🎉', time: '6 hours ago', likes: 89, replies: 15, color: 'bg-rose-500/20 text-rose-400' },
];

const FALLBACK_TRENDING_TOPICS = [
  { tag: '#SpiritWeek', posts: 34 },
  { tag: '#StudyGroup', posts: 18 },
  { tag: '#CodingClub', posts: 12 },
  { tag: '#APExams', posts: 45 },
  { tag: '#SummerPlans', posts: 22 },
];

const FALLBACK_ACTIVE_MEMBERS = [
  { name: 'Emma W.', initials: 'EW', posts: 24 },
  { name: 'Jake M.', initials: 'JM', posts: 18 },
  { name: 'Sarah C.', initials: 'SC', posts: 15 },
  { name: 'Alex T.', initials: 'AT', posts: 12 },
];

export default function GeneralCommunityPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [message, setMessage] = useState('');

  /* ── API data ── */
  const { data: apiCommunity } = useStudentCommunity();
  const createPostMut = useCreateCommunityPost();
  const likePostMut = useLikeCommunityPost();
  const bookmarkMut = useBookmarkCommunityPost();
  const communityData = (apiCommunity as any) ?? {};
  const communityPosts = (communityData?.posts as any[])?.length > 0 ? (communityData.posts as any[]) : POSTS;
  const trendingTopics = (communityData?.trendingTopics as any[])?.length > 0 ? (communityData.trendingTopics as any[]) : FALLBACK_TRENDING_TOPICS;
  const activeMembers = (communityData?.activeMembers as any[])?.length > 0 ? (communityData.activeMembers as any[]) : FALLBACK_ACTIVE_MEMBERS;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="General Channel" description="Open discussion for all students and staff" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Members" value={(communityData?.totalMembers as number) ?? activeMembers.length} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Posts Today" value={communityPosts.length} icon={<MessageSquare className="h-5 w-5" />} trend="up" />
        <StatCard label="Active Now" value={(communityData?.activeNow as number) ?? 0} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Pinned" value={communityPosts.filter((p: any) => p.pinned).length} icon={<Pin className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* Feed */}
        <div className="space-y-4">
          {/* Compose */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="text-[10px] bg-indigo-500/20 text-indigo-400">Me</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share something with the community…"
                    className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[Image, Smile, AtSign, Hash].map((Icon, i) => (
                        <Button key={i} variant="ghost" size="sm" className="h-7 w-7 p-0 text-white/25 hover:text-white/50 hover:bg-white/5" onClick={() => notifySuccess('Compose', 'Attachment added')}>
                          <Icon className="size-3.5" />
                        </Button>
                      ))}
                    </div>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs" onClick={() => createPostMut.mutate({ content: message } as any, { onSuccess: () => { notifySuccess('Posted', 'Your post has been shared'); setMessage(''); } })}>
                      <Send className="mr-1 size-3" /> Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {communityPosts.map((post: any) => (
            <Card key={post.id} data-animate className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/10 transition-all">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className={`text-[10px] ${post.color}`}>{post.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white/80">{post.author}</span>
                      <Badge variant="outline" className="text-[9px] border-white/10 text-white/35">{post.role}</Badge>
                      {post.pinned && <Badge className="text-[9px] border-0 bg-amber-500/10 text-amber-400">📌 Pinned</Badge>}
                      <span className="text-[10px] text-white/25">{post.time}</span>
                    </div>
                    <p className="text-sm text-white/60 mt-1.5 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-white/30 hover:text-indigo-400 transition-colors" onClick={() => likePostMut.mutate(post.id, { onSuccess: () => notifySuccess('Liked', 'Post liked') })}>
                        <ThumbsUp className="size-3.5" />
                        <span className="text-xs">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-white/30 hover:text-indigo-400 transition-colors" onClick={() => notifySuccess('Reply', 'Reply thread opened')}>
                        <MessageSquare className="size-3.5" />
                        <span className="text-xs">{post.replies}</span>
                      </button>
                      <button className="text-white/30 hover:text-indigo-400 transition-colors" onClick={() => bookmarkMut.mutate(post.id, { onSuccess: () => notifySuccess('Saved', 'Post bookmarked') })}>
                        <Bookmark className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trending */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-white/60">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {trendingTopics.map((t: any) => (
                <div key={t.tag} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 px-2.5 py-1.5 hover:bg-white/4 cursor-pointer transition-colors">
                  <span className="text-xs font-medium text-indigo-400">{t.tag}</span>
                  <span className="text-[10px] text-white/30">{t.posts} posts</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active members */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-white/60">Most Active</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {activeMembers.map((m: any, i: number) => (
                <div key={m.name} className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/2 px-2.5 py-1.5">
                  <span className="text-[10px] font-bold text-white/25 w-4">#{i + 1}</span>
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[8px] bg-indigo-500/20 text-indigo-400">{m.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-white/60 flex-1">{m.name}</span>
                  <Badge variant="outline" className="text-[9px] border-white/10 text-white/30">{m.posts}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-white/60 mb-2">Community Guidelines</p>
              <ul className="space-y-1 text-[10px] text-white/35">
                <li>• Be respectful and kind to others</li>
                <li>• Keep discussions school-appropriate</li>
                <li>• No spam or self-promotion</li>
                <li>• Report any concerns to staff</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
