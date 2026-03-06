/* Teacher Concierge › Class Tasks — My Tasks, Due Today, Lesson Plans, Resources, Substitutions, Completed */
import { useNavigationStore } from '@/store/navigation.store';
import { ConciergeTaskCard } from '@/components/concierge/shared';

interface TeacherTask {
  id: string;
  title: string;
  linkedEntity: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  owner: string;
  checklistTotal: number;
  checklistDone: number;
  category: 'lesson' | 'resource' | 'grading' | 'parent' | 'admin' | 'substitution';
  isBlocked?: boolean;
  blockedReason?: string;
}

const taskData: TeacherTask[] = [
  {
    id: 't1', title: 'Prepare Grade 5A fractions lesson plan', linkedEntity: 'Mathematics',
    dueDate: 'Today', priority: 'high', owner: 'Me', checklistTotal: 5, checklistDone: 3,
    category: 'lesson',
  },
  {
    id: 't2', title: 'Grade Unit 4 quizzes for Grade 6A', linkedEntity: 'Mathematics',
    dueDate: 'Today', priority: 'urgent', owner: 'Me', checklistTotal: 28, checklistDone: 12,
    category: 'grading',
  },
  {
    id: 't3', title: 'Print worksheets for Grade 4C science lab', linkedEntity: 'Science',
    dueDate: 'Today', priority: 'medium', owner: 'Me', checklistTotal: 3, checklistDone: 0,
    category: 'resource',
  },
  {
    id: 't4', title: 'Follow up with Mrs. Al-Farsi on Omar\u2019s behaviour plan', linkedEntity: 'Communication',
    dueDate: 'Tomorrow', priority: 'high', owner: 'Me', checklistTotal: 2, checklistDone: 0,
    category: 'parent', isBlocked: true, blockedReason: 'Awaiting parent response',
  },
  {
    id: 't5', title: 'Submit end-of-term report data for Grade 5A', linkedEntity: 'Administration',
    dueDate: 'Jun 15', priority: 'high', owner: 'Me', checklistTotal: 4, checklistDone: 1,
    category: 'admin',
  },
  {
    id: 't6', title: 'Prepare substitution notes for Friday absence', linkedEntity: 'Administration',
    dueDate: 'Jun 12', priority: 'medium', owner: 'Me', checklistTotal: 3, checklistDone: 0,
    category: 'substitution',
  },
  {
    id: 't7', title: 'Create geometry visual aids for next week', linkedEntity: 'Mathematics',
    dueDate: 'Jun 16', priority: 'low', owner: 'Me', checklistTotal: 4, checklistDone: 4,
    category: 'resource',
  },
  {
    id: 't8', title: 'Review and update Grade 5B lesson plan for decimals', linkedEntity: 'Mathematics',
    dueDate: 'Jun 14', priority: 'medium', owner: 'Me', checklistTotal: 3, checklistDone: 3,
    category: 'lesson',
  },
];

export function TeacherConciergeClassTasks() {
  const { activeSubNav } = useNavigationStore();

  const filtered = (() => {
    switch (activeSubNav) {
      case 'c_due_today':
        return taskData.filter((t) => t.dueDate === 'Today');
      case 'c_lesson_plans':
        return taskData.filter((t) => t.category === 'lesson');
      case 'c_resources':
        return taskData.filter((t) => t.category === 'resource');
      case 'c_substitutions':
        return taskData.filter((t) => t.category === 'substitution');
      case 'c_completed':
        return taskData.filter((t) => t.checklistTotal > 0 && t.checklistDone === t.checklistTotal);
      default:
        return taskData;
    }
  })();

  const heading = (() => {
    switch (activeSubNav) {
      case 'c_due_today': return 'Due Today';
      case 'c_lesson_plans': return 'Lesson Plans';
      case 'c_resources': return 'Resources';
      case 'c_substitutions': return 'Substitutions';
      case 'c_completed': return 'Completed';
      default: return 'My Tasks';
    }
  })();

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
