import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type {
  ApiSuccessResponse,
  Applicant,
  Campaign,
  User,
  SchoolManagedUserRow,
  ParentChild,
} from '@root/types';

interface CreateApplicantPayload {
  firstName: string;
  lastName: string;
  email: string;
  stage?: string;
}

interface UpdateStagePayload {
  stage: string;
}

interface CreateCampaignPayload {
  name: string;
  channel: string;
  budget: number;
  startDate: string;
  endDate: string;
  status?: string;
}

export type SchoolUserGroup = 'staff' | 'students' | 'parents';

export interface CreateSchoolUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'FINANCE' | 'MARKETING' | 'SCHOOL' | 'STUDENT' | 'PARENT';
  password?: string;
  isActive?: boolean;
}

export interface UpdateSchoolUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'TEACHER' | 'FINANCE' | 'MARKETING' | 'SCHOOL' | 'STUDENT' | 'PARENT';
  isActive?: boolean;
}

export const adminKeys = {
  applicants: (schoolId: string) => ['admin', 'applicants', schoolId] as const,
  applicant: (id: string) => ['admin', 'applicant', id] as const,
  campaigns: (schoolId: string) => ['admin', 'campaigns', schoolId] as const,
  campaign: (id: string) => ['admin', 'campaign', id] as const,
  staff: (schoolId: string) => ['admin', 'staff', schoolId] as const,
  staffMember: (id: string) => ['admin', 'staffMember', id] as const,
  students: (schoolId: string) => ['admin', 'students', schoolId] as const,
  student: (id: string) => ['admin', 'student', id] as const,
  schoolUsersRoot: (schoolId: string) => ['admin', 'school-users', schoolId] as const,
  schoolUsers: (schoolId: string, group: SchoolUserGroup, search: string, page: number, pageSize: number) =>
    ['admin', 'school-users', schoolId, group, search, page, pageSize] as const,
  parentChildren: (schoolId: string, parentId: string) => ['admin', 'parent-children', schoolId, parentId] as const,
};

// Applicant queries
export function useApplicants(schoolId: string | null) {
  return useQuery({
    queryKey: adminKeys.applicants(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Applicant[]>>(`/admin/schools/${schoolId}/applicants`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useApplicant(id: string | null) {
  return useQuery({
    queryKey: adminKeys.applicant(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Applicant>>(`/admin/applicants/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

// Campaign queries
export function useCampaigns(schoolId: string | null) {
  return useQuery({
    queryKey: adminKeys.campaigns(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Campaign[]>>(`/admin/schools/${schoolId}/campaigns`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useCampaign(id: string | null) {
  return useQuery({
    queryKey: adminKeys.campaign(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Campaign>>(`/admin/campaigns/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

// Backward-compatible staff/student queries
export function useStaff(schoolId: string | null) {
  return useQuery({
    queryKey: adminKeys.staff(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<User[]>>(`/admin/schools/${schoolId}/staff`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useStaffMember(id: string | null) {
  return useQuery({
    queryKey: adminKeys.staffMember(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<User>>(`/admin/staff/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useStudents(schoolId: string | null) {
  return useQuery({
    queryKey: adminKeys.students(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<User[]>>(`/admin/schools/${schoolId}/students`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useStudent(id: string | null) {
  return useQuery({
    queryKey: adminKeys.student(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<User>>(`/admin/all-students/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

// New school-user queries
export function useSchoolUsers(
  schoolId: string | null,
  group: SchoolUserGroup,
  options?: { search?: string; page?: number; pageSize?: number },
) {
  const search = options?.search ?? '';
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;

  return useQuery({
    queryKey: adminKeys.schoolUsers(schoolId!, group, search, page, pageSize),
    queryFn: () =>
      api.get<ApiSuccessResponse<SchoolManagedUserRow[]>>(
        `/admin/schools/${schoolId}/users?group=${group}&search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`,
      ).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useParentChildren(schoolId: string | null, parentId: string | null) {
  return useQuery({
    queryKey: adminKeys.parentChildren(schoolId!, parentId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<ParentChild[]>>(`/admin/schools/${schoolId}/parents/${parentId}/children`).then(r => r.data),
    enabled: !!schoolId && !!parentId,
  });
}

// Applicant mutations
export function useCreateApplicant(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApplicantPayload) =>
      api.post<ApiSuccessResponse<Applicant>>(`/admin/schools/${schoolId}/applicants`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.applicants(schoolId) });
    },
  });
}

export function useUpdateApplicantStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateStagePayload) =>
      api.patch<ApiSuccessResponse<Applicant>>(`/admin/applicants/${id}/stage`, payload).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: adminKeys.applicant(vars.id) });
      qc.invalidateQueries({ queryKey: ['admin', 'applicants'] });
    },
  });
}

export function useDeleteApplicant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/admin/applicants/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'applicants'] });
    },
  });
}

// Campaign mutations
export function useCreateCampaign(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) =>
      api.post<ApiSuccessResponse<Campaign>>(`/admin/schools/${schoolId}/campaigns`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.campaigns(schoolId) });
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateCampaignPayload>) =>
      api.patch<ApiSuccessResponse<Campaign>>(`/admin/campaigns/${id}`, payload).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: adminKeys.campaign(vars.id) });
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
    },
  });
}

// School user mutations
export function useCreateSchoolUser(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSchoolUserPayload) =>
      api.post<ApiSuccessResponse<SchoolManagedUserRow>>(`/admin/schools/${schoolId}/users`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.schoolUsersRoot(schoolId) });
    },
  });
}

export function useUpdateSchoolUser(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, ...payload }: { userId: string } & UpdateSchoolUserPayload) =>
      api.patch<ApiSuccessResponse<SchoolManagedUserRow>>(`/admin/schools/${schoolId}/users/${userId}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.schoolUsersRoot(schoolId) });
    },
  });
}

export function useUpdateSchoolUserStatus(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      api.patch<ApiSuccessResponse<User>>(`/admin/schools/${schoolId}/users/${userId}/status`, { isActive }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.schoolUsersRoot(schoolId) });
    },
  });
}

export function useRemoveSchoolMembership(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.del(`/admin/schools/${schoolId}/users/${userId}/membership`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.schoolUsersRoot(schoolId) });
    },
  });
}

export function useDeleteSchoolUser(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, hard }: { userId: string; hard?: boolean }) =>
      api.del(`/admin/schools/${schoolId}/users/${userId}${hard ? '?hard=true' : ''}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.schoolUsersRoot(schoolId) });
    },
  });
}

export function useSetParentChildren(schoolId: string, parentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (childIds: string[]) =>
      api.put<ApiSuccessResponse<ParentChild[]>>(`/admin/schools/${schoolId}/parents/${parentId}/children`, { childIds }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.parentChildren(schoolId, parentId) });
      qc.invalidateQueries({ queryKey: adminKeys.schoolUsersRoot(schoolId) });
    },
  });
}
