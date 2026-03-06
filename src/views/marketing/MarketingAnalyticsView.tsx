/* ─── MarketingAnalyticsView ─── Campaign analytics dashboard ───── */
import { BarChart3, TrendingUp, Megaphone, Globe, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { StatCard } from '@/components/features/StatCard';
import { NeonBarChart } from '@/components/features/charts/BarChart';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { GlowPieChart } from '@/components/features/charts/PieChart';

const CAMPAIGN_PERFORMANCE = [
  { name: 'Jan', impressions: 45000, clicks: 3200, conversions: 128 },
  { name: 'Feb', impressions: 52000, clicks: 3800, conversions: 156 },
  { name: 'Mar', impressions: 48000, clicks: 3500, conversions: 142 },
  { name: 'Apr', impressions: 61000, clicks: 4500, conversions: 185 },
  { name: 'May', impressions: 58000, clicks: 4200, conversions: 172 },
  { name: 'Jun', impressions: 72000, clicks: 5400, conversions: 218 },
];

const LEAD_SOURCE = [
  { name: 'Google Ads', value: 32, color: '#818cf8' },
  { name: 'Facebook', value: 24, color: '#34d399' },
  { name: 'Referral', value: 18, color: '#fbbf24' },
  { name: 'Email', value: 14, color: '#f472b6' },
  { name: 'Organic', value: 12, color: '#60a5fa' },
];

const CONVERSION_FUNNEL = [
  { name: 'Visitors', value: 12400 },
  { name: 'Leads', value: 1860 },
  { name: 'Qualified', value: 744 },
  { name: 'Applied', value: 372 },
  { name: 'Enrolled', value: 186 },
];

const ROI_TREND = [
  { name: 'Sep', roi: 2.4 },
  { name: 'Oct', roi: 2.8 },
  { name: 'Nov', roi: 3.1 },
  { name: 'Dec', roi: 2.6 },
  { name: 'Jan', roi: 3.4 },
  { name: 'Feb', roi: 3.8 },
  { name: 'Mar', roi: 4.2 },
];

const TOP_CAMPAIGNS = [
  { name: 'Spring Open Day', channel: 'Google Ads', leads: 86, cost: '$1,200', roi: '4.8x' },
  { name: 'Early Bird Discount', channel: 'Email', leads: 62, cost: '$340', roi: '6.2x' },
  { name: 'Social Media Blitz', channel: 'Facebook', leads: 54, cost: '$890', roi: '3.1x' },
  { name: 'Referral Program', channel: 'Referral', leads: 48, cost: '$0', roi: '∞' },
  { name: 'Banner Ads Q1', channel: 'Display', leads: 32, cost: '$1,450', roi: '1.4x' },
];

export default function MarketingAnalyticsView() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Header */}
      <div data-animate className="flex items-center gap-2">
        <BarChart3 className="size-5 text-violet-400" />
        <h2 className="text-lg font-bold text-white/90">Marketing Analytics</h2>
        <Badge className="border-0 bg-violet-400/10 text-violet-400 text-[10px] ml-auto">Last 6 Months</Badge>
      </div>

      {/* KPI Cards */}
      <div data-animate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Impressions"
          value={336}
          suffix="K"
          trend="up"
          trendLabel="+24% MoM"
          icon={<Globe className="size-5" />}
          accentColor="#818cf8"
          sparklineData={CAMPAIGN_PERFORMANCE.map(c => c.impressions / 1000)}
        />
        <StatCard
          label="Lead Conversion"
          value={4.2}
          suffix="%"
          decimals={1}
          trend="up"
          trendLabel="+0.8% this quarter"
          icon={<Target className="size-5" />}
          accentColor="#34d399"
          sparklineData={CAMPAIGN_PERFORMANCE.map(c => (c.conversions / c.clicks) * 100)}
        />
        <StatCard
          label="Cost per Lead"
          value={18.50}
          prefix="$"
          decimals={2}
          trend="down"
          trendLabel="-$3.20 MoM"
          icon={<Megaphone className="size-5" />}
          accentColor="#fbbf24"
        />
        <StatCard
          label="Campaign ROI"
          value={4.2}
          suffix="x"
          decimals={1}
          trend="up"
          trendLabel="+0.4x this month"
          icon={<TrendingUp className="size-5" />}
          accentColor="#f472b6"
          sparklineData={ROI_TREND.map(r => r.roi)}
        />
      </div>

      {/* Campaign Performance + Lead Sources */}
      <div data-animate className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <NeonBarChart
            title="Campaign Performance"
            subtitle="Clicks and conversions by month"
            data={CAMPAIGN_PERFORMANCE.map(c => ({ name: c.name, primary: c.clicks, secondary: c.conversions * 10 }))}
            dataKey="primary"
            secondaryDataKey="secondary"
            xAxisKey="name"
            colors={['#818cf8']}
            secondaryColor="#34d399"
            height={280}
          />
        </div>
        <div className="lg:col-span-2">
          <GlowPieChart
            title="Lead Sources"
            subtitle="Where leads are coming from"
            data={LEAD_SOURCE}
            height={280}
          />
        </div>
      </div>

      {/* ROI Trend */}
      <div data-animate>
        <GlowLineChart
          title="ROI Trend"
          subtitle="Return on marketing investment over time"
          data={ROI_TREND}
          dataKey="roi"
          xAxisKey="name"
          color="#34d399"
          height={220}
        />
      </div>

      {/* Conversion Funnel */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white/90 text-sm flex items-center gap-2">
            <Target className="size-4 text-indigo-400" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2">
            {CONVERSION_FUNNEL.map((stage) => {
              const maxVal = CONVERSION_FUNNEL[0].value;
              const pct = (stage.value / maxVal) * 100;
              return (
                <div key={stage.name} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-xs font-medium text-white/80">{stage.value.toLocaleString()}</span>
                  <div className="w-full rounded-t-md bg-gradient-to-t from-indigo-500/40 to-indigo-500/10 border border-white/6" style={{ height: `${Math.max(pct * 1.5, 20)}px` }} />
                  <span className="text-[10px] text-white/40 text-center">{stage.name}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Campaigns Table */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white/90 text-sm flex items-center gap-2">
            <Megaphone className="size-4 text-emerald-400" />
            Top Campaigns
            <Badge className="border-0 bg-emerald-400/10 text-emerald-400 text-[10px] ml-auto">{TOP_CAMPAIGNS.length} campaigns</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {TOP_CAMPAIGNS.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-white/20 font-mono w-4">#{i + 1}</span>
                  <div>
                    <span className="text-xs text-white/70">{c.name}</span>
                    <span className="text-[10px] text-white/30 ml-2">{c.channel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-white/40">{c.leads} leads</span>
                  <span className="text-[10px] text-white/40">{c.cost}</span>
                  <Badge className="border-0 bg-emerald-400/10 text-emerald-400 text-[9px]">{c.roi}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
