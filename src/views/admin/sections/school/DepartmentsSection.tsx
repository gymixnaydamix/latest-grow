import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useSchoolUsers,
  useUpdateDepartment,
} from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function DepartmentsSection() {
  const { schoolId } = useAuthStore();
  const departmentsQuery = useDepartments(schoolId);
  const staffQuery = useSchoolUsers(schoolId, 'staff', { pageSize: 100 });

  const createMutation = useCreateDepartment(schoolId ?? '');
  const updateMutation = useUpdateDepartment(schoolId ?? '');
  const deleteMutation = useDeleteDepartment(schoolId ?? '');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', headId: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '', headId: '' });

  const departments = departmentsQuery.data ?? [];
  const staff = staffQuery.data ?? [];

  const submitCreate = async () => {
    await createMutation.mutateAsync({
      name: form.name,
      description: form.description,
      headId: form.headId || undefined,
    });
    setForm({ name: '', description: '', headId: '' });
  };

  const submitUpdate = async (id: string) => {
    await updateMutation.mutateAsync({
      id,
      name: editForm.name,
      description: editForm.description,
      headId: editForm.headId || null,
    });
    setEditingId(null);
  };

  return (
    <SchoolSectionShell
      title="Departments"
      description="Create and maintain school departments and heads."
      actions={<Button size="sm" onClick={submitCreate} disabled={!form.name || createMutation.isPending}>Add Department</Button>}
    >
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-3">
          <Input placeholder="Department name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={form.headId}
            onChange={(e) => setForm((prev) => ({ ...prev, headId: e.target.value }))}
          >
            <option value="">No head assigned</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      <DataState
        isLoading={departmentsQuery.isLoading}
        isError={departmentsQuery.isError}
        isEmpty={!departments.length}
        loadingLabel="Loading departments"
        emptyLabel="No departments yet"
        errorLabel="Failed to load departments"
        onRetry={() => departmentsQuery.refetch()}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      {editingId === department.id ? (
                        <Input value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} />
                      ) : (
                        department.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === department.id ? (
                        <Input value={editForm.description} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} />
                      ) : (
                        department.description
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === department.id ? (
                        <select
                          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                          value={editForm.headId}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, headId: e.target.value }))}
                        >
                          <option value="">No head assigned</option>
                          {staff.map((member) => (
                            <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                          ))}
                        </select>
                      ) : (
                        department.head ? `${department.head.firstName} ${department.head.lastName}` : 'Unassigned'
                      )}
                    </TableCell>
                    <TableCell>{department._count?.courses ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingId === department.id ? (
                          <>
                            <Button size="sm" onClick={() => submitUpdate(department.id)} disabled={updateMutation.isPending}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(department.id);
                              setEditForm({
                                name: department.name,
                                description: department.description,
                                headId: department.headId ?? '',
                              });
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(department.id)} disabled={deleteMutation.isPending}>
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
    </SchoolSectionShell>
  );
}
