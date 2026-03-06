/* ─── NotificationsPage ─── Full notification center with filters & bulk actions ─── */
import { useState, useMemo, useCallback } from 'react';
import {
  Bell, Check, CheckCheck, Trash2, Filter,
  Info, AlertTriangle, BookOpen, MessageSquare, Megaphone,
  GraduationCap, ClipboardList, Cog, Award, Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from '@/components/ui/tooltip';
import { useNotificationStore, type NotificationFilter } from '@/store/notification.store';
import { NotificationType } from '@root/types';
import type { Notification } from '@root/types';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const typeConfig: Record<NotificationType, { icon: typeof Info; color: string; bg: string; label: string }> = {
  INFO: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Info' },
  SUCCESS: { icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Success' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Warning' },
  ERROR: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Error' },
  ANNOUNCEMENT: { icon: Megaphone, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Announcement' },
  GRADE: { icon: GraduationCap, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Grade' },
  ATTENDANCE: { icon: ClipboardList, color: 'text-teal-400', bg: 'bg-teal-500/10', label: 'Attendance' },
  ASSIGNMENT: { icon: BookOpen, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Assignment' },
  MESSAGE: { icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Message' },
  SYSTEM: { icon: Cog, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'System' },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Notification Card
// ---------------------------------------------------------------------------

function NotificationCard({
  notification,
  selected,
  onToggleSelect,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = typeConfig[notification.type] ?? typeConfig.INFO;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'group relative flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200',
        notification.read
          ? 'border-border/30 bg-card/40 opacity-70 hover:opacity-90'
          : 'border-primary/15 bg-primary/[0.03] shadow-[0_0_20px_-8px_var(--color-primary)]',
        selected && 'ring-2 ring-primary/30 border-primary/30',
      )}
    >
      {/* Selection checkbox */}
      <div className="pt-1">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggleSelect(notification.id)}
          className="size-4"
        />
      </div>

      {/* Type icon */}
      <div className={cn('mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl', config.bg)}>
        <Icon className={cn('size-5', config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={cn(
                'text-sm font-semibold',
                notification.read ? 'text-muted-foreground' : 'text-foreground'
              )}>
                {notification.title}
              </p>
              {!notification.read && (
                <span className="size-2 shrink-0 rounded-full bg-primary shadow-[0_0_6px_var(--color-primary)]" />
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {notification.message}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Badge variant="secondary" className="h-5 gap-1 rounded-md px-1.5 text-[10px] font-medium">
                <Icon className={cn('size-3', config.color)} />
                {config.label}
              </Badge>
              <span className="text-[11px] text-muted-foreground/60">
                {formatDate(notification.createdAt)}
              </span>
            </div>
          </div>

          {/* Time ago */}
          <span className="shrink-0 text-xs text-muted-foreground/60 mt-0.5">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Hover actions */}
      <div className="flex shrink-0 flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.read && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full hover:bg-primary/10"
                onClick={() => onMarkRead(notification.id)}
              >
                <Check className="size-4 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">Mark read</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full hover:bg-destructive/10"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 className="size-4 text-destructive/70" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">Delete</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const ITEMS_PER_PAGE = 20;

const filterOptions: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  ...Object.values(NotificationType).map((t) => ({
    value: t as NotificationFilter,
    label: typeConfig[t]?.label ?? t,
  })),
];

export function NotificationsPage() {
  const {
    notifications,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  } = useNotificationStore();

  const filtered = useNotificationStore((s) => s.filtered());
  const unreadCount = useNotificationStore((s) => s.unreadCount());

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const visibleItems = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  const hasMore = visibleCount < filtered.length;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(visibleItems.map((n) => n.id)));
  }, [visibleItems]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const bulkMarkRead = useCallback(() => {
    selectedIds.forEach((id) => markAsRead(id));
    setSelectedIds(new Set());
  }, [selectedIds, markAsRead]);

  const bulkDelete = useCallback(() => {
    selectedIds.forEach((id) => deleteNotification(id));
    setSelectedIds(new Set());
  }, [selectedIds, deleteNotification]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 shadow-[0_0_16px_var(--color-primary)/0.15]">
                <Bell className="size-5 text-primary" />
              </div>
              Notifications
              {unreadCount > 0 && (
                <Badge variant="default" className="h-6 rounded-full px-2.5 text-xs shadow-[0_0_10px_var(--color-primary)/0.2]">
                  {unreadCount} unread
                </Badge>
              )}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Stay up to date with everything happening across your platform
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/40 bg-card/60 p-3 backdrop-blur-sm">
          {/* Filter dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(v) => { setFilter(v as NotificationFilter); setVisibleCount(ITEMS_PER_PAGE); }}>
              <SelectTrigger className="h-8 w-[140px] rounded-lg text-xs">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Selection controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg text-xs"
              onClick={selectedIds.size > 0 ? clearSelection : selectAll}
            >
              {selectedIds.size > 0 ? `Deselect (${selectedIds.size})` : 'Select all'}
            </Button>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg text-xs text-primary hover:bg-primary/10"
                onClick={bulkMarkRead}
              >
                <CheckCheck className="size-3.5" />
                Mark read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10"
                onClick={bulkDelete}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Global actions */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={deleteAll}
            >
              <Trash2 className="size-3.5" />
              Clear all
            </Button>
          )}
        </div>

        {/* Notification list */}
        <ScrollArea className="rounded-2xl">
          <div className="space-y-3">
            {visibleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-20 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/50">
                  <Inbox className="size-8 text-muted-foreground/30" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-muted-foreground">
                  {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground/60">
                  {filter === 'all'
                    ? "You're all caught up! New notifications will appear here."
                    : 'Try changing the filter to see more notifications.'}
                </p>
              </div>
            ) : (
              <>
                {visibleItems.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    selected={selectedIds.has(n.id)}
                    onToggleSelect={toggleSelect}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}

                {/* Load more / infinite scroll trigger */}
                {hasMore && (
                  <div className="flex justify-center pt-4 pb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full px-6 text-xs"
                      onClick={loadMore}
                    >
                      Load more ({filtered.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
