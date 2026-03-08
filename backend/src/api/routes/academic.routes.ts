import { Router, type IRouter } from 'express';
import {
  courseController,
  assignmentController,
  submissionController,
  attendanceController,
  gradebookController,
  announcementController,
  enrollmentController,
  sessionController,
  departmentController,
  curriculumController,
  schoolGradebookController,
} from '../controllers/index.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createCourseSchema,
  updateCourseSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  createSubmissionSchema,
  gradeSubmissionSchema,
  markAttendanceSchema,
  enrollCourseSchema,
  createSessionSchema,
  updateSessionSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  idParamSchema,
  schoolIdParamSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createCurriculumStandardSchema,
  updateCurriculumStandardSchema,
  courseCurriculumParamsSchema,
  courseIdParamSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);

// Courses
router.post(
  '/schools/:schoolId/courses',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createCourseSchema }),
  courseController.create,
);
router.get('/schools/:schoolId/courses', validate({ params: schoolIdParamSchema }), courseController.list);
router.get('/courses/:id', validate({ params: idParamSchema }), courseController.getById);
router.patch('/courses/:id', authorize('PROVIDER', 'ADMIN', 'TEACHER'), validateCsrf, validate({ params: idParamSchema, body: updateCourseSchema }), courseController.update);
router.delete('/courses/:id', authorize('PROVIDER', 'ADMIN'), validateCsrf, validate({ params: idParamSchema }), courseController.delete);

// Departments
router.post(
  '/schools/:schoolId/departments',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createDepartmentSchema }),
  departmentController.create,
);
router.get(
  '/schools/:schoolId/departments',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validate({ params: schoolIdParamSchema }),
  departmentController.list,
);
router.patch(
  '/departments/:id',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateDepartmentSchema }),
  departmentController.update,
);
router.delete(
  '/departments/:id',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: idParamSchema }),
  departmentController.delete,
);

// Curriculum standards
router.post(
  '/schools/:schoolId/curriculum',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createCurriculumStandardSchema }),
  curriculumController.create,
);
router.get(
  '/schools/:schoolId/curriculum',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validate({ params: schoolIdParamSchema }),
  curriculumController.list,
);
router.patch(
  '/curriculum/:id',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateCurriculumStandardSchema }),
  curriculumController.update,
);
router.delete(
  '/curriculum/:id',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: idParamSchema }),
  curriculumController.delete,
);

// Course-standard mappings
router.get(
  '/courses/:courseId/curriculum',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validate({ params: courseIdParamSchema }),
  curriculumController.listCourseMappings,
);
router.post(
  '/courses/:courseId/curriculum/:standardId',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validateCsrf,
  validate({ params: courseCurriculumParamsSchema }),
  curriculumController.addCourseMapping,
);
router.delete(
  '/courses/:courseId/curriculum/:standardId',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validateCsrf,
  validate({ params: courseCurriculumParamsSchema }),
  curriculumController.removeCourseMapping,
);

// Assignments
router.post(
  '/assignments',
  authorize('TEACHER'),
  validateCsrf,
  validate({ body: createAssignmentSchema }),
  assignmentController.create,
);
router.get('/courses/:courseId/assignments', validate({ params: courseIdParamSchema }), assignmentController.listByCourse);
router.get('/assignments/:id', validate({ params: idParamSchema }), assignmentController.getById);
router.patch(
  '/assignments/:id',
  authorize('TEACHER', 'ADMIN'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateAssignmentSchema }),
  assignmentController.update,
);
router.delete('/assignments/:id', authorize('TEACHER', 'ADMIN'), validateCsrf, validate({ params: idParamSchema }), assignmentController.delete);

// Enrollments
router.post(
  '/courses/:courseId/enroll',
  authorize('STUDENT', 'TEACHER', 'ADMIN', 'PROVIDER'),
  validateCsrf,
  validate({ body: enrollCourseSchema }),
  enrollmentController.enroll,
);
router.delete(
  '/courses/:courseId/enroll/:studentId',
  authorize('TEACHER', 'ADMIN', 'PROVIDER'),
  validateCsrf,
  enrollmentController.unenroll,
);
router.get('/courses/:courseId/students', enrollmentController.listByCourse);
router.get('/students/:studentId/enrollments', enrollmentController.listByStudent);

// Submissions
router.post(
  '/assignments/:assignmentId/submissions',
  authorize('STUDENT'),
  validateCsrf,
  validate({ body: createSubmissionSchema }),
  submissionController.submit,
);
router.patch(
  '/submissions/:id/grade',
  authorize('TEACHER'),
  validateCsrf,
  validate({ params: idParamSchema, body: gradeSubmissionSchema }),
  submissionController.grade,
);

// Attendance
router.post(
  '/courses/:courseId/attendance',
  authorize('TEACHER'),
  validateCsrf,
  validate({ body: markAttendanceSchema }),
  attendanceController.mark,
);
router.get('/courses/:courseId/attendance', attendanceController.getByCourse);
router.get('/students/:studentId/attendance', attendanceController.getByStudent);

// Sessions (Schedule)
router.post(
  '/sessions',
  authorize('TEACHER', 'ADMIN', 'PROVIDER'),
  validateCsrf,
  validate({ body: createSessionSchema }),
  sessionController.create,
);
router.get('/courses/:courseId/sessions', sessionController.listByCourse);
router.get('/schools/:schoolId/sessions', validate({ params: schoolIdParamSchema }), sessionController.listBySchool);
router.get('/sessions/:id', validate({ params: idParamSchema }), sessionController.getById);
router.patch(
  '/sessions/:id',
  authorize('TEACHER', 'ADMIN', 'PROVIDER'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateSessionSchema }),
  sessionController.update,
);
router.delete('/sessions/:id', authorize('TEACHER', 'ADMIN', 'PROVIDER'), validateCsrf, sessionController.delete);

// Gradebook
router.get('/courses/:courseId/grades', gradebookController.getByCourse);
router.get('/students/:studentId/grades', gradebookController.getByStudent);
router.get(
  '/schools/:schoolId/gradebook/summary',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validate({ params: schoolIdParamSchema }),
  schoolGradebookController.summary,
);

// Announcements
router.post(
  '/schools/:schoolId/announcements',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validateCsrf,
  validate({ params: schoolIdParamSchema, body: createAnnouncementSchema }),
  announcementController.create,
);
router.get('/schools/:schoolId/announcements', validate({ params: schoolIdParamSchema }), announcementController.list);
router.get('/announcements/:id', validate({ params: idParamSchema }), announcementController.getById);
router.patch(
  '/announcements/:id',
  authorize('PROVIDER', 'ADMIN', 'TEACHER'),
  validateCsrf,
  validate({ params: idParamSchema, body: updateAnnouncementSchema }),
  announcementController.update,
);
router.delete(
  '/announcements/:id',
  authorize('PROVIDER', 'ADMIN'),
  validateCsrf,
  validate({ params: idParamSchema }),
  announcementController.delete,
);

export default router;
