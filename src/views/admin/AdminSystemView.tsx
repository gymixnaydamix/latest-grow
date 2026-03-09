/* ─── AdminSystemView ─── System health & IT overview ──────────── */
import { Monitor, Cpu, HardDrive, Wifi, Shield, AlertTriangle, CheckCircle, Server, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { StatCard } from '@/components/features/StatCard';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { useSystemHealth } from '@/hooks/api';


const FALLBACK_UPTIME = [
  { name: 'Mon', uptime: 99.9 },
  { name: 'Tue', uptime: 99.8 },
  { name: 'Wed', uptime: 100 },
  { name: 'Thu', uptime: 99.7 },
  { name: 'Fri', uptime: 99.9 },
  { name: 'Sat', uptime: 100 },
  { name: 'Sun', uptime: 100 },
];

const FALLBACK_RESOURCES = [
  { name: '6am', cpu: 22, memory: 45, storage: 62 },
  { name: '9am', cpu: 68, memory: 72, storage: 62 },
  { name: '12pm', cpu: 85, memory: 78, storage: 63 },
  { name: '3pm', cpu: 72, memory: 75, storage: 63 },
  { name: '6pm', cpu: 45, memory: 58, storage: 63 },
  { name: '9pm', cpu: 28, memory: 48, storage: 63 },
];

const FALLBACK_SERVICES = [
  { name: 'LMS Platform', status: 'healthy', uptime: '99.9%', latency: '42ms' },
  { name: 'Student Portal', status: 'healthy', uptime: '99.8%', latency: '38ms' },
  { name: 'Email Service', status: 'healthy', uptime: '100%', latency: '120ms' },
  { name: 'Payment Gateway', status: 'healthy', uptime: '99.9%', latency: '85ms' },
  { name: 'Video Conferencing', status: 'warning', uptime: '98.2%', latency: '210ms' },
  { name: 'Backup Service', status: 'healthy', uptime: '100%', latency: '—' },
];

const FALLBACK_INCIDENTS = [
  { title: 'Video service latency spike', time: '2h ago', severity: 'warning', resolved: false },
  { title: 'Scheduled maintenance completed', time: '12h ago', severity: 'info', resolved: true },
  { title: 'Storage threshold alert (80%)', time: '2d ago', severity: 'warning', resolved: true },
  { title: 'DDoS attempt blocked', time: '5d ago', severity: 'critical', resolved: true },
];

const FALLBACK_SECURITY = [
  { label: 'Blocked Threats', value: '1,247', period: 'last 30 days' },
  { label: 'SSL Certificate', value: 'Valid', period: 'expires in 286 days' },
  { label: 'Last Security Scan', value: 'Clean', period: '2 hours ago' },
  { label: 'Firewall Rules', value: '42 active', period: '3 updated today' },
];

export default function AdminSystemView() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const { data: apiSystem } = useSystemHealth();

  const systemData = apiSystem as any;
  const UPTIME_HISTORY = systemData?.uptimeHistory ?? FALLBACK_UPTIME;
  const RESOURCE_USAGE = systemData?.resourceUsage ?? FALLBACK_RESOURCES;
  const ACTIVE_SERVICES = apiSystem?.services?.map(s => ({ name: s.name, status: s.status, uptime: '—', latency: '—' })) ?? FALLBACK_SERVICES;
  const RECENT_INCIDENTS = systemData?.recentIncidents ?? FALLBACK_INCIDENTS;
  const SECURITY_METRICS = systemData?.securityMetrics ?? FALLBACK_SECURITY;

  const avgUptime = UPTIME_HISTORY.length > 0 ? +(UPTIME_HISTORY.reduce((s: number, u: any) => s + u.uptime, 0) / UPTIME_HISTORY.length).toFixed(1) : 0;
  const latestCpu = RESOURCE_USAGE.length > 0 ? RESOURCE_USAGE[RESOURCE_USAGE.length - 1].cpu : 0;
  const latestMemory = RESOURCE_USAGE.length > 0 ? RESOURCE_USAGE[RESOURCE_USAGE.length - 1].memory : 0;
  const latestStorage = RESOURCE_USAGE.length > 0 ? RESOURCE_USAGE[RESOURCE_USAGE.length - 1].storage : 0;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div data-animate className="flex items-center gap-2">
        <Monitor className="size-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-white/90">System Health</h2>
        <Badge className="border-0 bg-emerald-400/10 text-emerald-400 text-[10px] ml-auto">All Systems Operational</Badge>
      </div>

      <div data-animate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Uptime" value={avgUptime} suffix="%" decimals={1} trend="up" trendLabel="7-day avg" icon={<Server className="size-5" />} accentColor="#34d399" sparklineData={UPTIME_HISTORY.map((u: any) => u.uptime)} />
        <StatCard label="CPU Usage" value={latestCpu} suffix="%" trend="down" trendLabel="Normal load" icon={<Cpu className="size-5" />} accentColor="#818cf8" sparklineData={RESOURCE_USAGE.map((r: any) => r.cpu)} />
        <StatCard label="Memory" value={latestMemory} suffix="%" trend="up" trendLabel="" icon={<Activity className="size-5" />} accentColor="#fbbf24" sparklineData={RESOURCE_USAGE.map((r: any) => r.memory)} />
        <StatCard label="Storage" value={latestStorage} suffix="%" trend="up" trendLabel="" icon={<HardDrive className="size-5" />} accentColor="#f472b6" />
      </div>

      {/* Resource Usage Chart */}
      <div data-animate>
        <GlowLineChart
          title="Resource Usage (Today)"
          subtitle="CPU, memory, and storage utilization"
          data={RESOURCE_USAGE}
          dataKey="cpu"
          secondaryDataKey="memory"
          color="#818cf8"
          secondaryColor="#fbbf24"
          xAxisKey="name"
          height={250}
        />
      </div>

      {/* Services + Security */}
      <div data-animate className="grid gap-4 lg:grid-cols-2">
        {/* Active Services */}
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white/90 text-sm flex items-center gap-2">
              <Wifi className="size-4 text-indigo-400" />
              Active Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ACTIVE_SERVICES.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className={`size-2 rounded-full ${s.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-xs text-white/70">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/40">{s.uptime}</span>
                    <span className="text-[10px] text-white/30">{s.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white/90 text-sm flex items-center gap-2">
              <Shield className="size-4 text-emerald-400" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {SECURITY_METRICS.map((m: typeof SECURITY_METRICS[number], i: number) => (
                <div key={i} className="rounded-lg border border-white/6 bg-white/2 p-3">
                  <span className="text-[10px] text-white/30 block">{m.label}</span>
                  <span className="text-sm font-medium text-white/80">{m.value}</span>
                  <span className="text-[9px] text-white/20 block">{m.period}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white/90 text-sm flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-400" />
            Recent Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {RECENT_INCIDENTS.map((inc: typeof RECENT_INCIDENTS[number], i: number) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 px-3 py-2">
                <div className="flex items-center gap-2">
                  {inc.resolved ? (
                    <CheckCircle className="size-3 text-emerald-400" />
                  ) : (
                    <AlertTriangle className={`size-3 ${inc.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}`} />
                  )}
                  <span className="text-xs text-white/70">{inc.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30">{inc.time}</span>
                  <Badge className={`border-0 text-[9px] ${inc.resolved ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                    {inc.resolved ? 'Resolved' : 'Active'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
