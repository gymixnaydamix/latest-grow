/* ─── AnnouncementsPage ─── Platform / school-wide announcements ─── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Megaphone, Plus, Search,
  Calendar, User,
} from 'lucide-react';
import {
  Card, CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/features/EmptyState';
import { useAnnouncements } from '@/hooks/api';
import type { Announcement } from '@root/types';
import { useAuthStore } from '@/store/auth.store';

export function AnnouncementsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const { schoolId } = useAuthStore();
  const { data, isLoading, error } = useAnnouncements(schoolId);
  const containerRef = useStaggerAnimate<HTMLDivElement>([tab, isLoading]);

  const announcements = data ?? [];

  const filtered = announcements.filter((a: Announcement) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.body.toLowerCase().includes(search.toLowerCase());
    const audienceArr = (a.audience ?? []).map((x) => x.toLowerCase());
    const matchTab = tab === 'all' || audienceArr.includes(tab);
    return matchSearch && matchTab;
  });

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground">Stay informed with the latest updates</p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" /> New Announcement
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load announcements. Please try again later.
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/3" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((a) => (
            <Card key={a.id} data-animate className="hover:bg-accent/30 transition-colors cursor-pointer">
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <Megaphone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{a.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{a.body}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3" /> {a.author?.firstName} {a.author?.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'Draft'}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">{(a.audience ?? []).join(', ')}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <EmptyState title="No announcements" description="No announcements found matching your search." icon={<Megaphone className="size-10" />} />
          )}
        </div>
      )}
    </div>
  );
}
