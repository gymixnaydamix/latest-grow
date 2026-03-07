/* ─── AdminMarketView ─── Market intelligence for school admins ──── */
import { TrendingUp, Users, Globe, Target, Building, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { StatCard } from '@/components/features/StatCard';
import { NeonBarChart } from '@/components/features/charts/BarChart';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { GlowPieChart } from '@/components/features/charts/PieChart';
import { useMarketIntelligence } from '@/hooks/api';

const FALLBACK_MARKET_POSITION = [
  { name: "Your School", value: 35, color: '#818cf8' },
  { name: "Competitor A", value: 25, color: '#34d399' },
  { name: "Competitor B", value: 20, color: '#fbbf24' },
  { name: "Competitor C", value: 12, color: '#f472b6' },
  { name: "Others", value: 8, color: '#60a5fa' },
];

const FALLBACK_ENROLLMENT_COMP = [
  { name: '2020', yours: 420, district: 380 },
  { name: '2021', yours: 445, district: 390 },
  { name: '2022', yours: 470, district: 405 },
  { name: '2023', yours: 510, district: 415 },
  { name: '2024', yours: 545, district: 425 },
  { name: '2025', yours: 578, district: 430 },
];

const FALLBACK_DEMAND_TREND = [
  { name: 'Sep', inquiries: 85 },
  { name: 'Oct', inquiries: 92 },
  { name: 'Nov', inquiries: 78 },
  { name: 'Dec', inquiries: 65 },
  { name: 'Jan', inquiries: 120 },
  { name: 'Feb', inquiries: 145 },
  { name: 'Mar', inquiries: 168 },
];

const FALLBACK_BENCHMARKS = [
  { name: 'Student : Teacher Ratio', yours: '18:1', district: '22:1', status: 'better' },
  { name: 'Avg Class Size', yours: '24', district: '28', status: 'better' },
  { name: 'Graduation Rate', yours: '96%', district: '91%', status: 'better' },
  { name: 'College Acceptance', yours: '88%', district: '82%', status: 'better' },
  { name: 'Tuition (Annual)', yours: '$12,500', district: '$11,800', status: 'higher' },
  { name: 'Parent Satisfaction', yours: '4.6/5', district: '4.1/5', status: 'better' },
];

export default function AdminMarketView() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const { data: apiMarket } = useMarketIntelligence();

  const MARKET_POSITION = FALLBACK_MARKET_POSITION;
  const ENROLLMENT_COMPARISON = FALLBACK_ENROLLMENT_COMP;
  const DEMAND_TREND = FALLBACK_DEMAND_TREND;
  const COMPETITOR_BENCHMARKS = FALLBACK_BENCHMARKS;
  void apiMarket;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div data-animate className="flex items-center gap-2">
        <TrendingUp className="size-5 text-emerald-400" />
        <h2 className="text-lg font-bold text-white/90">Market Intelligence</h2>
        <Badge className="border-0 bg-emerald-400/10 text-emerald-400 text-[10px] ml-auto">District Comparison</Badge>
      </div>

      <div data-animate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Market Share" value={35} suffix="%" trend="up" trendLabel="+3% YoY" icon={<Target className="size-5" />} accentColor="#818cf8" />
        <StatCard label="Inquiry Volume" value={168} trend="up" trendLabel="+38% MoM" icon={<Users className="size-5" />} accentColor="#34d399" sparklineData={DEMAND_TREND.map(d => d.inquiries)} />
        <StatCard label="Waitlist Students" value={42} trend="up" trendLabel="+8 this month" icon={<Building className="size-5" />} accentColor="#fbbf24" />
        <StatCard label="Brand Score" value={4.6} suffix="/5" decimals={1} trend="up" trendLabel="+0.3" icon={<Globe className="size-5" />} accentColor="#f472b6" />
      </div>

      <div data-animate className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <NeonBarChart title="Enrollment: You vs District Avg" subtitle="6-year enrollment comparison" data={ENROLLMENT_COMPARISON.map(e => ({ name: e.name, primary: e.yours, secondary: e.district }))} dataKey="primary" secondaryDataKey="secondary" xAxisKey="name" colors={['#818cf8']} secondaryColor="#fbbf24" height={280} />
        </div>
        <div className="lg:col-span-2">
          <GlowPieChart title="Local Market Share" subtitle="Enrollment share among area schools" data={MARKET_POSITION} height={280} />
        </div>
      </div>

      <div data-animate>
        <GlowLineChart title="Inquiry Volume Trend" subtitle="Monthly admission inquiries" data={DEMAND_TREND} dataKey="inquiries" xAxisKey="name" color="#34d399" height={220} />
      </div>

      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white/90 text-sm flex items-center gap-2">
            <BarChart3 className="size-4 text-indigo-400" />
            Competitive Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {COMPETITOR_BENCHMARKS.map((b, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 px-3 py-2">
                <span className="text-xs text-white/50">{b.name}</span>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs font-medium text-white/80">{b.yours}</span>
                    <span className="text-[10px] text-white/30 ml-1">You</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-white/50">{b.district}</span>
                    <span className="text-[10px] text-white/30 ml-1">Avg</span>
                  </div>
                  {b.status === 'better' ? (
                    <ArrowUpRight className="size-3 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="size-3 text-amber-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
