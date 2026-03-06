import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import {
  useCourseCurriculumMappings,
  useCourses,
  useCreateCurriculumStandard,
  useCurriculumStandards,
  useDeleteCurriculumStandard,
  useLinkCourseCurriculum,
  useUnlinkCourseCurriculum,
  useUpdateCurriculumStandard,
} from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function CurriculumSection() {
  const { schoolId } = useAuthStore();
  const coursesQuery = useCourses(schoolId);
  const standardsQuery = useCurriculumStandards(schoolId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const [createForm, setCreateForm] = useState({
    code: '',
    title: '',
    subject: '',
    gradeLevel: '',
    description: '',
  });

  const [editForm, setEditForm] = useState({
    code: '',
    title: '',
    subject: '',
    gradeLevel: '',
    description: '',
  });

  const standards = standardsQuery.data ?? [];
  const courses = coursesQuery.data ?? [];
  const activeCourseId = selectedCourseId || courses[0]?.id || '';

  const mappingsQuery = useCourseCurriculumMappings(activeCourseId || null);
  const createMutation = useCreateCurriculumStandard(schoolId ?? '');
  const updateMutation = useUpdateCurriculumStandard(schoolId ?? '');
  const deleteMutation = useDeleteCurriculumStandard(schoolId ?? '');
  const linkMutation = useLinkCourseCurriculum(activeCourseId || '');
  const unlinkMutation = useUnlinkCourseCurriculum(activeCourseId || '');

  const linkedSet = useMemo(
    () => new Set((mappingsQuery.data ?? []).map((item) => item.standardId)),
    [mappingsQuery.data],
  );

  const submitCreate = async () => {
    await createMutation.mutateAsync(createForm);
    setCreateForm({ code: '', title: '', subject: '', gradeLevel: '', description: '' });
  };

  const submitUpdate = async (id: string) => {
    await updateMutation.mutateAsync({ id, ...editForm });
    setEditingId(null);
  };

  const toggleLink = async (standardId: string) => {
    if (!activeCourseId) return;
    if (linkedSet.has(standardId)) {
      await unlinkMutation.mutateAsync(standardId);
      return;
    }
    await linkMutation.mutateAsync(standardId);
  };

  return (
    <SchoolSectionShell
      title="Curriculum"
      description="Manage standards and map them to courses."
      actions={<Button size="sm" onClick={submitCreate} disabled={!createForm.code || !createForm.title || createMutation.isPending}>Add Standard</Button>}
    >
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <Input placeholder="Code" value={createForm.code} onChange={(e) => setCreateForm((prev) => ({ ...prev, code: e.target.value }))} />
          <Input placeholder="Title" value={createForm.title} onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))} />
          <Input placeholder="Subject" value={createForm.subject} onChange={(e) => setCreateForm((prev) => ({ ...prev, subject: e.target.value }))} />
          <Input placeholder="Grade level" value={createForm.gradeLevel} onChange={(e) => setCreateForm((prev) => ({ ...prev, gradeLevel: e.target.value }))} />
          <Input placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))} />
        </CardContent>
      </Card>

      <DataState
        isLoading={standardsQuery.isLoading}
        isError={standardsQuery.isError}
        isEmpty={!standards.length}
        loadingLabel="Loading curriculum standards"
        emptyLabel="No standards yet"
        errorLabel="Failed to load curriculum standards"
        onRetry={() => standardsQuery.refetch()}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Mapped</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standards.map((standard) => (
                  <TableRow key={standard.id}>
                    <TableCell>
                      {editingId === standard.id ? (
                        <Input value={editForm.code} onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value }))} />
                      ) : (
                        standard.code
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === standard.id ? (
                        <Input value={editForm.title} onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} />
                      ) : (
                        standard.title
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === standard.id ? (
                        <Input value={editForm.subject} onChange={(e) => setEditForm((prev) => ({ ...prev, subject: e.target.value }))} />
                      ) : (
                        standard.subject
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === standard.id ? (
                        <Input value={editForm.gradeLevel} onChange={(e) => setEditForm((prev) => ({ ...prev, gradeLevel: e.target.value }))} />
                      ) : (
                        standard.gradeLevel
                      )}
                    </TableCell>
                    <TableCell>{standard._count?.links ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {editingId === standard.id ? (
                          <>
                            <Button size="sm" onClick={() => submitUpdate(standard.id)} disabled={updateMutation.isPending}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(standard.id);
                              setEditForm({
                                code: standard.code,
                                title: standard.title,
                                subject: standard.subject,
                                gradeLevel: standard.gradeLevel,
                                description: standard.description,
                              });
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(standard.id)} disabled={deleteMutation.isPending}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Course Mapping</span>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={activeCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          <DataState
            isLoading={mappingsQuery.isLoading || coursesQuery.isLoading}
            isError={mappingsQuery.isError || coursesQuery.isError}
            isEmpty={!standards.length}
            loadingLabel="Loading mappings"
            emptyLabel="No standards to map"
            errorLabel="Failed to load mappings"
            onRetry={() => {
              void mappingsQuery.refetch();
              void coursesQuery.refetch();
            }}
          >
            <div className="grid gap-2 md:grid-cols-2">
              {standards.map((standard) => (
                <div key={standard.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <span>{standard.code} - {standard.title}</span>
                  <Button
                    size="sm"
                    variant={linkedSet.has(standard.id) ? 'secondary' : 'outline'}
                    onClick={() => void toggleLink(standard.id)}
                    disabled={linkMutation.isPending || unlinkMutation.isPending || !activeCourseId}
                  >
                    {linkedSet.has(standard.id) ? 'Unlink' : 'Link'}
                  </Button>
                </div>
              ))}
            </div>
          </DataState>
        </CardContent>
      </Card>
    </SchoolSectionShell>
  );
}
