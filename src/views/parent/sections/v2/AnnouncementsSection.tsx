import { useMemo, useState } from 'react';
import { Bell, Bookmark, MailOpen, Megaphone, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useMarkParentV2AnnouncementRead,
  useParentV2Announcements,
  useSaveParentV2Announcement,
} from '@/hooks/api/use-parent-v2';
import { childDisplayName, formatDateTimeLabel } from './parent-v2-demo-data';
import type { ParentAnnouncementDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, StatusBadge } from './shared';
import type { ParentSectionProps } from './shared';

const CATEGORY_FILTERS = ['ALL', 'URGENT', 'ACADEMIC', 'EVENT', 'FINANCE', 'TRANSPORT'] as const;
const READ_FILTERS = ['ALL', 'UNREAD', 'READ', 'SAVED'] as const;

export function AnnouncementsSection({ scope, childId }: ParentSectionProps) {
  const { data: rawRows } = useParentV2Announcements({ scope, childId });
  const markRead = useMarkParentV2AnnouncementRead();
  const saveAnnouncement = useSaveParentV2Announcement();

  const allRows: ParentAnnouncementDemo[] = (rawRows as ParentAnnouncementDemo[] | undefined) ?? [];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]>('ALL');
  const [readFilter, setReadFilter] = useState<(typeof READ_FILTERS)[number]>('ALL');

  const rows = useMemo(
    () =>
      allRows.filter((row) => {
        const categoryMatch = category === 'ALL' || row.category === category;
        const readMatch =
          readFilter === 'ALL' ||
          (readFilter === 'UNREAD' && !row.read) ||
          (readFilter === 'READ' && row.read) ||
          (readFilter === 'SAVED' && row.saved);
        const queryMatch =
          query.trim().length === 0 ||
          `${row.title} ${row.body}`.toLowerCase().includes(query.toLowerCase());
        return categoryMatch && readMatch && queryMatch;
      }),
    [allRows, category, readFilter, query],
  );

  const unreadCount = allRows.filter((r) => !r.read).length;
  const urgentCount = allRows.filter((r) => r.category === 'URGENT').length;

  return (
    <ParentSectionShell
      title="Announcements"
      description="School feed for urgent alerts, class updates, events, and administrative notices."
    >
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Megaphone className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-bold">{allRows.length}</p>
              <p className="text-xs text-muted-foreground">Announcements</p>
            </div>
          </CardContent>
        </Card>
        <Card className={unreadCount > 0 ? 'border-amber-500/20 bg-amber-500/5' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <Bell className="size-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{unreadCount}</p>
              <p className="text-xs text-muted-foreground">Unread</p>
            </div>
          </CardContent>
        </Card>
        {urgentCount > 0 && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="size-2 rounded-full bg-red-500" />
              <div>
                <p className="text-2xl font-bold">{urgentCount}</p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setCategory(entry)}
              className={`rounded-md border px-3 py-1 text-xs transition-colors ${
                category === entry ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
              }`}
            >
              {entry}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {READ_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setReadFilter(f)}
              className={`rounded-md border px-3 py-1 text-xs transition-colors ${
                readFilter === f ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
              }`}
            >
              {f}
            </button>
          ))}
          <Input
            className="max-w-xs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search announcements..."
          />
        </div>
      </div>

      {/* Feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">School Feed</CardTitle>
          <CardDescription>{rows.length} notice(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <EmptyActionState title="Empty feed" message="No announcements match your filter." ctaLabel="Show all" onClick={() => { setCategory('ALL'); setReadFilter('ALL'); setQuery(''); }} />
          ) : (
            rows.map((notice) => (
              <div
                key={notice.id}
                className={`rounded-lg border p-4 transition-all ${
                  notice.category === 'URGENT' && !notice.read ? 'border-red-500/40 bg-red-500/5' : !notice.read ? 'border-sky-500/30 bg-sky-500/5' : 'border-border/60'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!notice.read ? 'font-semibold' : 'font-medium'}`}>{notice.title}</p>
                      {'hasAttachment' in notice && notice.hasAttachment && (
                        <Paperclip className="size-3 shrink-0 text-muted-foreground" />
                      )}
                      {notice.saved && <Bookmark className="size-3 shrink-0 fill-amber-500 text-amber-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {notice.childId ? childDisplayName(notice.childId) : 'Family-wide'}
                      {'author' in notice && notice.author ? ` • ${notice.author}` : ''}
                      {' • '}{formatDateTimeLabel(notice.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <StatusBadge status={notice.category} tone={notice.category === 'URGENT' ? 'bad' : 'info'} />
                    {!notice.read && <Badge className="border-sky-500/40 bg-sky-500/10 text-xs text-sky-700 dark:text-sky-300">NEW</Badge>}
                  </div>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">{notice.body}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {!notice.read && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      disabled={markRead.isPending}
                      onClick={() => markRead.mutate(notice.id)}
                    >
                      <MailOpen className="size-3.5" /> Mark read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    disabled={saveAnnouncement.isPending}
                    onClick={() => saveAnnouncement.mutate(notice.id)}
                  >
                    <Bookmark className={`size-3.5 ${notice.saved ? 'fill-current' : ''}`} />
                    {notice.saved ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </ParentSectionShell>
  );
}
