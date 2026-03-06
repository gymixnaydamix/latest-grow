/* ─── SystemStatusWidget ─── Service health at a glance ───────────── */
import { useState, useEffect } from 'react';
import { Activity, CircleCheck, CircleAlert, CircleX, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ServiceStatus = 'healthy' | 'degraded' | 'down';

interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latency?: number; // ms
  message?: string;
}

interface SystemStatusWidgetProps {
  services?: ServiceHealth[];
  onRefresh?: () => void;
  className?: string;
}

const DEFAULT_SERVICES: ServiceHealth[] = [
  { name: 'API Server', status: 'healthy', latency: 42 },
  { name: 'Database', status: 'healthy', latency: 12 },
  { name: 'Redis Cache', status: 'healthy', latency: 3 },
  { name: 'WebSocket', status: 'healthy', latency: 8 },
  { name: 'AI Service', status: 'healthy', latency: 180 },
  { name: 'Storage', status: 'healthy', latency: 55 },
];

const cfg: Record<ServiceStatus, { Icon: typeof CircleCheck; cls: string; bg: string; label: string }> = {
  healthy: { Icon: CircleCheck, cls: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Healthy' },
  degraded: { Icon: CircleAlert, cls: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Degraded' },
  down: { Icon: CircleX, cls: 'text-red-400', bg: 'bg-red-400/10', label: 'Down' },
};

export function SystemStatusWidget({ services: initialServices, onRefresh, className }: SystemStatusWidgetProps) {
  const [services, setServices] = useState<ServiceHealth[]>(initialServices ?? DEFAULT_SERVICES);
  const [spinning, setSpinning] = useState(false);
  const [lastCheck, setLastCheck] = useState(new Date());

  useEffect(() => {
    if (initialServices) setServices(initialServices);
  }, [initialServices]);

  const handleRefresh = () => {
    setSpinning(true);
    onRefresh?.();
    setLastCheck(new Date());
    setTimeout(() => setSpinning(false), 800);
  };

  const overallStatus: ServiceStatus = services.some((s) => s.status === 'down')
    ? 'down'
    : services.some((s) => s.status === 'degraded')
      ? 'degraded'
      : 'healthy';

  const overall = cfg[overallStatus];

  return (
    <div className={cn('flex flex-col gap-3 rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl p-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-indigo-400" />
        <span className="text-sm font-semibold text-white/80">System Status</span>
        <Badge className={cn('ml-auto text-[9px] border-0', overall.bg, overall.cls)}>
          {overall.label}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="size-6 text-white/30 hover:text-white/60"
        >
          <RefreshCw className={cn('size-3', spinning && 'animate-spin')} />
        </Button>
      </div>

      {/* Service rows */}
      <div className="flex flex-col gap-1.5">
        {services.map((svc) => {
          const c = cfg[svc.status];
          return (
            <div
              key={svc.name}
              className="flex items-center gap-2 rounded-lg border border-white/4 bg-white/2 px-3 py-1.5 text-xs"
            >
              <c.Icon className={cn('size-3.5 shrink-0', c.cls)} />
              <span className="flex-1 text-white/70 font-medium">{svc.name}</span>
              {svc.latency !== undefined && (
                <span className="font-mono text-[10px] tabular-nums text-white/30">{svc.latency}ms</span>
              )}
              {svc.message && <span className="text-[10px] text-white/25 truncate max-w-24">{svc.message}</span>}
            </div>
          );
        })}
      </div>

      <span className="text-[9px] text-white/20 text-right">
        Last check: {lastCheck.toLocaleTimeString()}
      </span>
    </div>
  );
}
