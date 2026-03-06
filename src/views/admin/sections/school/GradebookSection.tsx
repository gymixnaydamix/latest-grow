import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import { useCourses, useSchoolGradebookSummary } from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function GradebookSection() {
  const { schoolId } = useAuthStore();
  const summaryQuery = useSchoolGradebookSummary(schoolId);
  const coursesQuery = useCourses(schoolId);

  const summary = summaryQuery.data;
  const courses = coursesQuery.data ?? [];

  return (
    <SchoolSectionShell
      title="Gradebook"
      description="School-wide gradebook analytics and course overview."
    >
      <DataState
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
        isEmpty={!summary}
        loadingLabel="Loading gradebook summary"
        emptyLabel="No gradebook data available"
        errorLabel="Failed to load gradebook summary"
        onRetry={() => summaryQuery.refetch()}
      >
        <div className="grid gap-3 md:grid-cols-4">
          <Card><CardContent className="space-y-1 p-4"><p className="text-xs text-muted-foreground">Average Score</p><p className="text-2xl font-semibold">{summary?.averageScore ?? 0}</p></CardContent></Card>
          <Card><CardContent className="space-y-1 p-4"><p className="text-xs text-muted-foreground">Honor Roll</p><p className="text-2xl font-semibold">{summary?.honorRoll ?? 0}</p></CardContent></Card>
          <Card><CardContent className="space-y-1 p-4"><p className="text-xs text-muted-foreground">At Risk</p><p className="text-2xl font-semibold">{summary?.atRisk ?? 0}</p></CardContent></Card>
          <Card><CardContent className="space-y-1 p-4"><p className="text-xs text-muted-foreground">Ungraded Students</p><p className="text-2xl font-semibold">{summary?.ungradedStudents ?? 0}</p></CardContent></Card>
        </div>
      </DataState>

      <DataState
        isLoading={coursesQuery.isLoading}
        isError={coursesQuery.isError}
        isEmpty={!courses.length}
        loadingLabel="Loading courses"
        emptyLabel="No courses found"
        errorLabel="Failed to load courses"
        onRetry={() => coursesQuery.refetch()}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Assignments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : '-'}</TableCell>
                    <TableCell>{course._count?.enrollments ?? 0}</TableCell>
                    <TableCell>{course._count?.assignments ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>
    </SchoolSectionShell>
  );
}
