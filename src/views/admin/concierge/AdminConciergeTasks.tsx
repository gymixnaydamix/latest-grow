/* Admin Concierge › Tasks — My Tasks, Due Today, Scheduled, Waiting, Completed */
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { ConciergeTaskCard } from '@/components/concierge/shared';
import { useComplianceTasks } from '@/hooks/api/use-school-ops';

const FALLBACK_TASKS = [
  { id: 't1', title: 'Review admission for Sara Ali', linkedEntity: 'Admissions', dueDate: 'Today', priority: 'high' as const, owner: 'Admin', checklistTotal: 4, checklistDone: 2 },
  { id: 't2', title: 'Follow up overdue fees — Grade 7', linkedEntity: 'Finance', dueDate: 'Today', priority: 'urgent' as const, owner: 'Admin', checklistTotal: 3, checklistDone: 0 },
  { id: 't3', title: 'Generate end-of-term certificates', linkedEntity: 'Documents', dueDate: 'Jun 15', priority: 'medium' as const, owner: 'Admin', checklistTotal: 5, checklistDone: 5 },
  { id: 't4', title: 'Resolve timetable conflict — Science lab', linkedEntity: 'Academics', dueDate: 'Tomorrow', priority: 'high' as const, owner: 'Admin', checklistTotal: 2, checklistDone: 1 },
  { id: 't5', title: 'Prepare parent meeting agenda', linkedEntity: 'Communication', dueDate: 'Jun 18', priority: 'medium' as const, owner: 'Admin', checklistTotal: 3, checklistDone: 0, isBlocked: true, blockedReason: 'Waiting on teacher' },
  { id: 't6', title: 'Approve discount request #2034', linkedEntity: 'Finance', dueDate: 'Today', priority: 'high' as const, owner: 'Admin', checklistTotal: 2, checklistDone: 2 },
];

export function AdminConciergeTasks() {
  const { activeSubNav } = useNavigationStore();
  const { schoolId } = useAuthStore();
  const { data: apiTasks } = useComplianceTasks(schoolId);
  const taskData = (apiTasks as any[]) ?? FALLBACK_TASKS;

  const filtered = (() => {
    switch (activeSubNav) {
      case 'c_due_today': return taskData.filter((t) => t.dueDate === 'Today');
      case 'c_scheduled': return taskData.filter((t) => t.dueDate !== 'Today');
      case 'c_waiting': return taskData.filter((t) => t.isBlocked);
      case 'c_completed': return taskData.filter((t) => t.checklistTotal > 0 && t.checklistDone === t.checklistTotal);
      default: return taskData;
    }
  })();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        {activeSubNav === 'c_due_today' ? 'Due Today' :
          activeSubNav === 'c_scheduled' ? 'Scheduled' :
          activeSubNav === 'c_waiting' ? 'Waiting' :
          activeSubNav === 'c_completed' ? 'Completed' : 'My Tasks'}
      </h3>
      <div className="space-y-2">
        {filtered.map((t) => (
          <ConciergeTaskCard key={t.id} {...t} />
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No tasks in this view</p>}
      </div>
    </div>
  );
}
