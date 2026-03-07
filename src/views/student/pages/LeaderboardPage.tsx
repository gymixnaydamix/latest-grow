/* ─── LeaderboardPage ─── Student leaderboard & rankings ───────────── */
import { useState } from 'react';
import { Trophy, Medal, Crown, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

type Period = 'weekly' | 'monthly' | 'allTime';

interface LeaderboardEntry {
  rank: number; name: string; avatar: string; xp: number;
  streak: number; trend: 'up' | 'down' | 'same'; change: number;
  isCurrentUser?: boolean;
}

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Sarah Chen', avatar: 'SC', xp: 4820, streak: 14, trend: 'same', change: 0 },
  { rank: 2, name: 'Marcus Johnson', avatar: 'MJ', xp: 4650, streak: 21, trend: 'up', change: 2 },
  { rank: 3, name: 'Aisha Patel', avatar: 'AP', xp: 4480, streak: 9, trend: 'down', change: 1 },
  { rank: 4, name: 'Sam Student', avatar: 'SS', xp: 4200, streak: 7, trend: 'up', change: 3, isCurrentUser: true },
  { rank: 5, name: 'Emma Watson', avatar: 'EW', xp: 3990, streak: 12, trend: 'up', change: 1 },
  { rank: 6, name: 'Jake Miller', avatar: 'JM', xp: 3870, streak: 5, trend: 'down', change: 2 },
  { rank: 7, name: 'Priya Sharma', avatar: 'PS', xp: 3710, streak: 16, trend: 'same', change: 0 },
  { rank: 8, name: 'Liam Chen', avatar: 'LC', xp: 3600, streak: 3, trend: 'down', change: 1 },
  { rank: 9, name: 'Sofia Rodriguez', avatar: 'SR', xp: 3490, streak: 8, trend: 'up', change: 4 },
  { rank: 10, name: 'Noah Williams', avatar: 'NW', xp: 3350, streak: 2, trend: 'down', change: 3 },
];

const FALLBACK_RANK_ICONS = [Crown, Medal, Medal];
const FALLBACK_RANK_COLORS = ['text-amber-400', 'text-zinc-300', 'text-amber-600'];

export default function LeaderboardPage() {
  const containerRef = useStaggerAnimate([]);
  const [period, setPeriod] = useState<Period>('weekly');
  const user = useAuthStore((s) => s.user);
  const currentEntry = LEADERBOARD.find((e) => e.isCurrentUser);

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader title="Leaderboard" description="See how you rank among your peers" />

      {/* Your Rank card */}
      {currentEntry && (
        <Card data-animate className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 pt-5 pb-4">
            <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              #{currentEntry.rank}
            </div>
            <div className="flex-1">
              <p className="text-base font-bold">{user?.firstName} {user?.lastName}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Trophy className="size-4 text-amber-500" />{currentEntry.xp.toLocaleString()} XP</span>
                <span className="flex items-center gap-1"><Flame className="size-4 text-orange-500" />{currentEntry.streak}-day streak</span>
                <span className="flex items-center gap-1">
                  {currentEntry.trend === 'up' && <><TrendingUp className="size-4 text-emerald-500" /> Up {currentEntry.change}</>}
                  {currentEntry.trend === 'down' && <><TrendingDown className="size-4 text-red-500" /> Down {currentEntry.change}</>}
                  {currentEntry.trend === 'same' && <><Minus className="size-4" /> Steady</>}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Period tabs */}
      <div data-animate className="flex gap-2">
        {(['weekly', 'monthly', 'allTime'] as Period[]).map((p) => (
          <Button key={p} size="sm" variant={period === p ? 'default' : 'outline'} className="text-xs h-8 capitalize" onClick={() => setPeriod(p)}>
            {p === 'allTime' ? 'All Time' : p}
          </Button>
        ))}
      </div>

      {/* Rankings */}
      <div className="space-y-2" data-animate>
        {LEADERBOARD.map((entry) => {
          const isTop3 = entry.rank <= 3;
          const RankIcon = isTop3 ? FALLBACK_RANK_ICONS[entry.rank - 1] : null;
          return (
            <Card key={entry.rank} className={cn('transition-colors', entry.isCurrentUser && 'ring-1 ring-primary/30 border-primary/20')}>
              <CardContent className="flex items-center gap-4 py-3 px-4">
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {RankIcon ? (
                    <RankIcon className={cn('size-6 mx-auto', FALLBACK_RANK_COLORS[entry.rank - 1])} />
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">#{entry.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className={cn(
                  'size-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  entry.isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}>
                  {entry.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm font-semibold truncate', entry.isCurrentUser && 'text-primary')}>{entry.name}</p>
                    {entry.isCurrentUser && <Badge className="text-[9px]">You</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-0.5"><Trophy className="size-2.5 text-amber-500" />{entry.xp.toLocaleString()} XP</span>
                    <span className="flex items-center gap-0.5"><Flame className="size-2.5 text-orange-500" />{entry.streak}d streak</span>
                  </div>
                </div>

                {/* XP Progress Bar (relative to leader) */}
                <div className="w-24 shrink-0">
                  <Progress value={(entry.xp / LEADERBOARD[0].xp) * 100} className="h-1.5" />
                </div>

                {/* Trend */}
                <div className="w-12 text-right shrink-0">
                  {entry.trend === 'up' && <Badge variant="outline" className="text-[9px] text-emerald-500 border-emerald-500/30">▲{entry.change}</Badge>}
                  {entry.trend === 'down' && <Badge variant="outline" className="text-[9px] text-red-500 border-red-500/30">▼{entry.change}</Badge>}
                  {entry.trend === 'same' && <Badge variant="outline" className="text-[9px]">—</Badge>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
