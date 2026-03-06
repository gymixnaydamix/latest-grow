/* ─── ActivityFeed ─── Real-time activity feed component ──── */
import { cn } from '@/lib/utils';
import { Clock, FileText, MessageSquare, Star, Bell, Upload, CheckCircle2 } from 'lucide-react';

export interface ActivityItem {
  id: string;
  user: { name: string; avatar?: string };
  action: string;
  target?: string;
  timestamp: string;
  type?: 'default' | 'message' | 'upload' | 'grade' | 'star' | 'notification' | 'approval';
}

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
  className?: string;
  compact?: boolean;
}

const TYPE_ICON: Record<NonNullable<ActivityItem['type']>, { icon: React.ReactNode; color: string }> = {
  default: { icon: <FileText className="size-3" />, color: 'text-white/30 bg-white/5' },
  message: { icon: <MessageSquare className="size-3" />, color: 'text-indigo-400 bg-indigo-400/10' },
  upload: { icon: <Upload className="size-3" />, color: 'text-violet-400 bg-violet-400/10' },
  grade: { icon: <CheckCircle2 className="size-3" />, color: 'text-emerald-400 bg-emerald-400/10' },
  star: { icon: <Star className="size-3" />, color: 'text-amber-400 bg-amber-400/10' },
  notification: { icon: <Bell className="size-3" />, color: 'text-rose-400 bg-rose-400/10' },
  approval: { icon: <CheckCircle2 className="size-3" />, color: 'text-emerald-400 bg-emerald-400/10' },
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const AVATAR_COLORS = ['bg-indigo-400/20 text-indigo-400', 'bg-emerald-400/20 text-emerald-400', 'bg-violet-400/20 text-violet-400', 'bg-amber-400/20 text-amber-400', 'bg-rose-400/20 text-rose-400'];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function ActivityFeed({ items, maxItems, className, compact = false }: ActivityFeedProps) {
  const visible = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div className={cn('flex flex-col', className)}>
      {visible.map((item, i) => {
        const t = TYPE_ICON[item.type ?? 'default'];
        const colorIdx = item.user.name.length % AVATAR_COLORS.length;
        return (
          <div key={item.id} className={cn('flex gap-3 group', compact ? 'py-1.5' : 'py-2.5', i !== visible.length - 1 && 'border-b border-white/4')}>
            {/* Avatar */}
            {!compact && (
              <div className="shrink-0 relative">
                {item.user.avatar ? (
                  <img src={item.user.avatar} alt={item.user.name} className="size-7 rounded-full object-cover" />
                ) : (
                  <div className={cn('size-7 rounded-full flex items-center justify-center text-[10px] font-bold', AVATAR_COLORS[colorIdx])}>
                    {getInitials(item.user.name)}
                  </div>
                )}
                <div className={cn('absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full flex items-center justify-center', t.color)}>
                  {t.icon}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={cn('text-white/60', compact ? 'text-[10px]' : 'text-xs')}>
                <span className="font-medium text-white/80">{item.user.name}</span>{' '}
                {item.action}
                {item.target && <span className="text-indigo-400/70"> {item.target}</span>}
              </p>
            </div>

            {/* Time */}
            <span className={cn('shrink-0 flex items-center gap-1 text-white/20', compact ? 'text-[9px]' : 'text-[10px]')}>
              <Clock className="size-2.5" />{timeAgo(item.timestamp)}
            </span>
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="text-center py-6">
          <Clock className="size-5 text-white/10 mx-auto mb-2" />
          <p className="text-xs text-white/20">No recent activity</p>
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
