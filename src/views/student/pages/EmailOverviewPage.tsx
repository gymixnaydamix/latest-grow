/* ─── EmailOverviewPage ─── Header-level overview of Email section ──── */
import {
  Mail, Inbox, Send, Star, FileText, Clock,
  TrendingUp, PenSquare, Archive,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { useAuthStore } from '@/store/auth.store';
import { useMessageThreads } from '@/hooks/api';
import { useStudentMessages } from '@/hooks/api/use-student';
import { Skeleton } from '@/components/ui/skeleton';
import { notifySuccess } from '@/lib/notify';

const FALLBACK_QUICK_ACTIONS = [
  { title: 'Compose New Email', desc: 'Draft and send a message', icon: PenSquare, color: 'bg-indigo-500/20 text-indigo-400', href: 'compose' },
  { title: 'View Inbox', desc: 'Read and reply to messages', icon: Inbox, color: 'bg-emerald-500/20 text-emerald-400', href: 'inbox' },
  { title: 'Starred Messages', desc: 'Important saved messages', icon: Star, color: 'bg-yellow-500/20 text-yellow-400', href: 'starred' },
];

const FALLBACK_RECENT_ACTIVITY = [
  { action: 'Received email from Mrs. Rodriguez', time: '30 min ago', icon: Mail },
  { action: 'Replied to Dr. Chen\'s feedback', time: '2 hours ago', icon: Send },
  { action: 'Starred message from School Office', time: '5 hours ago', icon: Star },
  { action: 'Archived old assignment notifications', time: '1 day ago', icon: Archive },
  { action: 'Sent meeting request to Counselor', time: '2 days ago', icon: Send },
];

export default function EmailOverviewPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const schoolId = useAuthStore((s) => s.schoolId);
  const { data: threads = [], isLoading } = useMessageThreads(schoolId);
  const { data: apiStudentMessages } = useStudentMessages();
  // Derive recent activity from real threads when available
  const derivedActivity = threads.slice(0, 5).map((t) => {
    const sender = t.participants?.[0];
    const name = sender ? `${sender.firstName} ${sender.lastName}` : 'Someone';
    return { action: `Received email from ${name}`, time: new Date(t.createdAt).toLocaleDateString(), icon: Mail };
  });
  const sentThisWeek = (apiStudentMessages as any)?.sentThisWeek ?? (threads.filter((t) => (t as any).direction === 'sent').length || 8);
  const QUICK_ACTIONS = FALLBACK_QUICK_ACTIONS;
  const RECENT_ACTIVITY = derivedActivity.length > 0 ? derivedActivity : FALLBACK_RECENT_ACTIVITY;

  const unreadCount = threads.filter((t) => !t.isRead).length;
  const starredCount = threads.filter((t) => t.isStarred).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-4">
          <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Email" description="Manage your school email communications" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Messages" value={threads.length} icon={<Mail className="h-5 w-5" />} />
        <StatCard label="Unread" value={unreadCount} icon={<Inbox className="h-5 w-5" />} accentColor="text-amber-400" />
        <StatCard label="Starred" value={starredCount} icon={<Star className="h-5 w-5" />} accentColor="text-yellow-400" />
        <StatCard label="Sent This Week" value={sentThisWeek} icon={<Send className="h-5 w-5" />} trend="up" />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {QUICK_ACTIONS.map((action) => (
          <Card key={action.title} className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 hover:bg-white/5 transition-all cursor-pointer group" onClick={() => notifySuccess('Email', 'Opening email action…')}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex size-12 items-center justify-center rounded-xl ${action.color} shrink-0 transition-transform group-hover:scale-110`}>
                <action.icon className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/85">{action.title}</p>
                <p className="text-xs text-white/40">{action.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/85">Recent Email Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-3 hover:bg-white/4 transition-colors">
                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 shrink-0">
                  <item.icon className="size-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60 truncate">{item.action}</p>
                  <p className="text-[10px] text-white/25">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Storage & tips */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/85">Email Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { tip: 'Use clear subject lines so teachers can prioritize your messages', icon: FileText, color: 'text-indigo-400' },
              { tip: 'Star important messages to find them quickly later', icon: Star, color: 'text-yellow-400' },
              { tip: 'Check your inbox daily for assignment updates', icon: Clock, color: 'text-emerald-400' },
              { tip: 'Use templates for common requests like absence notes', icon: TrendingUp, color: 'text-violet-400' },
            ].map((t) => (
              <div key={t.tip} className="flex items-start gap-3 rounded-lg border border-white/6 bg-white/2 p-3">
                <t.icon className={`size-4 shrink-0 mt-0.5 ${t.color}`} />
                <p className="text-xs text-white/50">{t.tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
