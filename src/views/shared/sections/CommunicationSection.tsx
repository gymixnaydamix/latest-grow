/* ─── CommunicationSection ─── Holographic email / social / community ─── */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Mail, Send, Star, Inbox, Globe, FileText,
  Settings, Plus, Search, Paperclip, MoreHorizontal,
  MessageSquare, Users, Hash, ThumbsUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useMessageThreads, useMessageThread, useCreateThread, useSendMessage, useBroadcasts, useTemplates } from '@/hooks/api';
import { useStudentCommunity } from '@/hooks/api/use-student';
import { Skeleton } from '@/components/ui/skeleton';

/* ── Student SubNav → Route mapping (split-page navigation) ───── */
const STUDENT_SUB_NAV_ROUTES: Record<string, string> = {
  compose: '/student/compose',
  inbox: '/student/inbox',
  starred: '/student/starred',
  general: '/student/general',
  announcements: '/student/community-announcements',
};

/* ── Student Header → Overview-page route mapping ──────────────── */
const STUDENT_HEADER_ROUTES: Record<string, string> = {
  email: '/student/email-overview',
  community: '/student/community-overview',
};

/* ── Demo data ─────────────────────────────────────────────────── */
const FALLBACK_SOCIAL_POSTS = [
  { platform: 'Facebook', content: 'Congratulations to our debate team for winning regionals! 🏆', likes: 234, comments: 45, time: '2 hours ago' },
  { platform: 'Instagram', content: 'Spring campus photos — our gardens are in full bloom 🌸', likes: 512, comments: 67, time: '5 hours ago' },
  { platform: 'Twitter/X', content: 'Registration is open for Summer STEM Camp 2025! Link in bio.', likes: 89, comments: 12, time: '1 day ago' },
];

const FALLBACK_COMMUNITY_CHANNELS = [
  { name: 'General', members: 450, messages: 1240, lastActive: '2 min ago', icon: Hash },
  { name: 'Announcements', members: 550, messages: 89, lastActive: '1 hour ago', icon: MessageSquare },
  { name: 'Staff Lounge', members: 45, messages: 567, lastActive: '15 min ago', icon: Users },
  { name: 'Parent Forum', members: 320, messages: 890, lastActive: '30 min ago', icon: Globe },
];

const FALLBACK_TEMPLATES = [
  { name: 'Welcome Letter', category: 'Onboarding', lastUsed: 'May 1, 2025' },
  { name: 'Absence Notification', category: 'Attendance', lastUsed: 'May 10, 2025' },
  { name: 'Report Card Cover', category: 'Academics', lastUsed: 'Apr 20, 2025' },
  { name: 'Event Invitation', category: 'Events', lastUsed: 'May 5, 2025' },
  { name: 'Fee Reminder', category: 'Finance', lastUsed: 'May 8, 2025' },
];

/* ── Main Export ───────────────────────────────────────────────── */
export function CommunicationSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);
  const role = useAuthStore((s) => s.user?.role);
  const navigate = useNavigate();

  // Student-specific: navigate to split pages when subnav/header selected
  useEffect(() => {
    if (role !== 'STUDENT') return;
    if (activeSubNav && STUDENT_SUB_NAV_ROUTES[activeSubNav]) {
      navigate(STUDENT_SUB_NAV_ROUTES[activeSubNav]);
    } else if (activeHeader && STUDENT_HEADER_ROUTES[activeHeader]) {
      navigate(STUDENT_HEADER_ROUTES[activeHeader]);
    }
  }, [activeSubNav, activeHeader, navigate, role]);

  const view = (() => {
    switch (activeHeader) {
      case 'email': return <EmailView subNav={activeSubNav} />;
      case 'social_media': return <SocialMediaView />;
      case 'community': return <CommunityView subNav={activeSubNav} />;
      case 'templates': return <TemplatesView />;
      case 'management': return <ManagementView subNav={activeSubNav} />;
      default: return <EmailView subNav={activeSubNav} />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── Sub-views ─────────────────────────────────────────────────── */

function EmailView({ subNav }: { subNav: string }) {
  const schoolId = useAuthStore((s) => s.schoolId);
  const { data: threads = [], isLoading } = useMessageThreads(schoolId);
  const createThread = useCreateThread(schoolId ?? '');

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const { data: selectedThread, isLoading: isDetailLoading } = useMessageThread(selectedThreadId);

  // Compose form state
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const toggleStar = (id: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const isStarredView = subNav === 'starred';
  const viewLabel = isStarredView ? 'Starred' : 'Inbox';
  const displayThreads = isStarredView ? threads.filter((t) => starredIds.has(t.id)) : threads;

  const handleSendCompose = () => {
    if (!composeSubject.trim() || !composeBody.trim()) return;
    createThread.mutate(
      { subject: composeSubject, participantIds: composeTo.split(',').map(s => s.trim()).filter(Boolean), body: composeBody },
      {
        onSuccess: () => {
          setComposeTo('');
          setComposeSubject('');
          setComposeBody('');
        },
      },
    );
  };

  if (subNav === 'compose') {
    return (
      <>
        <div data-animate>
          <h2 className="text-lg font-semibold text-white/90">Compose Email</h2>
          <p className="text-sm text-white/40">Send a new message</p>
        </div>
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/40">To</label>
              <Input value={composeTo} onChange={e => setComposeTo(e.target.value)} placeholder="Enter recipient email or select from contacts…" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/40">Subject</label>
              <Input value={composeSubject} onChange={e => setComposeSubject(e.target.value)} placeholder="Email subject" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/40">Message</label>
              <Textarea value={composeBody} onChange={e => setComposeBody(e.target.value)} placeholder="Write your message…" rows={10} className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:bg-white/5"><Paperclip className="mr-1 size-3" /> Attach</Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:bg-white/5">Save Draft</Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={handleSendCompose} disabled={createThread.isPending || !composeSubject.trim() || !composeBody.trim()}>
                  <Send className="mr-1 size-3" /> {createThread.isPending ? 'Sending…' : 'Send'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-between" data-animate>
          <div>
            <h2 className="text-lg font-semibold text-white/90">{viewLabel}</h2>
            <p className="text-sm text-white/40">Loading…</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-96 shrink-0 space-y-2" data-animate>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
          <Card className="flex-1 border-white/6 bg-white/3 backdrop-blur-xl" data-animate>
            <CardContent className="flex min-h-[400px] items-center justify-center">
              <Skeleton className="h-8 w-48" />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Empty state
  if (displayThreads.length === 0) {
    return (
      <>
        <div className="flex items-center justify-between" data-animate>
          <div>
            <h2 className="text-lg font-semibold text-white/90">{viewLabel}</h2>
            <p className="text-sm text-white/40">{isStarredView ? 'No starred messages' : '0 messages'}</p>
          </div>
          {!isStarredView && <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="mr-1 size-3" /> Compose</Button>}
        </div>
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex min-h-75 items-center justify-center">
            <div className="text-center text-white/30">
              {isStarredView ? <Star className="mx-auto mb-2 size-8" /> : <Inbox className="mx-auto mb-2 size-8" />}
              <p className="text-sm">{isStarredView ? 'Star messages to see them here' : 'No messages yet'}</p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <div>
          <h2 className="text-lg font-semibold text-white/90">{viewLabel}</h2>
          <p className="text-sm text-white/40">{displayThreads.length} messages</p>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="mr-1 size-3" /> Compose</Button>
      </div>

      <div className="flex gap-4">
        {/* Thread list */}
        <div className="w-96 shrink-0 space-y-1" data-animate>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
            <Input placeholder="Search messages…" className="pl-10 border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
          </div>
          {displayThreads.map((thread) => {
            const lastMsg = thread.messages?.[thread.messages.length - 1];
            const sender = lastMsg?.sender ?? thread.participants?.[0];
            const fromName = sender ? `${sender.firstName} ${sender.lastName}` : 'Unknown';
            const initials = fromName.split(' ').map((n: string) => n[0]).join('');
            return (
              <div key={thread.id} className="flex items-start gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStar(thread.id); }}
                  className={`mt-3 shrink-0 p-0.5 transition-colors ${starredIds.has(thread.id) ? 'text-amber-400' : 'text-white/15 hover:text-white/30'}`}
                >
                  <Star className="size-3" fill={starredIds.has(thread.id) ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all hover:bg-white/4 ${
                    selectedThreadId === thread.id ? 'border-indigo-500/30 bg-white/5' : 'border-white/6 bg-white/2'
                  }`}
                >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="text-[10px] bg-indigo-500/20 text-indigo-300">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate font-medium text-white/80">{fromName}</span>
                    <span className="text-[10px] text-white/30 shrink-0">{new Date(thread.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs truncate text-white/45">{thread.subject}</p>
                  {lastMsg && <p className="text-[10px] text-white/25 truncate">{lastMsg.body}</p>}
                </div>
              </button>
              </div>
            );
          })}
        </div>

        {/* Thread detail */}
        <ThreadDetailPane
          selectedThreadId={selectedThreadId}
          isDetailLoading={isDetailLoading}
          selectedThread={selectedThread}
          starredIds={starredIds}
          toggleStar={toggleStar}
        />
      </div>
    </>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function ThreadDetailPane({ selectedThreadId, isDetailLoading, selectedThread, starredIds, toggleStar }: {
  selectedThreadId: string | null;
  isDetailLoading: boolean;
  selectedThread: any;
  starredIds: Set<string>;
  toggleStar: (id: string) => void;
}) {
  const [replyBody, setReplyBody] = useState('');
  const sendReply = useSendMessage(selectedThreadId ?? '');

  const handleReply = () => {
    if (!replyBody.trim() || !selectedThreadId) return;
    sendReply.mutate({ body: replyBody }, {
      onSuccess: () => setReplyBody(''),
    });
  };

  return (
    <Card className="flex-1 border-white/6 bg-white/3 backdrop-blur-xl" data-animate>
      {selectedThreadId && isDetailLoading ? (
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
          <Separator className="bg-white/6" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      ) : selectedThread ? (
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white/85">{selectedThread.subject}</h3>
              <p className="text-sm text-white/40">
                {selectedThread.participants?.map((p: any) => `${p.firstName} ${p.lastName}`).join(', ')}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => toggleStar(selectedThread.id)} className={starredIds.has(selectedThread.id) ? 'text-amber-400 hover:text-amber-300' : 'text-white/30 hover:text-white/70'}><Star className="size-3" fill={starredIds.has(selectedThread.id) ? 'currentColor' : 'none'} /></Button>
              <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/70"><MoreHorizontal className="size-3" /></Button>
            </div>
          </div>
          <Separator className="bg-white/6" />
          <div className="space-y-3">
            {selectedThread.messages?.map((msg: any) => (
              <div key={msg.id} className="rounded-xl border border-white/6 bg-white/2 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white/75">
                    {msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown'}
                  </span>
                  <span className="text-[10px] text-white/30">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-white/50">{msg.body}</p>
              </div>
            ))}
          </div>
          <Separator className="bg-white/6" />
          <div className="space-y-2">
            <Textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} placeholder="Reply…" rows={3} className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:bg-white/5"><Paperclip className="mr-1 size-3" /> Attach</Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={handleReply} disabled={sendReply.isPending || !replyBody.trim()}>
                <Send className="mr-1 size-3" /> {sendReply.isPending ? 'Sending…' : 'Reply'}
              </Button>
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="flex min-h-100 items-center justify-center">
          <div className="text-center text-white/25">
            <Inbox className="mx-auto mb-2 size-8" />
            <p className="text-sm">Select a message to read</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function SocialMediaView() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const { data: broadcastsData } = useBroadcasts(schoolId);
  const socialPosts = (broadcastsData as any[])?.map((b: any) => ({
    platform: b.platform ?? b.audience?.[0] ?? 'School',
    content: b.body ?? b.title ?? '',
    likes: b.likes ?? 0,
    comments: b.comments ?? 0,
    time: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : 'Recently',
  })) ?? FALLBACK_SOCIAL_POSTS;

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <div>
          <h2 className="text-lg font-semibold text-white/90">Social Media</h2>
          <p className="text-sm text-white/40">Manage school social channels</p>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="mr-1 size-3" /> New Post</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {[
          { platform: 'Facebook', followers: '2,340', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { platform: 'Instagram', followers: '5,120', color: 'text-pink-400', bg: 'bg-pink-500/10' },
          { platform: 'Twitter/X', followers: '1,890', color: 'text-sky-400', bg: 'bg-sky-500/10' },
        ].map((p) => (
          <Card key={p.platform} className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className={`flex size-8 items-center justify-center rounded-lg ${p.bg}`}>
                  <Globe className={`size-4 ${p.color}`} />
                </div>
                <p className={`text-sm font-semibold ${p.color}`}>{p.platform}</p>
              </div>
              <p className="text-2xl font-bold mt-2 text-white/85">{p.followers}</p>
              <p className="text-xs text-white/35">Followers</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base text-white/85">Recent Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {socialPosts.map((post, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/2 p-3 transition-all hover:bg-white/4 hover:border-white/12">
              <Badge variant="outline" className="shrink-0 text-[10px] border-white/10 text-white/50">{post.platform}</Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70">{post.content}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-white/30">
                  <span className="flex items-center gap-1"><ThumbsUp className="size-3" /> {post.likes}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="size-3" /> {post.comments}</span>
                  <span>{post.time}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function CommunityView({ subNav }: { subNav: string }) {
  const { data: apiCommunity } = useStudentCommunity();
  const communityChannels = (apiCommunity as any[])?.map((ch: any) => ({
    name: ch.name ?? ch.title ?? 'Channel',
    members: ch.members ?? ch.memberCount ?? 0,
    messages: ch.messages ?? ch.postCount ?? 0,
    lastActive: ch.lastActive ?? 'recently',
    icon: Hash,
  })) ?? FALLBACK_COMMUNITY_CHANNELS;

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <div>
          <h2 className="text-lg font-semibold text-white/90">Community {subNav === 'announcements' ? '— Announcements' : '— General'}</h2>
          <p className="text-sm text-white/40">School community forums and channels</p>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="mr-1 size-3" /> New Channel</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2" data-animate>
        {communityChannels.map((ch) => (
          <Card key={ch.name} className="border-white/6 bg-white/3 backdrop-blur-xl cursor-pointer hover:border-white/12 hover:bg-white/4 transition-all">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <ch.icon className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/80"># {ch.name}</p>
                <p className="text-xs text-white/35">{ch.members} members · {ch.messages} messages</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">{ch.lastActive}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function TemplatesView() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const { data: apiTemplates } = useTemplates(schoolId);
  const templates = (apiTemplates as any[])?.map((t: any) => ({
    name: t.name ?? t.title ?? 'Template',
    category: t.category ?? t.type ?? 'General',
    lastUsed: t.lastUsed ?? t.updatedAt ?? 'Never',
  })) ?? FALLBACK_TEMPLATES;

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <div>
          <h2 className="text-lg font-semibold text-white/90">Message Templates</h2>
          <p className="text-sm text-white/40">Reusable email and notification templates</p>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500"><Plus className="mr-1 size-3" /> New Template</Button>
      </div>

      <div className="space-y-2" data-animate>
        {templates.map((t) => (
          <Card key={t.name} className="border-white/6 bg-white/3 backdrop-blur-xl cursor-pointer hover:border-white/12 hover:bg-white/4 transition-all">
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-white/30" />
                <div>
                  <p className="text-sm font-medium text-white/75">{t.name}</p>
                  <p className="text-xs text-white/35">Last used: {t.lastUsed}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] border-white/10 text-white/45">{t.category}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function ManagementView({ subNav }: { subNav: string }) {
  const label = subNav === 'social_mgmt' ? 'Social Media' : subNav === 'community_mgmt' ? 'Community' : 'Email';
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Communication Management — {label}</h2>
        <p className="text-sm text-white/40">Configure delivery settings, preferences, and rules</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
        {[
          { title: 'Delivery Rules', desc: 'Set auto-send schedules and retry policies', icon: Settings, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { title: 'Blocked Senders', desc: '12 blocked addresses', icon: Mail, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { title: 'Approval Workflow', desc: 'Require approval for mass emails', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((item) => (
          <Card key={item.title} className="border-white/6 bg-white/3 backdrop-blur-xl cursor-pointer hover:border-white/12 hover:bg-white/4 transition-all">
            <CardContent className="flex items-start gap-3 py-4">
              <div className={`flex size-9 items-center justify-center rounded-lg ${item.bg}`}>
                <item.icon className={`size-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">{item.title}</p>
                <p className="text-xs text-white/35">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
