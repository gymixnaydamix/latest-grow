/* ─── MarketingDashboard ─── Holographic marketing command centre ─────
 * Campaign KPIs, lead funnel, enrollment trend, campaign table,
 * social media overview.
 * Per MARKETING.md
 * ──────────────────────────────────────────────────────────────────── */
import { useMemo } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Megaphone, Users, Globe,
  Target, Share2, Activity,
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useCampaigns } from '@/hooks/api';
import type { Campaign } from '@root/types';

/* ── Feature components ── */
import { StatCard } from '@/components/features/StatCard';
import { NeonBarChart } from '@/components/features/charts/BarChart';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/features/EmptyState';

/* ── Section components ── */
import { MarketingSchoolSection } from './sections/MarketingSchoolSection';
import { AccountSection } from '@/views/shared/sections/AccountSection';
import MarketingAnalyticsView from '@/views/marketing/MarketingAnalyticsView';

/* ── Fallback static data ── */
const fallbackKpiSparklines = {
  campaigns: [3, 4, 5, 6, 6, 7, 8],
  leads: [80, 95, 100, 112, 120, 135, 142],
  visits: [8.2, 9.1, 9.8, 10.5, 11.2, 11.8, 12.4],
  conversion: [2.8, 3.1, 3.4, 3.6, 3.8, 4.0, 4.2],
};

const fallbackLeadsByChannel = [
  { name: 'Google Ads', primary: 45, secondary: 38 },
  { name: 'Facebook', primary: 32, secondary: 25 },
  { name: 'Referral', primary: 28, secondary: 22 },
  { name: 'Organic', primary: 22, secondary: 18 },
  { name: 'Email', primary: 15, secondary: 12 },
];

const fallbackEnrollmentTrend = [
  { name: 'Jul', value: 35 },
  { name: 'Aug', value: 48 },
  { name: 'Sep', value: 62 },
  { name: 'Oct', value: 55 },
  { name: 'Nov', value: 40 },
  { name: 'Dec', value: 30 },
];

const statusColor: Record<string, string> = {
  ACTIVE: 'border-emerald-500/30 text-emerald-400',
  DRAFT: 'border-white/10 text-white/40',
  PAUSED: 'border-amber-500/30 text-amber-400',
  COMPLETED: 'border-blue-500/30 text-blue-400',
};

function formatCurrency(amount?: number) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const fallbackSocialStats = [
  { platform: 'Facebook', followers: '2.4K', engagement: '4.5%', posts: 12 },
  { platform: 'Instagram', followers: '1.8K', engagement: '6.2%', posts: 15 },
  { platform: 'LinkedIn', followers: '820', engagement: '3.1%', posts: 8 },
  { platform: 'Twitter/X', followers: '540', engagement: '2.8%', posts: 18 },
];

export function MarketingDashboard() {
  const { activeHeader, activeSection } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader, activeSection]);
  const { schoolId } = useAuthStore();
  const { data: campaignsResponse, isLoading: campaignsLoading } = useCampaigns(schoolId);
  const campaigns: Campaign[] = campaignsResponse ?? [];

  /* ── Derive campaign stats ── */
  const campaignStats = useMemo(() => {
    if (!campaigns.length) return null;
    const active = campaigns.filter(c => c.status === 'ACTIVE').length;
    const totalBudget = campaigns.reduce((s, c) => s + Number(c.budget ?? 0), 0);
    return { active, totalBudget, total: campaigns.length };
  }, [campaigns]);

  // Route to section components for non-dashboard sections
  const sectionContent = (() => {
    switch (activeSection) {
      case 'school': return <MarketingSchoolSection />;
      case 'setting': return <AccountSection />;
      default: return null;
    }
  })();

  if (sectionContent) {
    return <div ref={containerRef} className="space-y-6">{sectionContent}</div>;
  }

  // Dashboard header-level routing (analytics)
  if (activeHeader === 'analytics') {
    return <div ref={containerRef} className="space-y-6"><MarketingAnalyticsView /></div>;
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ── Welcome Header ── */}
      <PageHeader
        title="Marketing Hub 📣"
        description={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        badge="Live"
        icon={<Activity className="size-5" />}
      />

      {/* ── Holographic KPI Cards ── */}
      <div data-animate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Campaigns"
          value={campaignStats?.active || 8}
          trend="up"
          trendLabel="+2 this month"
          icon={<Megaphone className="size-5" />}
          accentColor="#818cf8"
          sparklineData={fallbackKpiSparklines.campaigns}
        />
        <StatCard
          label="New Leads"
          value={142}
          trend="up"
          trendLabel="+18% MoM"
          icon={<Users className="size-5" />}
          accentColor="#34d399"
          sparklineData={fallbackKpiSparklines.leads}
        />
        <StatCard
          label="Website Visits"
          value={12.4}
          suffix="K"
          decimals={1}
          trend="up"
          trendLabel="+24%"
          icon={<Globe className="size-5" />}
          accentColor="#fbbf24"
          sparklineData={fallbackKpiSparklines.visits}
        />
        <StatCard
          label="Conversion Rate"
          value={4.2}
          suffix="%"
          decimals={1}
          trend="up"
          trendLabel="+0.8%"
          icon={<Target className="size-5" />}
          accentColor="#f472b6"
          sparklineData={fallbackKpiSparklines.conversion}
        />
      </div>

      {/* ── Lead Funnel + Enrollment Trend ── */}
      <div data-animate className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <NeonBarChart
            title="Leads by Channel"
            subtitle="This month vs. last month"
            data={fallbackLeadsByChannel}
            dataKey="primary"
            secondaryDataKey="secondary"
            xAxisKey="name"
            colors={['#818cf8']}
            secondaryColor="#34d399"
            height={260}
          />
        </div>
        <div className="lg:col-span-2">
          <GlowLineChart
            title="Enrollment Trend"
            subtitle="New enrolments by month"
            data={fallbackEnrollmentTrend}
            dataKey="value"
            xAxisKey="name"
            color="#f472b6"
            height={260}
          />
        </div>
      </div>

      {/* ── Campaigns Table ── */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base text-white/85">Campaigns</CardTitle>
          <CardDescription className="text-white/35">Performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6 text-left text-xs text-white/35">
                  <th className="py-2 pr-4 font-medium">Campaign</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Budget</th>
                  <th className="py-2 pr-4 font-medium">Start</th>
                  <th className="py-2 font-medium">End</th>
                </tr>
              </thead>
              <tbody>
                {campaignsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/6 last:border-0">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="py-3 pr-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState title="No campaigns" description="Create your first campaign to start reaching students." icon={<Megaphone className="size-8" />} />
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id} className="border-b border-white/6 last:border-0 hover:bg-white/4 transition-colors cursor-pointer">
                      <td className="py-3 pr-4 font-medium text-white/80">{c.name}</td>
                      <td className="py-3 pr-4 text-white/40 capitalize">{c.channel}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className={`text-[10px] ${statusColor[c.status] ?? 'border-white/10 text-white/40'}`}>{c.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-white/60">{formatCurrency(c.budget ?? undefined)}</td>
                      <td className="py-3 pr-4 text-white/40">{formatDate(c.startDate)}</td>
                      <td className="py-3 text-white/40">{c.endDate ? formatDate(c.endDate) : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Social Media Overview ── */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="size-4 text-indigo-400" />
            <CardTitle className="text-base text-white/85">Social Media Overview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {fallbackSocialStats.map((s) => (
              <div key={s.platform} className="group rounded-xl border border-white/6 bg-white/2 p-4 transition-all hover:border-white/12 hover:bg-white/4">
                <p className="text-sm font-semibold text-white/80">{s.platform}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/35">Followers</span>
                    <span className="font-medium text-white/60">{s.followers}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/35">Engagement</span>
                    <span className="font-medium text-emerald-400">{s.engagement}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/35">Posts (30d)</span>
                    <span className="font-medium text-white/60">{s.posts}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
