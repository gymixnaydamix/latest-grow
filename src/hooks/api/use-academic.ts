import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type {
  ApiSuccessResponse,
  Course,
  Assignment,
  Submission,
  AttendanceRecord,
  Grade,
  CourseEnrollment,
  CourseSession,
  Department,
  CurriculumStandard,
  CourseCurriculumLink,
} from '@root/types';

// ── Types ──
interface CreateCoursePayload {
  name: string;
  description: string;
  gradeLevel: string;
  semester: string;
  teacherId: string;
}

interface CreateAssignmentPayload {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  type: string;
}

interface CreateSubmissionPayload {
  content: string;
}

interface GradeSubmissionPayload {
  score: number;
  feedback?: string;
}

interface MarkAttendancePayload {
  date: string;
  records: { studentId: string; status: string }[];
}

interface CreateSessionPayload {
  courseId: string;
  title?: string;
  type?: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'EXAM';
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  recurring?: boolean;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

interface GradebookSchoolSummary {
  schoolId: string;
  courseCount: number;
  studentCount: number;
  gradedStudents: number;
  totalGrades: number;
  averageScore: number;
  honorRoll: number;
  atRisk: number;
  ungradedStudents: number;
}

// ── Keys ──
export const academicKeys = {
  courses: (schoolId: string) => ['academic', 'courses', schoolId] as const,
  course: (id: string) => ['academic', 'course', id] as const,
  assignments: (courseId: string) => ['academic', 'assignments', courseId] as const,
  assignment: (id: string) => ['academic', 'assignment', id] as const,
  attendance: (courseId: string) => ['academic', 'attendance', courseId] as const,
  studentAttendance: (studentId: string) => ['academic', 'studentAttendance', studentId] as const,
  courseGrades: (courseId: string) => ['academic', 'courseGrades', courseId] as const,
  studentGrades: (studentId: string) => ['academic', 'studentGrades', studentId] as const,
  courseStudents: (courseId: string) => ['academic', 'courseStudents', courseId] as const,
  studentEnrollments: (studentId: string) => ['academic', 'studentEnrollments', studentId] as const,
  sessions: (schoolId: string) => ['academic', 'sessions', schoolId] as const,
  courseSessions: (courseId: string) => ['academic', 'courseSessions', courseId] as const,
  session: (id: string) => ['academic', 'session', id] as const,
  departments: (schoolId: string) => ['academic', 'departments', schoolId] as const,
  curriculum: (schoolId: string) => ['academic', 'curriculum', schoolId] as const,
  courseCurriculum: (courseId: string) => ['academic', 'courseCurriculum', courseId] as const,
  gradebookSummary: (schoolId: string) => ['academic', 'gradebookSummary', schoolId] as const,
};

// ── Course Queries ──
export function useCourses(schoolId: string | null) {
  return useQuery({
    queryKey: academicKeys.courses(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Course[]>>(`/academic/schools/${schoolId}/courses`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useCourse(id: string | null) {
  return useQuery({
    queryKey: academicKeys.course(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Course>>(`/academic/courses/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

// ── Assignment Queries ──
export function useAssignments(courseId: string | null) {
  return useQuery({
    queryKey: academicKeys.assignments(courseId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Assignment[]>>(`/academic/courses/${courseId}/assignments`).then(r => r.data),
    enabled: !!courseId,
  });
}

export function useAssignment(id: string | null) {
  return useQuery({
    queryKey: academicKeys.assignment(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Assignment>>(`/academic/assignments/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

// ── Attendance Queries ──
export function useCourseAttendance(courseId: string | null) {
  return useQuery({
    queryKey: academicKeys.attendance(courseId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<AttendanceRecord[]>>(`/academic/courses/${courseId}/attendance`).then(r => r.data),
    enabled: !!courseId,
  });
}

export function useStudentAttendance(studentId: string | null) {
  return useQuery({
    queryKey: academicKeys.studentAttendance(studentId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<AttendanceRecord[]>>(`/academic/students/${studentId}/attendance`).then(r => r.data),
    enabled: !!studentId,
  });
}

// ── Gradebook Queries ──
export function useCourseGrades(courseId: string | null) {
  return useQuery({
    queryKey: academicKeys.courseGrades(courseId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Grade[]>>(`/academic/courses/${courseId}/grades`).then(r => r.data),
    enabled: !!courseId,
  });
}

export function useStudentGrades(studentId: string | null) {
  return useQuery({
    queryKey: academicKeys.studentGrades(studentId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Grade[]>>(`/academic/students/${studentId}/grades`).then(r => r.data),
    enabled: !!studentId,
  });
}

// ── Course Mutations ──
export function useCreateCourse(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) =>
      api.post<ApiSuccessResponse<Course>>(`/academic/schools/${schoolId}/courses`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.courses(schoolId) });
    },
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateCoursePayload>) =>
      api.patch<ApiSuccessResponse<Course>>(`/academic/courses/${id}`, payload).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: academicKeys.course(vars.id) });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del(`/academic/courses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['academic', 'courses'] });
    },
  });
}

// ── Assignment Mutations ──
export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) =>
      api.post<ApiSuccessResponse<Assignment>>('/academic/assignments', payload).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: academicKeys.assignments(vars.courseId) });
    },
  });
}

// ── Submission Mutations ──
export function useSubmitAssignment(assignmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubmissionPayload) =>
      api.post<ApiSuccessResponse<Submission>>(`/academic/assignments/${assignmentId}/submissions`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.assignments(assignmentId) });
    },
  });
}

export function useGradeSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & GradeSubmissionPayload) =>
      api.patch<ApiSuccessResponse<Submission>>(`/academic/submissions/${id}/grade`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['academic'] });
    },
  });
}

// ── Attendance Mutations ──
export function useMarkAttendance(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkAttendancePayload) =>
      api.post<ApiSuccessResponse<AttendanceRecord[]>>(`/academic/courses/${courseId}/attendance`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.attendance(courseId) });
    },
  });
}

// ── Enrollment Queries ──
export function useCourseStudents(courseId: string | null) {
  return useQuery({
    queryKey: academicKeys.courseStudents(courseId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<CourseEnrollment[]>>(`/academic/courses/${courseId}/students`).then(r => r.data),
    enabled: !!courseId,
  });
}

export function useStudentEnrollments(studentId: string | null) {
  return useQuery({
    queryKey: academicKeys.studentEnrollments(studentId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<CourseEnrollment[]>>(`/academic/students/${studentId}/enrollments`).then(r => r.data),
    enabled: !!studentId,
  });
}

// ── Enrollment Mutations ──
export function useEnrollStudent(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId?: string) =>
      api.post<ApiSuccessResponse<CourseEnrollment>>(`/academic/courses/${courseId}/enroll`, studentId ? { studentId } : {}).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.courseStudents(courseId) });
      qc.invalidateQueries({ queryKey: academicKeys.course(courseId) });
    },
  });
}

export function useUnenrollStudent(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) =>
      api.del(`/academic/courses/${courseId}/enroll/${studentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.courseStudents(courseId) });
      qc.invalidateQueries({ queryKey: academicKeys.course(courseId) });
    },
  });
}

// ── Assignment Mutation (update/delete) ──
export function useUpdateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; title?: string; description?: string; dueDate?: string; maxScore?: number; type?: string }) =>
      api.patch<ApiSuccessResponse<Assignment>>(`/academic/assignments/${id}`, payload).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: academicKeys.assignment(vars.id) });
    },
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del(`/academic/assignments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['academic', 'assignments'] });
    },
  });
}

// ── Session Queries ──
export function useCourseSessions(courseId: string | null) {
  return useQuery({
    queryKey: academicKeys.courseSessions(courseId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<CourseSession[]>>(`/academic/courses/${courseId}/sessions`).then(r => r.data),
    enabled: !!courseId,
  });
}

export function useSchoolSessions(schoolId: string | null) {
  return useQuery({
    queryKey: academicKeys.sessions(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<CourseSession[]>>(`/academic/schools/${schoolId}/sessions`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useSession(id: string | null) {
  return useQuery({
    queryKey: academicKeys.session(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<CourseSession>>(`/academic/sessions/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

// ── Session Mutations ──
export function useCreateSession(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSessionPayload) =>
      api.post<ApiSuccessResponse<CourseSession>>('/academic/sessions', payload).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: academicKeys.sessions(schoolId) });
      qc.invalidateQueries({ queryKey: academicKeys.courseSessions(vars.courseId) });
    },
  });
}

export function useUpdateSession(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<Omit<CreateSessionPayload, 'courseId'>>) =>
      api.patch<ApiSuccessResponse<CourseSession>>(`/academic/sessions/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.sessions(schoolId) });
    },
  });
}

export function useDeleteSession(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del(`/academic/sessions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.sessions(schoolId) });
    },
  });
}

// Departments
export function useDepartments(schoolId: string | null) {
  return useQuery({
    queryKey: academicKeys.departments(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Department[]>>(`/academic/schools/${schoolId}/departments`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useCreateDepartment(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; headId?: string }) =>
      api.post<ApiSuccessResponse<Department>>(`/academic/schools/${schoolId}/departments`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.departments(schoolId) });
    },
  });
}

export function useUpdateDepartment(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name?: string; description?: string; headId?: string | null }) =>
      api.patch<ApiSuccessResponse<Department>>(`/academic/departments/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.departments(schoolId) });
    },
  });
}

export function useDeleteDepartment(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/academic/departments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.departments(schoolId) });
    },
  });
}

// Curriculum standards
export function useCurriculumStandards(schoolId: string | null) {
  return useQuery({
    queryKey: academicKeys.curriculum(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<CurriculumStandard[]>>(`/academic/schools/${schoolId}/curriculum`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useCreateCurriculumStandard(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { code: string; title: string; description?: string; subject?: string; gradeLevel?: string }) =>
      api.post<ApiSuccessResponse<CurriculumStandard>>(`/academic/schools/${schoolId}/curriculum`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.curriculum(schoolId) });
    },
  });
}

export function useUpdateCurriculumStandard(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; code?: string; title?: string; description?: string; subject?: string; gradeLevel?: string }) =>
      api.patch<ApiSuccessResponse<CurriculumStandard>>(`/academic/curriculum/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.curriculum(schoolId) });
    },
  });
}

export function useDeleteCurriculumStandard(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/academic/curriculum/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.curriculum(schoolId) });
    },
  });
}

export function useCourseCurriculumMappings(courseId: string | null) {
  return useQuery({
    queryKey: academicKeys.courseCurriculum(courseId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<CourseCurriculumLink[]>>(`/academic/courses/${courseId}/curriculum`).then(r => r.data),
    enabled: !!courseId,
  });
}

export function useLinkCourseCurriculum(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (standardId: string) =>
      api.post<ApiSuccessResponse<CourseCurriculumLink>>(`/academic/courses/${courseId}/curriculum/${standardId}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.courseCurriculum(courseId) });
    },
  });
}

export function useUnlinkCourseCurriculum(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (standardId: string) =>
      api.del(`/academic/courses/${courseId}/curriculum/${standardId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: academicKeys.courseCurriculum(courseId) });
    },
  });
}

export function useSchoolGradebookSummary(schoolId: string | null) {
  return useQuery({
    queryKey: academicKeys.gradebookSummary(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<GradebookSchoolSummary>>(`/academic/schools/${schoolId}/gradebook/summary`).then(r => r.data),
    enabled: !!schoolId,
  });
}
