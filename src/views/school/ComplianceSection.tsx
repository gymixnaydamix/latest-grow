/* ─── ComplianceSection ─── Compliance & policy tracking ──── */
import { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, FileText, Calendar, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';

interface PolicyItem {
  id: string;
  name: string;
  category: string;
  status: 'compliant' | 'non-compliant' | 'pending' | 'expiring';
  dueDate: string;
  progress: number;
  lastAudit: string;
}

const POLICIES: PolicyItem[] = [
  { id: '1', name: 'Student Data Privacy (FERPA)', category: 'Data Protection', status: 'compliant', dueDate: '2025-12-31', progress: 100, lastAudit: '2025-02-15' },
  { id: '2', name: 'Fire Safety Certification', category: 'Safety', status: 'compliant', dueDate: '2025-09-30', progress: 100, lastAudit: '2025-01-20' },
  { id: '3', name: 'Accessibility (ADA) Compliance', category: 'Accessibility', status: 'pending', dueDate: '2025-06-30', progress: 68, lastAudit: '2024-11-10' },
  { id: '4', name: 'Staff Background Checks', category: 'HR', status: 'expiring', dueDate: '2025-04-15', progress: 85, lastAudit: '2025-03-01' },
  { id: '5', name: 'Health & Hygiene Standards', category: 'Health', status: 'compliant', dueDate: '2025-08-31', progress: 100, lastAudit: '2025-02-28' },
  { id: '6', name: 'Curriculum State Alignment', category: 'Academic', status: 'non-compliant', dueDate: '2025-05-01', progress: 42, lastAudit: '2025-01-05' },
  { id: '7', name: 'Emergency Evacuation Plan', category: 'Safety', status: 'compliant', dueDate: '2025-11-15', progress: 100, lastAudit: '2025-03-10' },
  { id: '8', name: 'Anti-Bullying Policy', category: 'Student Welfare', status: 'pending', dueDate: '2025-07-20', progress: 55, lastAudit: '2024-12-01' },
];

const STATUS_MAP: Record<PolicyItem['status'], { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  compliant: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: <CheckCircle2 className="size-3" />, label: 'Compliant' },
  'non-compliant': { color: 'text-rose-400', bg: 'bg-rose-400/10', icon: <AlertTriangle className="size-3" />, label: 'Non-Compliant' },
  pending: { color: 'text-amber-400', bg: 'bg-amber-400/10', icon: <Clock className="size-3" />, label: 'Pending' },
  expiring: { color: 'text-orange-400', bg: 'bg-orange-400/10', icon: <AlertTriangle className="size-3" />, label: 'Expiring Soon' },
};

export default function ComplianceSection() {
  const containerRef = useStaggerAnimate([]);
  const [filter, setFilter] = useState<PolicyItem['status'] | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === 'all' ? POLICIES : POLICIES.filter(p => p.status === filter);
  const counts = {
    compliant: POLICIES.filter(p => p.status === 'compliant').length,
    'non-compliant': POLICIES.filter(p => p.status === 'non-compliant').length,
    pending: POLICIES.filter(p => p.status === 'pending').length,
    expiring: POLICIES.filter(p => p.status === 'expiring').length,
  };
  const overallScore = Math.round(POLICIES.reduce((s, p) => s + p.progress, 0) / POLICIES.length);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div data-animate className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white/90">Compliance & Policies</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/70 gap-1.5">
          <RefreshCw className="size-3" /> Run Audit
        </Button>
      </div>

      {/* Summary row */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl col-span-2 md:col-span-1 text-center">
          <CardContent className="pt-4 pb-3 flex flex-col items-center gap-1">
            <div className="relative size-16">
              <svg viewBox="0 0 36 36" className="size-16 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className="text-white/6" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" className="text-emerald-400" strokeWidth="3" strokeDasharray={`${overallScore} ${100 - overallScore}`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white/90">{overallScore}%</span>
            </div>
            <span className="text-[10px] text-white/40 mt-1">Overall Score</span>
          </CardContent>
        </Card>

        {(Object.keys(counts) as PolicyItem['status'][]).map(s => {
          const st = STATUS_MAP[s];
          return (
            <Card key={s} className={cn('border-white/6 bg-white/3 backdrop-blur-xl cursor-pointer transition-colors', filter === s && 'ring-1 ring-white/10')} onClick={() => setFilter(filter === s ? 'all' : s)}>
              <CardContent className="pt-3 pb-2 flex flex-col items-center gap-1">
                <span className={cn('text-2xl font-bold', st.color)}>{counts[s]}</span>
                <div className={cn('flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5', st.bg, st.color)}>{st.icon}{st.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Policy list */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-white/90 text-sm flex items-center gap-2"><FileText className="size-4 text-indigo-400" />Policies & Certifications</CardTitle>
          <Badge variant="outline" className="border-white/10 text-white/40 text-[10px]">{filtered.length} items</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {filtered.map(p => {
            const st = STATUS_MAP[p.status];
            const isOpen = expanded === p.id;
            return (
              <div key={p.id} className="rounded-lg border border-white/4 bg-white/2 overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : p.id)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left">
                  {isOpen ? <ChevronDown className="size-3.5 text-white/30" /> : <ChevronRight className="size-3.5 text-white/30" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/70 truncate">{p.name}</p>
                    <p className="text-[10px] text-white/30">{p.category}</p>
                  </div>
                  <div className="w-24 hidden sm:block">
                    <Progress value={p.progress} className="h-1.5" />
                    <span className="text-[9px] text-white/25 mt-0.5 block text-right">{p.progress}%</span>
                  </div>
                  <Badge className={cn('border-0 text-[10px] gap-1', st.bg, st.color)}>{st.icon}{st.label}</Badge>
                </button>
                {isOpen && (
                  <div className="border-t border-white/4 bg-white/1 px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px]">
                    <div>
                      <span className="text-white/25 block">Due Date</span>
                      <span className="text-white/60 flex items-center gap-1"><Calendar className="size-2.5" />{new Date(p.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-white/25 block">Last Audit</span>
                      <span className="text-white/60">{new Date(p.lastAudit).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-white/25 block">Progress</span>
                      <div className="flex items-center gap-2"><Progress value={p.progress} className="h-1 flex-1" /><span className="text-white/40">{p.progress}%</span></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
