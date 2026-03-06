/* ─── MarketingSchoolSection ─── Campaigns, leads, media hub, AI marketing */
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Megaphone, Target, Sparkles,
  Mail, Eye, Users, Plus, BarChart3,
  Globe, Share2, FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useCampaigns } from '@/hooks/api';

import type { Campaign } from '@root/types';
import LeadManagementViewPage from '@/views/marketing/LeadManagementView';
import MediaHubViewPage from '@/views/marketing/MediaHubView';

/* ── helpers ────────────────────────────────────────────────────── */
function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}><CardContent className="py-4"><Skeleton className="h-10 w-full" /></CardContent></Card>
      ))}
    </div>
  );
}

function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-4" data-animate>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}><CardContent className="pt-6 text-center"><Skeleton className="mx-auto h-4 w-20 mb-2" /><Skeleton className="mx-auto h-6 w-12" /></CardContent></Card>
      ))}
    </div>
  );
}

const statusBadgeVariant = (s: string) => {
  switch (s) {
    case 'ACTIVE': return 'default' as const;
    case 'COMPLETED': return 'outline' as const;
    case 'PAUSED': return 'secondary' as const;
    default: return 'secondary' as const;
  }
};

export function MarketingSchoolSection() {
  const { activeHeader } = useNavigationStore();
  const { schoolId } = useAuthStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader]);

  const { data: campaignsRes, isLoading: campaignsLoading } = useCampaigns(schoolId);

  const campaigns = campaignsRes ?? [];

  const view = (() => {
    switch (activeHeader) {
      case 'campaigns': return <CampaignsView campaigns={campaigns} isLoading={campaignsLoading} />;
      case 'leads': return <LeadManagementViewPage />;
      case 'media_hub': return <MediaHubViewPage />;
      case 'ai_marketing': return <AIMarketingView />;
      default: return <CampaignsView campaigns={campaigns} isLoading={campaignsLoading} />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── Campaigns ─────────────────────────────────────────────────── */
function CampaignsView({ campaigns, isLoading }: { campaigns: Campaign[]; isLoading: boolean }) {
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE');
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget ?? 0), 0);
  const totalReach = campaigns.reduce((sum, c) => sum + (c.metrics?.reach ?? 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.metrics?.conversions ?? 0), 0);

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <h2 className="text-lg font-semibold">Campaigns</h2>
        <Button size="sm"><Plus className="mr-1 size-3" /> New Campaign</Button>
      </div>

      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-4" data-animate>
          {[
            { label: 'Active Campaigns', value: String(activeCampaigns.length) },
            { label: 'Total Reach', value: totalReach >= 1000 ? `${(totalReach / 1000).toFixed(1)}K` : String(totalReach) },
            { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}` },
            { label: 'Conversions', value: String(totalConversions) },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-xl font-bold mt-1">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <CardSkeleton count={5} />
      ) : campaigns.length === 0 ? (
        <Card data-animate>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">No campaigns found. Create your first campaign to get started.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2" data-animate>
          {campaigns.map((c) => {
            const sent = c.metrics?.sent ?? 0;
            const opened = c.metrics?.opened ?? 0;
            const leads = c.metrics?.leads ?? 0;
            const budgetStr = c.budget != null ? `$${c.budget.toLocaleString()}` : '—';
            return (
              <Card key={c.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.channel} · Budget: {budgetStr}</p>
                    </div>
                    <Badge variant={statusBadgeVariant(c.status)} className="text-[10px]">{c.status}</Badge>
                  </div>
                  {sent > 0 && (
                    <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="size-3" /> {sent.toLocaleString()} sent</span>
                      <span className="flex items-center gap-1"><Eye className="size-3" /> {opened.toLocaleString()} opened</span>
                      <span className="flex items-center gap-1"><Target className="size-3" /> {leads} leads</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ── AI Marketing ──────────────────────────────────────────────── */
function AIMarketingView() {
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">AI Marketing Tools</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
        {[
          { title: 'Content Generator', desc: 'AI-powered blog posts, social media copy, and newsletters', icon: FileText, action: 'Generate' },
          { title: 'Audience Insights', desc: 'Predictive analytics on prospective families', icon: Users, action: 'Analyze' },
          { title: 'A/B Test Optimizer', desc: 'Automatically optimize email subject lines and CTAs', icon: BarChart3, action: 'Optimize' },
          { title: 'Social Scheduler', desc: 'AI-recommended posting times and content calendar', icon: Share2, action: 'Schedule' },
          { title: 'SEO Assistant', desc: 'Keyword recommendations and page optimization', icon: Globe, action: 'Audit' },
          { title: 'Brand Voice', desc: 'Ensure consistent messaging across all channels', icon: Megaphone, action: 'Configure' },
        ].map((t) => (
          <Card key={t.title} className="cursor-pointer hover:border-primary/40 transition-colors">
            <CardContent className="pt-6">
              <t.icon className="size-6 text-primary" />
              <p className="text-sm font-semibold mt-3">{t.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              <Button size="sm" variant="outline" className="mt-3">
                <Sparkles className="mr-1 size-3" /> {t.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
