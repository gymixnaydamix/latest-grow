/* ─── PayrollView ─── Finance payroll management ──────────────────── */
import { useState } from 'react';
import { DollarSign, Users, Calendar, Download, Search, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { StatCard } from '@/components/features/StatCard';import { usePayroll } from '@/hooks/api/use-finance';
type PayStatus = 'paid' | 'pending' | 'processing';

interface PayrollEntry {
  id: string;
  name: string;
  role: string;
  department: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: PayStatus;
  payDate: string;
}

const STATUS_CFG: Record<PayStatus, { Icon: typeof CheckCircle; cls: string; bg: string }> = {
  paid: { Icon: CheckCircle, cls: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  pending: { Icon: Clock, cls: 'text-amber-400', bg: 'bg-amber-400/10' },
  processing: { Icon: AlertTriangle, cls: 'text-indigo-400', bg: 'bg-indigo-400/10' },
};

const FALLBACK_PAYROLL: PayrollEntry[] = [
  { id: '1', name: 'Dr. Amanda Smith', role: 'Teacher', department: 'Mathematics', baseSalary: 65000, bonus: 2000, deductions: 8500, netPay: 58500, status: 'paid', payDate: '2025-03-15' },
  { id: '2', name: 'James Wilson', role: 'Teacher', department: 'Science', baseSalary: 62000, bonus: 1500, deductions: 8000, netPay: 55500, status: 'paid', payDate: '2025-03-15' },
  { id: '3', name: 'Lisa Chen', role: 'Admin Staff', department: 'Front Office', baseSalary: 45000, bonus: 0, deductions: 5800, netPay: 39200, status: 'processing', payDate: '2025-03-15' },
  { id: '4', name: 'Robert Davis', role: 'Custodian', department: 'Facilities', baseSalary: 38000, bonus: 500, deductions: 4900, netPay: 33600, status: 'pending', payDate: '2025-03-15' },
  { id: '5', name: 'Maria Garcia', role: 'Counselor', department: 'Student Services', baseSalary: 58000, bonus: 1000, deductions: 7500, netPay: 51500, status: 'paid', payDate: '2025-03-15' },
  { id: '6', name: 'Tom Brown', role: 'IT Specialist', department: 'Technology', baseSalary: 72000, bonus: 3000, deductions: 9800, netPay: 65200, status: 'paid', payDate: '2025-03-15' },
];

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function PayrollView() {
  const containerRef = useStaggerAnimate([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PayStatus>('all');

  const { data: apiPayroll } = usePayroll();

  const MOCK_PAYROLL: PayrollEntry[] = (apiPayroll as any[])?.map((p: any) => ({
    id: p.id, name: p.staffName ?? p.staffId ?? '', role: p.role ?? '',
    department: p.department ?? '', baseSalary: Number(p.grossAmount ?? 0),
    bonus: Number(p.bonus ?? 0),
    deductions: Object.values(p.deductions ?? {}).reduce((s: number, v: any) => s + Number(v), 0) as number,
    netPay: Number(p.netAmount ?? p.grossAmount ?? 0),
    status: (p.status?.toLowerCase() ?? 'pending') as PayStatus,
    payDate: p.period ?? p.createdAt ?? '',
  })) ?? FALLBACK_PAYROLL;

  const filtered = MOCK_PAYROLL.filter((e) => {
    const s = statusFilter === 'all' || e.status === statusFilter;
    const q = e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase());
    return s && q;
  });

  const totalNet = MOCK_PAYROLL.reduce((s, e) => s + e.netPay, 0);
  const totalBonus = MOCK_PAYROLL.reduce((s, e) => s + e.bonus, 0);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div data-animate className="flex items-center gap-2">
        <DollarSign className="size-5 text-emerald-400" />
        <h2 className="text-lg font-bold text-white/90">Payroll Management</h2>
        <Badge className="border-0 bg-white/5 text-white/40 text-[10px] ml-2">March 2025</Badge>
      </div>

      {/* KPIs */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Payroll" value={totalNet} prefix="$" icon={<DollarSign className="size-5" />} trend="up" trendLabel="+2.1%" />
        <StatCard label="Employees" value={MOCK_PAYROLL.length} icon={<Users className="size-5" />} trend="up" trendLabel="+1%" />
        <StatCard label="Total Bonuses" value={totalBonus} prefix="$" icon={<DollarSign className="size-5" />} trend="up" trendLabel="+15%" />
        <StatCard label="Pay Date" value={15} suffix=" Mar" icon={<Calendar className="size-5" />} />
      </div>

      {/* Table */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-white/90 text-sm">Pay Run Details</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-9 bg-white/4 border-white/8 text-white/80 text-xs h-8" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | PayStatus)} className="rounded-md border border-white/8 bg-white/4 px-2 py-1 text-[11px] text-white/60 outline-none">
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
              </select>
              <Button variant="outline" size="sm" className="text-xs border-white/10 text-white/50 gap-1 h-8"><Download className="size-3" />Export</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/6 text-white/40">
                  <th className="px-3 py-2 text-left font-medium">Employee</th>
                  <th className="px-3 py-2 text-left font-medium">Department</th>
                  <th className="px-3 py-2 text-right font-medium">Base</th>
                  <th className="px-3 py-2 text-right font-medium">Bonus</th>
                  <th className="px-3 py-2 text-right font-medium">Deductions</th>
                  <th className="px-3 py-2 text-right font-medium">Net Pay</th>
                  <th className="px-3 py-2 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const s = STATUS_CFG[e.status];
                  return (
                    <tr key={e.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                      <td className="px-3 py-2.5">
                        <p className="text-white/70 font-medium">{e.name}</p>
                        <p className="text-[10px] text-white/30">{e.role}</p>
                      </td>
                      <td className="px-3 py-2.5 text-white/50">{e.department}</td>
                      <td className="px-3 py-2.5 text-right text-white/50 font-mono tabular-nums">{fmt(e.baseSalary)}</td>
                      <td className="px-3 py-2.5 text-right text-emerald-400/80 font-mono tabular-nums">+{fmt(e.bonus)}</td>
                      <td className="px-3 py-2.5 text-right text-red-400/60 font-mono tabular-nums">-{fmt(e.deductions)}</td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-white/80 font-semibold">{fmt(e.netPay)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge className={cn('border-0 text-[9px] capitalize', s.bg, s.cls)}>{e.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/8">
                  <td colSpan={5} className="px-3 py-2.5 text-right text-white/50 font-medium">Total Net Pay</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-white/90 font-bold">{fmt(filtered.reduce((s, e) => s + e.netPay, 0))}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
