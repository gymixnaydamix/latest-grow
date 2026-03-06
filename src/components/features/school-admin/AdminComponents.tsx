/* ─── ApprovalCard ─── Action card for pending approvals ─── */
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, User, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ApprovalItem {
  id: string;
  title: string;
  description: string;
  type: string;
  requestedBy: string;
  requestedAt: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  icon?: LucideIcon;
}

interface Props {
  item: ApprovalItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
  index?: number;
}

const priorityMap = {
  high: { label: 'Urgent', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
  medium: { label: 'Normal', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  low: { label: 'Low', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
};

export function ApprovalCard({ item, onApprove, onReject, onView, index = 0 }: Props) {
  const p = priorityMap[item.priority];
  const Icon = item.icon ?? Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group rounded-xl border border-border bg-card p-4 hover:bg-accent hover:border-white/[0.12] transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 size-9 rounded-lg bg-accent flex items-center justify-center">
          <Icon className="size-4 text-muted-foreground/70" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground/80 truncate">{item.title}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 h-5 border ${p.color}`}>
              {p.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground/60 line-clamp-1">{item.description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground/50">
            <span className="flex items-center gap-1"><User className="size-3" />{item.requestedBy}</span>
            <span className="flex items-center gap-1"><Clock className="size-3" />{item.requestedAt}</span>
            {item.dueDate && <span>Due: {item.dueDate}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            onClick={() => onApprove(item.id)}
            title="Approve"
          >
            <Check className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={() => onReject(item.id)}
            title="Reject"
          >
            <X className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground/60 hover:text-muted-foreground"
            onClick={() => onView(item.id)}
            title="View Details"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── ActionInboxItem ─── Single action item with quick actions ─── */
export interface ActionItem {
  id: string;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  dueDate: string;
  owner: string;
  deepLink?: { section: string; header?: string };
}

const actionPriorityColors = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-blue-500/20 text-blue-400',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  overdue: 'bg-red-500/20 text-red-400',
  'in-progress': 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-emerald-500/20 text-emerald-400',
};

export function ActionInboxItem({
  item, onAction, index = 0,
}: {
  item: ActionItem;
  onAction: (item: ActionItem) => void;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-border hover:border-border bg-card hover:bg-muted transition-all cursor-pointer group"
      onClick={() => onAction(item)}
    >
      <div className={`size-2 flex-shrink-0 rounded-full ${actionPriorityColors[item.priority].split(' ')[0]}`} />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm text-foreground/80">{item.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground/50">{item.category}</span>
          <span className="text-xs text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground/50">{item.owner}</span>
        </div>
      </div>
      <Badge variant="outline" className={`h-5 border-0 px-1.5 text-xs ${statusColors[item.status] ?? statusColors.pending}`}>
        {item.status}
      </Badge>
      <span className="shrink-0 text-xs text-muted-foreground/40">{item.dueDate}</span>
      <ChevronRight className="size-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 flex-shrink-0 transition-colors" />
    </motion.div>
  );
}

/* ─── StatusBadge ─── Unified status badge ─── */
const statusMap: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  enrolled: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  accepted: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  paid: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  approved: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  healthy: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  pending: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  'under review': { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  'documents pending': { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  partial: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  waitlisted: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  'interview scheduled': { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  scheduled: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  new: { bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
  rejected: { bg: 'bg-red-500/15', text: 'text-red-400' },
  overdue: { bg: 'bg-red-500/15', text: 'text-red-400' },
  suspended: { bg: 'bg-red-500/15', text: 'text-red-400' },
  inactive: { bg: 'bg-zinc-500/15', text: 'text-zinc-400' },
  withdrawn: { bg: 'bg-zinc-500/15', text: 'text-zinc-400' },
  graduated: { bg: 'bg-violet-500/15', text: 'text-violet-400' },
  transferred: { bg: 'bg-violet-500/15', text: 'text-violet-400' },
};

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const s = statusMap[status.toLowerCase()] ?? { bg: 'bg-zinc-500/15', text: 'text-zinc-400' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${s.bg} ${s.text} ${className}`}>
      {status}
    </span>
  );
}

/* ─── OperationBlock ─── Today's snapshot operational block ─── */
export function OperationBlock({
  icon: Icon, label, value, sublabel, color = 'text-foreground/80',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5 hover:bg-accent transition-all">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
          <Icon className="size-4 text-muted-foreground/70" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground/60 tracking-wide uppercase">{label}</p>
          <p className={`text-lg font-semibold leading-tight ${color}`}>{value}</p>
          {sublabel && <p className="text-[10px] text-muted-foreground/40 mt-0.5">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── WorkflowStepper ─── Stage tracker for workflows ─── */
export function WorkflowStepper({
  steps, currentStep, className = '',
}: {
  steps: { label: string; description?: string }[];
  currentStep: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-1">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${
            i < currentStep
              ? 'bg-emerald-500/15 text-emerald-400'
              : i === currentStep
              ? 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30'
              : 'bg-accent text-muted-foreground/40'
          }`}>
            <span className="font-medium">{i + 1}</span>
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && <div className="w-4 h-px bg-accent" />}
        </div>
      ))}
    </div>
  );
}

/* ─── QuickCreateDrawer items ─── */
export interface QuickCreateAction {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  onClick: () => void;
}
