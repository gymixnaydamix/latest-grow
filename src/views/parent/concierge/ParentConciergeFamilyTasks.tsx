/* Parent Concierge › Family Tasks — All Tasks, Due Today, Per Child, Approvals Needed, Scheduled, Completed */
import { useNavigationStore } from '@/store/navigation.store';
import { ConciergeTaskCard } from '@/components/concierge/shared';

interface ParentTask {
  id: string;
  title: string;
  linkedEntity: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  owner: string;
  checklistTotal: number;
  checklistDone: number;
  category: 'fee' | 'form' | 'permission' | 'medical' | 'uniform' | 'enrollment';
  child: string;
  isBlocked?: boolean;
  blockedReason?: string;
}

const taskData: ParentTask[] = [
  {
    id: 'pt1', title: 'Pay Term 3 tuition fee', linkedEntity: 'Finance',
    dueDate: 'Today', priority: 'urgent', owner: 'Me', checklistTotal: 3, checklistDone: 1,
    category: 'fee', child: 'Aarav Sharma — Grade 5',
  },
  {
    id: 'pt2', title: 'Submit permission slip for science museum trip', linkedEntity: 'Academic',
    dueDate: 'Today', priority: 'high', owner: 'Me', checklistTotal: 2, checklistDone: 0,
    category: 'permission', child: 'Aarav Sharma — Grade 5',
  },
  {
    id: 'pt3', title: 'Upload doctor\'s fitness certificate', linkedEntity: 'Medical',
    dueDate: 'Tomorrow', priority: 'high', owner: 'Me', checklistTotal: 2, checklistDone: 0,
    category: 'medical', child: 'Meera Sharma — Grade 2',
    isBlocked: true, blockedReason: 'Awaiting doctor appointment',
  },
  {
    id: 'pt4', title: 'Complete re-enrollment form for 2026–2027', linkedEntity: 'Administration',
    dueDate: 'Mar 15', priority: 'high', owner: 'Me', checklistTotal: 6, checklistDone: 2,
    category: 'enrollment', child: 'Aarav Sharma — Grade 5',
  },
  {
    id: 'pt5', title: 'Order new winter uniform set', linkedEntity: 'Administration',
    dueDate: 'Mar 20', priority: 'medium', owner: 'Me', checklistTotal: 3, checklistDone: 0,
    category: 'uniform', child: 'Meera Sharma — Grade 2',
  },
  {
    id: 'pt6', title: 'Submit transport fee installment', linkedEntity: 'Finance',
    dueDate: 'Mar 10', priority: 'high', owner: 'Me', checklistTotal: 2, checklistDone: 1,
    category: 'fee', child: 'Aarav Sharma — Grade 5',
  },
  {
    id: 'pt7', title: 'Fill annual health declaration form', linkedEntity: 'Medical',
    dueDate: 'Mar 18', priority: 'medium', owner: 'Me', checklistTotal: 4, checklistDone: 4,
    category: 'form', child: 'Aarav Sharma — Grade 5',
  },
  {
    id: 'pt8', title: 'Approve field trip consent — Meera', linkedEntity: 'Academic',
    dueDate: 'Today', priority: 'high', owner: 'Me', checklistTotal: 1, checklistDone: 0,
    category: 'permission', child: 'Meera Sharma — Grade 2',
  },
];

export function ParentConciergeFamilyTasks() {
  const { activeSubNav } = useNavigationStore();

  const filtered = (() => {
    switch (activeSubNav) {
      case 'c_due_today':
        return taskData.filter((t) => t.dueDate === 'Today');
      case 'c_per_child':
        return taskData;
      case 'c_approvals_needed':
        return taskData.filter((t) => t.category === 'permission' || t.category === 'enrollment');
      case 'c_scheduled':
        return taskData.filter((t) => t.dueDate !== 'Today' && t.dueDate !== 'Tomorrow' && t.checklistDone < t.checklistTotal);
      case 'c_completed':
        return taskData.filter((t) => t.checklistTotal > 0 && t.checklistDone === t.checklistTotal);
      default:
        return taskData;
    }
  })();

  const heading = (() => {
    switch (activeSubNav) {
      case 'c_due_today': return 'Due Today';
      case 'c_per_child': return 'Per Child';
      case 'c_approvals_needed': return 'Approvals Needed';
      case 'c_scheduled': return 'Scheduled';
      case 'c_completed': return 'Completed';
      default: return 'All Tasks';
    }
  })();

  /* ── Per-child grouped view ── */
  if (activeSubNav === 'c_per_child') {
    const children = [...new Set(taskData.map((t) => t.child))];
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Tasks by Child</h3>
        {children.map((child) => (
          <div key={child} className="space-y-2">
            <h4 className="text-xs font-semibold text-primary/80">{child}</h4>
            {taskData.filter((t) => t.child === child).map((t) => (
              <ConciergeTaskCard key={t.id} {...t} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
      <div className="space-y-2">
        {filtered.map((t) => (
          <ConciergeTaskCard key={t.id} {...t} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No tasks in this view</p>
        )}
      </div>
    </div>
  );
}
