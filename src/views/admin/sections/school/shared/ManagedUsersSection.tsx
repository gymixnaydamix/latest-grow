import { useMemo, useState } from 'react';
import type { SchoolManagedUserRow } from '@root/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateSchoolUser,
  useDeleteSchoolUser,
  useParentChildren,
  useRemoveSchoolMembership,
  useSchoolUsers,
  useSetParentChildren,
  useUpdateSchoolUser,
  useUpdateSchoolUserStatus,
  type SchoolUserGroup,
} from '@/hooks/api';
import { DataState, SchoolSectionShell } from './SchoolSection';

interface ManagedUsersSectionProps {
  group: SchoolUserGroup;
}

const groupTitle: Record<SchoolUserGroup, string> = {
  staff: 'Manage Staff',
  students: 'Manage Students',
  parents: 'Manage Parents',
};

const defaultRoleByGroup: Record<SchoolUserGroup, 'TEACHER' | 'STUDENT' | 'PARENT'> = {
  staff: 'TEACHER',
  students: 'STUDENT',
  parents: 'PARENT',
};

const staffRoles = ['ADMIN', 'TEACHER', 'FINANCE', 'MARKETING', 'SCHOOL'] as const;

export function ManagedUsersSection({ group }: ManagedUsersSectionProps) {
  const { schoolId } = useAuthStore();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: defaultRoleByGroup[group] as 'ADMIN' | 'TEACHER' | 'FINANCE' | 'MARKETING' | 'SCHOOL' | 'STUDENT' | 'PARENT',
  });

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: defaultRoleByGroup[group] as 'ADMIN' | 'TEACHER' | 'FINANCE' | 'MARKETING' | 'SCHOOL' | 'STUDENT' | 'PARENT',
  });

  const usersQuery = useSchoolUsers(schoolId, group, { search, pageSize: 100 });
  const studentsQuery = useSchoolUsers(schoolId, 'students', { pageSize: 200 });
  const parentChildrenQuery = useParentChildren(schoolId, selectedParentId);

  const createMutation = useCreateSchoolUser(schoolId ?? '');
  const updateMutation = useUpdateSchoolUser(schoolId ?? '');
  const statusMutation = useUpdateSchoolUserStatus(schoolId ?? '');
  const removeMembershipMutation = useRemoveSchoolMembership(schoolId ?? '');
  const deleteUserMutation = useDeleteSchoolUser(schoolId ?? '');
  const setParentChildrenMutation = useSetParentChildren(schoolId ?? '', selectedParentId ?? '');

  const selectedChildIds = useMemo(
    () => new Set((parentChildrenQuery.data ?? []).map((link) => link.studentId)),
    [parentChildrenQuery.data],
  );

  const users = usersQuery.data ?? [];

  const startEditing = (row: SchoolManagedUserRow) => {
    setEditingId(row.id);
    setEditForm({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      role: row.role as typeof editForm.role,
    });
  };

  const submitCreate = async () => {
    if (!schoolId) return;
    await createMutation.mutateAsync(createForm);
    setCreateForm({
      firstName: '',
      lastName: '',
      email: '',
      role: defaultRoleByGroup[group],
    });
  };

  const submitUpdate = async (userId: string) => {
    await updateMutation.mutateAsync({ userId, ...editForm });
    setEditingId(null);
  };

  const toggleChild = async (studentId: string, checked: boolean) => {
    if (!selectedParentId) return;
    const next = new Set(selectedChildIds);
    if (checked) {
      next.add(studentId);
    } else {
      next.delete(studentId);
    }
    await setParentChildrenMutation.mutateAsync(Array.from(next));
  };

  return (
    <SchoolSectionShell
      title={groupTitle[group]}
      description="Create, edit, deactivate, and remove school memberships."
      actions={
        <Button size="sm" onClick={submitCreate} disabled={!createForm.firstName || !createForm.lastName || !createForm.email || createMutation.isPending}>
          Add
        </Button>
      }
    >
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <Input
            placeholder="First name"
            value={createForm.firstName}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, firstName: e.target.value }))}
          />
          <Input
            placeholder="Last name"
            value={createForm.lastName}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, lastName: e.target.value }))}
          />
          <Input
            placeholder="Email"
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          {group === 'staff' ? (
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={createForm.role}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value as typeof prev.role }))}
            >
              {staffRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          ) : (
            <Input value={createForm.role} disabled />
          )}
          <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardContent>
      </Card>

      <DataState
        isLoading={usersQuery.isLoading}
        isError={usersQuery.isError}
        isEmpty={!users.length}
        loadingLabel="Loading users"
        emptyLabel="No users found"
        errorLabel="Failed to load users"
        onRetry={() => usersQuery.refetch()}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[340px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {editingId === row.id ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Input value={editForm.firstName} onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))} />
                          <Input value={editForm.lastName} onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))} />
                        </div>
                      ) : (
                        `${row.firstName} ${row.lastName}`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        <Input value={editForm.email} onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))} />
                      ) : (
                        row.email
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === row.id ? (
                        group === 'staff' ? (
                          <select
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={editForm.role}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value as typeof prev.role }))}
                          >
                            {staffRoles.map((role) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        ) : (
                          <Input value={editForm.role} disabled />
                        )
                      ) : (
                        row.role
                      )}
                    </TableCell>
                    <TableCell>{row.isActive ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {editingId === row.id ? (
                          <>
                            <Button size="sm" onClick={() => submitUpdate(row.id)} disabled={updateMutation.isPending}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => startEditing(row)}>Edit</Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => statusMutation.mutate({ userId: row.id, isActive: !row.isActive })}
                          disabled={statusMutation.isPending}
                        >
                          {row.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeMembershipMutation.mutate(row.id)}
                          disabled={removeMembershipMutation.isPending}
                        >
                          Remove Membership
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteUserMutation.mutate({ userId: row.id, hard: true })}
                          disabled={deleteUserMutation.isPending}
                        >
                          Hard Delete
                        </Button>
                        {group === 'parents' ? (
                          <Button
                            size="sm"
                            variant={selectedParentId === row.id ? 'default' : 'secondary'}
                            onClick={() => setSelectedParentId((prev) => (prev === row.id ? null : row.id))}
                          >
                            Children
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>

      {group === 'parents' && selectedParentId ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium">Link Children to Selected Parent</p>
            <DataState
              isLoading={parentChildrenQuery.isLoading || studentsQuery.isLoading}
              isError={parentChildrenQuery.isError || studentsQuery.isError}
              isEmpty={!(studentsQuery.data ?? []).length}
              loadingLabel="Loading children"
              emptyLabel="No students available"
              errorLabel="Failed to load children"
              onRetry={() => {
                void parentChildrenQuery.refetch();
                void studentsQuery.refetch();
              }}
            >
              <div className="grid gap-2 md:grid-cols-2">
                {(studentsQuery.data ?? []).map((student) => (
                  <label key={student.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <Checkbox
                      checked={selectedChildIds.has(student.id)}
                      onCheckedChange={(checked) => void toggleChild(student.id, Boolean(checked))}
                    />
                    <span>{student.firstName} {student.lastName}</span>
                    <span className="text-xs text-muted-foreground">{student.email}</span>
                  </label>
                ))}
              </div>
            </DataState>
          </CardContent>
        </Card>
      ) : null}
    </SchoolSectionShell>
  );
}
