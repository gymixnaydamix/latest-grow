import { useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Check, CheckCheck, ExternalLink, Trash2,
  Info, AlertTriangle, BookOpen, MessageSquare, Megaphone,
  GraduationCap, ClipboardList, Cog, Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNotificationStore } from '@/store/notification.store';
import { useAuthStore } from '@/store/auth.store';
import { useParentPortalStore } from '@/store/parent-portal.store';
import type { NotificationType } from '@root/types';
import {
  useDeleteParentV2Notification,
  useMarkAllParentV2NotificationsRead,
  useMarkParentV2NotificationsRead,
  useParentV2Notifications,
} from '@/hooks/api/use-parent-v2';
import { withParentRouteContext } from '@/views/parent/parent-navigation';

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string; bg: string }> = {
  INFO: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  SUCCESS: { icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ERROR: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ANNOUNCEMENT: { icon: Megaphone, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  GRADE: { icon: GraduationCap, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ATTENDANCE: { icon: ClipboardList, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  ASSIGNMENT: { icon: BookOpen, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  MESSAGE: { icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  SYSTEM: { icon: Cog, color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

interface NotificationItemData {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string | null;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getTypeConfig(type: string) {
  return typeConfig[type as NotificationType] ?? typeConfig.INFO;
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  notification: NotificationItemData;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: (link: string) => void;
}) {
  const config = getTypeConfig(notification.type);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-xl px-3 py-3 transition-all duration-200',
        notification.read
          ? 'opacity-60 hover:opacity-80'
          : 'bg-primary/5 hover:bg-primary/8',
      )}
    >
      <div className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', config.bg)}>
        <Icon className={cn('size-4', config.color)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn(
            'truncate text-sm font-medium',
            notification.read ? 'text-muted-foreground' : 'text-foreground',
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="size-2 shrink-0 rounded-full bg-primary shadow-[0_0_6px_var(--color-primary)]" />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground/60">
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.read && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-full hover:bg-primary/10"
                onClick={(event) => {
                  event.stopPropagation();
                  onMarkRead(notification.id);
                }}
              >
                <Check className="size-3.5 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">Mark as read</TooltipContent>
          </Tooltip>
        )}
        {notification.link && onNavigate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-full hover:bg-primary/10"
                onClick={(event) => {
                  event.stopPropagation();
                  onNavigate(notification.link!);
                }}
              >
                <ExternalLink className="size-3.5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">Go to link</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full hover:bg-destructive/10"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(notification.id);
              }}
            >
              <Trash2 className="size-3.5 text-destructive/70" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">Delete</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = useAuthStore((state) => state.user?.role);
  const { selectedChildId, selectedScope } = useParentPortalStore();
  const isParent = role === 'PARENT';

  const parentNotificationsQuery = useParentV2Notifications(
    { childId: selectedScope === 'child' ? selectedChildId : null, scope: selectedScope },
    isParent,
  );
  const markParentRead = useMarkParentV2NotificationsRead();
  const markAllParentRead = useMarkAllParentV2NotificationsRead();
  const deleteParentNotification = useDeleteParentV2Notification();

  const storeNotifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);

  const notifications = useMemo<NotificationItemData[]>(
    () => (isParent ? (parentNotificationsQuery.data ?? []) : storeNotifications),
    [isParent, parentNotificationsQuery.data, storeNotifications],
  );
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const recent = notifications.slice(0, 20);

  const handleNavigate = useCallback(
    (link: string) => {
      setOpen(false);
      navigate(isParent ? withParentRouteContext(link, location.search, {
        scope: selectedScope,
        childId: selectedChildId,
      }) : link);
    },
    [isParent, location.search, navigate, selectedChildId, selectedScope],
  );

  const handleMarkRead = useCallback(
    (id: string) => {
      if (isParent) {
        markParentRead.mutate([id]);
        return;
      }
      markAsRead(id);
    },
    [isParent, markAsRead, markParentRead],
  );

  const handleMarkAllRead = useCallback(() => {
    if (isParent) {
      markAllParentRead.mutate();
      return;
    }
    markAllAsRead();
  }, [isParent, markAllAsRead, markAllParentRead]);

  const handleDelete = useCallback(
    (id: string) => {
      if (isParent) {
        deleteParentNotification.mutate(id);
        return;
      }
      deleteNotification(id);
    },
    [deleteNotification, deleteParentNotification, isParent],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9 rounded-full hover:bg-secondary"
            >
              <Bell className={cn(
                'size-5 transition-colors',
                unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground',
              )} />

              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
                  <span className="absolute inline-flex size-5 animate-ping rounded-full bg-primary/40" />
                  <span className="relative flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-[0_0_8px_var(--color-primary)]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Notifications</TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        align="end"
        className={cn(
          'w-[380px] p-0 rounded-2xl border-white/8',
          'bg-card/95 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.06)]',
        )}
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 rounded-full text-xs text-muted-foreground hover:text-primary"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <Separator className="bg-border/40" />

        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/50">
                  <Bell className="size-6 text-muted-foreground/40" />
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">No notifications yet</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  We'll let you know when something arrives
                </p>
              </div>
            ) : (
              recent.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                  onNavigate={handleNavigate}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator className="bg-border/40" />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full h-9 rounded-xl text-xs font-medium text-muted-foreground hover:text-primary"
                onClick={() => {
                  setOpen(false);
                  navigate('/notifications');
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
