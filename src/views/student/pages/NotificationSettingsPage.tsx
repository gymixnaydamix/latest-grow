/* ─── NotificationSettingsPage ─── Full-page student notification settings ── */
import { useState } from 'react';
import {
  Bell, BellRing, BellOff, Mail, Smartphone,
  MessageSquare, Clock, Calendar, BookOpen,
  AlertTriangle, CreditCard, Users, Megaphone,
  Volume2, VolumeX, CheckCircle2, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess } from '@/lib/notify';
import { useStudentNotifications, useMarkAllNotificationsRead } from '@/hooks/api/use-student';

type ChannelStatus = 'enabled' | 'disabled';

interface NotifChannel {
  id: string;
  label: string;
  desc: string;
  icon: typeof Bell;
  color: string;
  status: ChannelStatus;
}

const CHANNELS: NotifChannel[] = [
  { id: 'email', label: 'Email Notifications', desc: 'Course updates, announcements, reports', icon: Mail, color: 'bg-indigo-500/10 text-indigo-400', status: 'enabled' },
  { id: 'push', label: 'Push Notifications', desc: 'Instant alerts on your device', icon: BellRing, color: 'bg-amber-500/10 text-amber-400', status: 'enabled' },
  { id: 'sms', label: 'SMS Notifications', desc: 'Critical alerts via text message', icon: Smartphone, color: 'bg-rose-500/10 text-rose-400', status: 'disabled' },
  { id: 'in_app', label: 'In-App Notifications', desc: 'Bell icon inside the platform', icon: Bell, color: 'bg-emerald-500/10 text-emerald-400', status: 'enabled' },
];

interface NotifCategory {
  id: string;
  label: string;
  desc: string;
  icon: typeof Bell;
  color: string;
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
}

const CATEGORIES: NotifCategory[] = [
  { id: 'system', label: 'System Updates', desc: 'Platform maintenance and feature announcements', icon: Settings, color: 'bg-blue-500/10 text-blue-400', enabled: true, priority: 'high' },
  { id: 'courses', label: 'Course Announcements', desc: 'New content, instructor messages, course changes', icon: BookOpen, color: 'bg-indigo-500/10 text-indigo-400', enabled: true, priority: 'high' },
  { id: 'assignments', label: 'Assignment Reminders', desc: 'Due dates, submissions, grading updates', icon: Clock, color: 'bg-amber-500/10 text-amber-400', enabled: true, priority: 'high' },
  { id: 'schedule', label: 'Schedule Changes', desc: 'Class time changes, cancellations, room updates', icon: Calendar, color: 'bg-cyan-500/10 text-cyan-400', enabled: true, priority: 'medium' },
  { id: 'messages', label: 'Messages', desc: 'Direct messages from teachers and classmates', icon: MessageSquare, color: 'bg-violet-500/10 text-violet-400', enabled: true, priority: 'medium' },
  { id: 'billing', label: 'Billing Alerts', desc: 'Payment reminders, invoice updates', icon: CreditCard, color: 'bg-emerald-500/10 text-emerald-400', enabled: true, priority: 'medium' },
  { id: 'community', label: 'Community Activity', desc: 'Forum replies, club updates, events', icon: Users, color: 'bg-pink-500/10 text-pink-400', enabled: false, priority: 'low' },
  { id: 'marketing', label: 'Marketing & Promotions', desc: 'New features, special offers, newsletters', icon: Megaphone, color: 'bg-orange-500/10 text-orange-400', enabled: false, priority: 'low' },
];

const FALLBACK_RECENT_NOTIFS = [
  { title: 'Math Assignment Due', desc: 'Chapter 5 homework due in 2 days', time: '1h ago', type: 'assignment', read: false },
  { title: 'New Grade Posted', desc: 'English Literature — Essay: A-', time: '3h ago', type: 'grade', read: false },
  { title: 'Schedule Change', desc: 'Physics lab moved to Room 204', time: '5h ago', type: 'schedule', read: true },
  { title: 'System Maintenance', desc: 'Scheduled downtime Saturday 2-4 AM', time: '1d ago', type: 'system', read: true },
  { title: 'New Message', desc: 'From Ms. Johnson about project proposal', time: '1d ago', type: 'message', read: true },
];

const QUIET_HOURS = { start: '10:00 PM', end: '7:00 AM', enabled: true };

export default function NotificationSettingsPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [channels, setChannels] = useState(CHANNELS);
  const [categories, setCategories] = useState(CATEGORIES);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(QUIET_HOURS.enabled);
  const [mutedUntil, setMutedUntil] = useState<Date | null>(null);
  const [clearedHistory, setClearedHistory] = useState(false);

  const isMuted = mutedUntil !== null && mutedUntil > new Date();

  /* ── API data ── */
  const { data: apiNotifs } = useStudentNotifications();
  const markAllReadMut = useMarkAllNotificationsRead();
  const recentNotifs = (apiNotifs as any[])?.length > 0 ? (apiNotifs as any[]) : FALLBACK_RECENT_NOTIFS;
  const notifsData = clearedHistory ? [] : recentNotifs;

  const enabledChannels = channels.filter((c) => c.status === 'enabled').length;
  const enabledCategories = categories.filter((c) => c.enabled).length;
  const unreadCount = notifsData.filter((n: any) => !n.read).length;

  const toggleChannel = (id: string) => {
    setChannels((prev) => prev.map((c) =>
      c.id === id ? { ...c, status: c.status === 'enabled' ? 'disabled' as const : 'enabled' as const } : c
    ));
  };

  const toggleCategory = (id: string) => {
    setCategories((prev) => prev.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    ));
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Notification Settings" description="Choose how and when you receive notifications" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Active Channels" value={enabledChannels} suffix={`/${channels.length}`} icon={<BellRing className="h-5 w-5" />} accentColor="#6366f1" />
        <StatCard label="Categories On" value={enabledCategories} suffix={`/${categories.length}`} icon={<Bell className="h-5 w-5" />} accentColor="#10b981" />
        <StatCard label="Unread" value={unreadCount} icon={<AlertTriangle className="h-5 w-5" />} accentColor="#f59e0b" />
        <StatCard label="Quiet Hours" value={quietHoursEnabled ? 1 : 0} suffix={quietHoursEnabled ? ' Active' : ' Off'} icon={<VolumeX className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main – Channels + Categories */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Notification Channels */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Volume2 className="size-4 text-indigo-400" />Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {channels.map((ch) => (
                <div key={ch.id} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 p-3 hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex size-9 items-center justify-center rounded-lg', ch.color)}>
                      <ch.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/75">{ch.label}</p>
                      <p className="text-[9px] text-white/30">{ch.desc}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleChannel(ch.id)}
                    className={cn(
                      'text-[9px] h-7 px-3',
                      ch.status === 'enabled'
                        ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        : 'border-white/10 text-white/30 hover:bg-white/5',
                    )}
                  >
                    {ch.status === 'enabled' ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notification Categories */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Bell className="size-4 text-amber-400" />Notification Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 p-3 hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex size-8 items-center justify-center rounded-lg', cat.color)}>
                      <cat.icon className="size-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-white/70">{cat.label}</p>
                      <p className="text-[8px] text-white/25">{cat.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      'text-[7px] border-0',
                      cat.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                      cat.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-white/5 text-white/25',
                    )}>
                      {cat.priority}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleCategory(cat.id)}
                      className={cn('size-7 p-0', cat.enabled ? 'text-emerald-400' : 'text-white/15')}
                    >
                      {cat.enabled ? <BellRing className="size-3.5" /> : <BellOff className="size-3.5" />}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Quiet Hours */}
          <Card data-animate className="border-violet-500/15 bg-violet-500/5 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-violet-400 text-sm flex items-center gap-1.5">
                <VolumeX className="size-4" />Quiet Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-violet-300/50 mb-3">Silence all non-critical notifications during these hours</p>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <div className="flex-1 rounded-lg border border-white/6 bg-white/3 p-2 text-center">
                  <p className="text-[8px] text-white/25">From</p>
                  <p className="text-xs font-semibold text-violet-400">{QUIET_HOURS.start}</p>
                </div>
                <span className="text-white/15">→</span>
                <div className="flex-1 rounded-lg border border-white/6 bg-white/3 p-2 text-center">
                  <p className="text-[8px] text-white/25">Until</p>
                  <p className="text-xs font-semibold text-violet-400">{QUIET_HOURS.end}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3 text-[10px] h-7 border-violet-500/20 text-violet-400" onClick={() => { setQuietHoursEnabled(prev => !prev); notifySuccess('Quiet Hours', quietHoursEnabled ? 'Quiet hours disabled' : 'Quiet hours enabled'); }}>
                {quietHoursEnabled ? 'Disable' : 'Enable'} Quiet Hours
              </Button>
            </CardContent>
          </Card>

          {/* Recent notifications */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Clock className="size-4 text-cyan-400" />Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {notifsData.map((n: any, i: number) => (
                <div key={i} className={cn(
                  'flex items-start gap-2.5 rounded-lg border border-white/6 bg-white/2 p-2.5',
                  !n.read && 'border-indigo-500/15 bg-indigo-500/5',
                )}>
                  <div className="mt-0.5">
                    {!n.read
                      ? <div className="size-2 rounded-full bg-indigo-400" />
                      : <CheckCircle2 className="size-2.5 text-white/15" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-[10px] font-medium', n.read ? 'text-white/40' : 'text-white/70')}>{n.title}</p>
                    <p className="text-[8px] text-white/20 truncate">{n.desc}</p>
                    <p className="text-[7px] text-white/15 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="p-3 flex flex-col gap-2">
              <Button size="sm" variant="outline" className="w-full text-[10px] h-7 border-white/10 text-white/40 gap-1 justify-start" onClick={() => markAllReadMut.mutate(undefined as any, { onSuccess: () => notifySuccess('Notifications', 'All notifications marked as read') })}>
                <CheckCircle2 className="size-3" />Mark all as read
              </Button>
              <Button size="sm" variant="outline" className="w-full text-[10px] h-7 border-white/10 text-white/40 gap-1 justify-start" onClick={() => { if (isMuted) { setMutedUntil(null); notifySuccess('Unmuted', 'Notifications resumed'); } else { setMutedUntil(new Date(Date.now() + 60 * 60 * 1000)); notifySuccess('Muted', 'All notifications muted for 1 hour'); } }}>
                <BellOff className="size-3" />{isMuted ? 'Unmute notifications' : 'Mute all for 1 hour'}
              </Button>
              <Button size="sm" variant="outline" className="w-full text-[10px] h-7 border-red-500/15 text-red-400/60 gap-1 justify-start" disabled={clearedHistory} onClick={() => { setClearedHistory(true); notifySuccess('Cleared', 'Notification history cleared'); }}>
                <AlertTriangle className="size-3" />{clearedHistory ? 'History cleared' : 'Clear notification history'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
