import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Helpers
const DAY = 86_400_000;
const now = Date.now();
function daysFromNow(d: number) { return new Date(now + d * DAY); }
function daysAgo(d: number) { return new Date(now - d * DAY); }

async function main() {
  console.log('🌱 Seeding database...');

  // ─────────────────────────────────────────────────────────
  // 1. Provider user
  // ─────────────────────────────────────────────────────────
  const provider = await prisma.user.upsert({
    where: { email: 'provider@growyourneed.dev' },
    update: {},
    create: {
      email: 'provider@growyourneed.dev',
      passwordHash: await bcrypt.hash('provider123', 12),
      firstName: 'Super',
      lastName: 'Admin',
      role: 'PROVIDER',
    },
  });

  // ─────────────────────────────────────────────────────────
  // 2. Demo school
  // ─────────────────────────────────────────────────────────
  const school = await prisma.school.upsert({
    where: { id: 'demo-school-001' },
    update: {},
    create: {
      id: 'demo-school-001',
      name: 'Greenfield Academy',
      address: '123 Education Lane, Springfield',
      phone: '+1-555-0100',
      email: 'info@greenfield.edu',
      website: 'https://greenfield.edu',
      branding: {
        primaryColor: '#2563EB',
        secondaryColor: '#10B981',
        logo: '/assets/greenfield-logo.png',
      },
    },
  });
  const SID = school.id;

  await prisma.schoolMember.upsert({
    where: { userId_schoolId: { userId: provider.id, schoolId: SID } },
    update: {},
    create: { userId: provider.id, schoolId: SID, role: 'PROVIDER' },
  });

  // ─────────────────────────────────────────────────────────
  // 3. Role users
  // ─────────────────────────────────────────────────────────
  const roleData = [
    { email: 'admin@greenfield.edu', first: 'Alice', last: 'Admin', role: 'ADMIN' as const },
    { email: 'teacher@greenfield.edu', first: 'Tanya', last: 'Teacher', role: 'TEACHER' as const },
    { email: 'teacher2@greenfield.edu', first: 'Tom', last: 'Brooks', role: 'TEACHER' as const },
    { email: 'student@greenfield.edu', first: 'Sam', last: 'Student', role: 'STUDENT' as const },
    { email: 'student2@greenfield.edu', first: 'Emma', last: 'Watson', role: 'STUDENT' as const },
    { email: 'student3@greenfield.edu', first: 'Liam', last: 'Chen', role: 'STUDENT' as const },
    { email: 'parent@greenfield.edu', first: 'Pat', last: 'Parent', role: 'PARENT' as const },
    { email: 'parent2@greenfield.edu', first: 'Jane', last: 'Doe', role: 'PARENT' as const },
    { email: 'finance@greenfield.edu', first: 'Frank', last: 'Finance', role: 'FINANCE' as const },
    { email: 'marketing@greenfield.edu', first: 'Maya', last: 'Marketing', role: 'MARKETING' as const },
    { email: 'school@greenfield.edu', first: 'Serena', last: 'Leader', role: 'SCHOOL' as const },
  ];

  const passwordHash = await bcrypt.hash('demo123', 12);
  const users: Record<string, { id: string }> = {};

  for (const r of roleData) {
    const user = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: { email: r.email, passwordHash, firstName: r.first, lastName: r.last, role: r.role },
    });
    users[r.email] = user;

    await prisma.schoolMember.upsert({
      where: { userId_schoolId: { userId: user.id, schoolId: SID } },
      update: {},
      create: { userId: user.id, schoolId: SID, role: r.role },
    });
  }

  const admin = users['admin@greenfield.edu'];
  const teacher = users['teacher@greenfield.edu'];
  const teacher2 = users['teacher2@greenfield.edu'];
  const student = users['student@greenfield.edu'];
  const student2 = users['student2@greenfield.edu'];
  const student3 = users['student3@greenfield.edu'];
  const parent = users['parent@greenfield.edu'];
  const parent2 = users['parent2@greenfield.edu'];
  const finance = users['finance@greenfield.edu'];

  // ─────────────────────────────────────────────────────────
  // 4. Parent-Child relationships
  // ─────────────────────────────────────────────────────────
  for (const [p, s] of [[parent, student], [parent, student2], [parent2, student3]]) {
    await prisma.parentChild.upsert({
      where: { parentId_studentId: { parentId: p.id, studentId: s.id } },
      update: {},
      create: { parentId: p.id, studentId: s.id },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 5. Courses
  // ─────────────────────────────────────────────────────────
  const courseData = [
    { id: 'demo-course-001', name: 'Introduction to Mathematics', desc: 'Core mathematics curriculum for Grade 9', grade: '9', sem: 'Fall 2025', tid: teacher.id },
    { id: 'demo-course-002', name: 'English Literature', desc: 'Exploring classic and modern literature', grade: '9', sem: 'Fall 2025', tid: teacher.id },
    { id: 'demo-course-003', name: 'Biology 101', desc: 'Fundamentals of life science', grade: '10', sem: 'Fall 2025', tid: teacher2.id },
    { id: 'demo-course-004', name: 'World History', desc: 'A survey of major civilizations', grade: '10', sem: 'Fall 2025', tid: teacher2.id },
    { id: 'demo-course-005', name: 'Computer Science Intro', desc: 'Basics of programming and algorithms', grade: '9', sem: 'Fall 2025', tid: teacher.id },
  ];

  const courses: Record<string, { id: string }> = {};
  for (const c of courseData) {
    const course = await prisma.course.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, schoolId: SID, name: c.name, description: c.desc, gradeLevel: c.grade, semester: c.sem, teacherId: c.tid },
    });
    courses[c.id] = course;
  }

  // Enroll students in courses
  const enrollments = [
    [student.id, 'demo-course-001'], [student.id, 'demo-course-002'], [student.id, 'demo-course-005'],
    [student2.id, 'demo-course-001'], [student2.id, 'demo-course-003'],
    [student3.id, 'demo-course-003'], [student3.id, 'demo-course-004'],
  ];
  for (const [sid, cid] of enrollments) {
    await prisma.courseEnrollment.upsert({
      where: { studentId_courseId: { studentId: sid, courseId: cid } },
      update: {},
      create: { studentId: sid, courseId: cid },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 6. Assignments
  // ─────────────────────────────────────────────────────────
  const assignmentData = [
    { id: 'demo-assignment-001', cid: 'demo-course-001', title: 'Algebra Fundamentals Quiz', desc: 'Complete all problems from Chapter 1', due: 7, max: 100, type: 'QUIZ' },
    { id: 'demo-assignment-002', cid: 'demo-course-001', title: 'Geometry Homework #1', desc: 'Solve exercises 1-20 on pages 45-47', due: 14, max: 50, type: 'HOMEWORK' },
    { id: 'demo-assignment-003', cid: 'demo-course-002', title: 'Book Report: To Kill a Mockingbird', desc: 'Write a 500-word analysis', due: 21, max: 100, type: 'ESSAY' },
    { id: 'demo-assignment-004', cid: 'demo-course-003', title: 'Cell Structure Lab Report', desc: 'Document your findings from the microscopy lab', due: 10, max: 80, type: 'LAB' },
    { id: 'demo-assignment-005', cid: 'demo-course-005', title: 'Python Basics Project', desc: 'Create a simple calculator program', due: 14, max: 100, type: 'PROJECT' },
    { id: 'demo-assignment-006', cid: 'demo-course-004', title: 'Ancient Civilizations Essay', desc: 'Compare and contrast Roman and Greek societies', due: 18, max: 100, type: 'ESSAY' },
  ];

  for (const a of assignmentData) {
    await prisma.assignment.upsert({
      where: { id: a.id },
      update: {},
      create: { id: a.id, courseId: a.cid, title: a.title, description: a.desc, dueDate: daysFromNow(a.due), maxScore: a.max, type: a.type },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 7. Submissions & Grades
  // ─────────────────────────────────────────────────────────
  // Student Sam submitted assignment 1 with a grade
  await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: 'demo-assignment-001', studentId: student.id } },
    update: {},
    create: { assignmentId: 'demo-assignment-001', studentId: student.id, content: 'Completed all algebra problems. See attached work.', score: 88, feedback: 'Good work! Watch out for sign errors in Q5.' },
  });
  await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: 'demo-assignment-003', studentId: student.id } },
    update: {},
    create: { assignmentId: 'demo-assignment-003', studentId: student.id, content: 'Harper Lee\'s masterpiece explores themes of justice and moral growth...', score: 92, feedback: 'Excellent analysis of Atticus Finch\'s character.' },
  });
  await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: 'demo-assignment-001', studentId: student2.id } },
    update: {},
    create: { assignmentId: 'demo-assignment-001', studentId: student2.id, content: 'All problems solved with detailed work shown.', score: 95, feedback: 'Outstanding!' },
  });

  // Grades for courses (use createMany to skip duplicates)
  await prisma.grade.createMany({
    data: [
      { studentId: student.id, courseId: 'demo-course-001', assignmentId: 'demo-assignment-001', score: 88, weight: 1.0 },
      { studentId: student.id, courseId: 'demo-course-002', assignmentId: 'demo-assignment-003', score: 92, weight: 1.0 },
      { studentId: student2.id, courseId: 'demo-course-001', assignmentId: 'demo-assignment-001', score: 95, weight: 1.0 },
    ],
    skipDuplicates: true,
  });

  // ─────────────────────────────────────────────────────────
  // 8. Attendance (last 5 days for course 001)
  // ─────────────────────────────────────────────────────────
  const statuses: Array<'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'> = ['PRESENT', 'PRESENT', 'LATE', 'PRESENT', 'PRESENT'];
  for (let i = 1; i <= 5; i++) {
    const date = daysAgo(i);
    for (const sid of [student.id, student2.id]) {
      const status = sid === student.id ? statuses[i - 1] : 'PRESENT';
      await prisma.attendance.upsert({
        where: { studentId_courseId_date: { studentId: sid, courseId: 'demo-course-001', date } },
        update: {},
        create: { studentId: sid, courseId: 'demo-course-001', date, status },
      });
    }
  }

  // ─────────────────────────────────────────────────────────
  // 9. Announcements
  // ─────────────────────────────────────────────────────────
  const announcements = [
    { id: 'demo-announce-001', title: 'Welcome to the New School Year!', body: 'We are excited to kick off the 2025-2026 school year. Please review the updated handbook.', audience: ['PROVIDER', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'FINANCE', 'MARKETING', 'SCHOOL'], authorId: provider.id },
    { id: 'demo-announce-002', title: 'Parent-Teacher Conference', body: 'Parent-teacher conferences will be held next Friday from 3pm to 6pm. Please sign up for a slot.', audience: ['PARENT', 'TEACHER'], authorId: admin.id },
    { id: 'demo-announce-003', title: 'Fire Drill Scheduled', body: 'A fire drill will take place on Wednesday at 10:00 AM. Please follow evacuation procedures.', audience: ['ADMIN', 'TEACHER', 'STUDENT'], authorId: admin.id },
    { id: 'demo-announce-004', title: 'Science Fair Registration Open', body: 'Students interested in the annual science fair can register through the student portal by October 15th.', audience: ['STUDENT', 'PARENT', 'TEACHER'], authorId: teacher.id },
  ];
  for (const a of announcements) {
    await prisma.announcement.upsert({
      where: { id: a.id },
      update: {},
      create: { id: a.id, schoolId: SID, authorId: a.authorId, title: a.title, body: a.body, audience: a.audience as any, publishedAt: new Date() },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 10. Message Threads
  // ─────────────────────────────────────────────────────────
  // Use raw SQL for MessageThread since Prisma 7 pg adapter has validation issues
  await prisma.$executeRaw`
    INSERT INTO "MessageThread" (id, "schoolId", subject, "participantIds", "lastMessageAt", "createdAt", "updatedAt")
    VALUES ('demo-thread-001', ${SID}, 'Question about homework', ARRAY[${parent.id}, ${teacher.id}]::text[], NOW(), NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  await prisma.$executeRaw`
    INSERT INTO "Message" (id, "threadId", "senderId", body, "sentAt", "createdAt")
    VALUES ('demo-msg-001', 'demo-thread-001', ${parent.id}, 'Hi! My child is struggling with the algebra homework. Can we discuss extra help?', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  await prisma.$executeRaw`
    INSERT INTO "Message" (id, "threadId", "senderId", body, "sentAt", "createdAt")
    VALUES ('demo-msg-002', 'demo-thread-001', ${teacher.id}, 'Of course! I have office hours on Tuesday 3-4pm. Sam can come for extra practice.', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `;

  await prisma.$executeRaw`
    INSERT INTO "MessageThread" (id, "schoolId", subject, "participantIds", "lastMessageAt", "createdAt", "updatedAt")
    VALUES ('demo-thread-002', ${SID}, 'Budget Review Meeting', ARRAY[${admin.id}, ${finance.id}]::text[], NOW(), NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  await prisma.$executeRaw`
    INSERT INTO "Message" (id, "threadId", "senderId", body, "sentAt", "createdAt")
    VALUES ('demo-msg-003', 'demo-thread-002', ${admin.id}, 'Can we schedule a meeting to review Q3 budgets?', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `;

  // ─────────────────────────────────────────────────────────
  // 11. Finance: Tuition Plans
  // ─────────────────────────────────────────────────────────
  const tuitionPlans = [
    { id: 'demo-tuition-001', name: 'Grade 9 Standard', gradeLevel: '9', amount: 1200, frequency: 'MONTHLY' },
    { id: 'demo-tuition-002', name: 'Grade 10 Standard', gradeLevel: '10', amount: 1350, frequency: 'MONTHLY' },
    { id: 'demo-tuition-003', name: 'Grade 9 Annual', gradeLevel: '9', amount: 12000, frequency: 'YEARLY' },
  ];
  for (const t of tuitionPlans) {
    await prisma.tuitionPlan.upsert({
      where: { id: t.id },
      update: {},
      create: { id: t.id, schoolId: SID, name: t.name, gradeLevel: t.gradeLevel, amount: t.amount, frequency: t.frequency },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 12. Finance: Invoices & Payments
  // ─────────────────────────────────────────────────────────
  const inv1 = await prisma.invoice.upsert({
    where: { id: 'demo-inv-001' },
    update: {},
    create: {
      id: 'demo-inv-001', schoolId: SID, parentId: parent.id, studentId: student.id,
      items: [{ description: 'Tuition - September 2025', quantity: 1, unitPrice: 1200, total: 1200 }, { description: 'Lab Fee', quantity: 1, unitPrice: 150, total: 150 }],
      totalAmount: 1350, amountPaid: 1350, currency: 'USD', status: 'PAID', dueDate: daysAgo(15), paidAt: daysAgo(10),
    },
  });
  await prisma.payment.upsert({
    where: { id: 'demo-pay-001' },
    update: {},
    create: { id: 'demo-pay-001', invoiceId: inv1.id, amount: 1350, currency: 'USD', method: 'CREDIT_CARD', transactionRef: 'TXN-2025-0001', paidAt: daysAgo(10) },
  });

  await prisma.invoice.upsert({
    where: { id: 'demo-inv-002' },
    update: {},
    create: {
      id: 'demo-inv-002', schoolId: SID, parentId: parent.id, studentId: student.id,
      items: [{ description: 'Tuition - October 2025', quantity: 1, unitPrice: 1200, total: 1200 }],
      totalAmount: 1200, amountPaid: 0, currency: 'USD', status: 'ISSUED', dueDate: daysFromNow(15),
    },
  });

  await prisma.invoice.upsert({
    where: { id: 'demo-inv-003' },
    update: {},
    create: {
      id: 'demo-inv-003', schoolId: SID, parentId: parent2.id, studentId: student3.id,
      items: [{ description: 'Tuition - September 2025', quantity: 1, unitPrice: 1350, total: 1350 }],
      totalAmount: 1350, amountPaid: 0, currency: 'USD', status: 'OVERDUE', dueDate: daysAgo(5),
    },
  });

  // ─────────────────────────────────────────────────────────
  // 13. Finance: Budgets
  // ─────────────────────────────────────────────────────────
  const budgets = [
    { dept: 'Administration', alloc: 150000, spent: 87500 },
    { dept: 'Academics', alloc: 200000, spent: 124000 },
    { dept: 'Athletics', alloc: 75000, spent: 32000 },
    { dept: 'Technology', alloc: 100000, spent: 68000 },
    { dept: 'Facilities', alloc: 120000, spent: 95000 },
  ];
  for (const b of budgets) {
    await prisma.budget.upsert({
      where: { schoolId_department_fiscalYear: { schoolId: SID, department: b.dept, fiscalYear: 2025 } },
      update: {},
      create: { schoolId: SID, department: b.dept, fiscalYear: 2025, allocatedAmount: b.alloc, spentAmount: b.spent },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 14. Finance: Payroll
  // ─────────────────────────────────────────────────────────
  for (const t of [teacher, teacher2]) {
    await prisma.payrollRecord.create({
      data: { staffId: t.id, period: '2025-09', grossAmount: 5200, deductions: { tax: 780, insurance: 320 }, netAmount: 4100 },
    });
  }
  await prisma.payrollRecord.create({
    data: { staffId: admin.id, period: '2025-09', grossAmount: 6000, deductions: { tax: 900, insurance: 320 }, netAmount: 4780 },
  });

  // ─────────────────────────────────────────────────────────
  // 15. Finance: Grants
  // ─────────────────────────────────────────────────────────
  await prisma.grantRecord.upsert({
    where: { id: 'demo-grant-001' },
    update: {},
    create: { id: 'demo-grant-001', schoolId: SID, name: 'STEM Education Grant', amount: 50000, status: 'APPROVED', deadline: daysFromNow(90), notes: 'Federal STEM initiative funding' },
  });
  await prisma.grantRecord.upsert({
    where: { id: 'demo-grant-002' },
    update: {},
    create: { id: 'demo-grant-002', schoolId: SID, name: 'Arts & Culture Fund', amount: 25000, status: 'APPLIED', deadline: daysFromNow(60), notes: 'State arts funding program' },
  });

  // ─────────────────────────────────────────────────────────
  // 16. Facilities
  // ─────────────────────────────────────────────────────────
  const facilities = [
    { id: 'demo-fac-001', name: 'Main Auditorium', type: 'AUDITORIUM', capacity: 500, status: 'AVAILABLE' as const },
    { id: 'demo-fac-002', name: 'Science Lab A', type: 'LABORATORY', capacity: 30, status: 'AVAILABLE' as const },
    { id: 'demo-fac-003', name: 'Gymnasium', type: 'GYM', capacity: 200, status: 'AVAILABLE' as const },
    { id: 'demo-fac-004', name: 'Computer Lab', type: 'LABORATORY', capacity: 35, status: 'MAINTENANCE' as const },
    { id: 'demo-fac-005', name: 'Conference Room B', type: 'CONFERENCE', capacity: 20, status: 'AVAILABLE' as const },
  ];
  for (const f of facilities) {
    await prisma.facility.upsert({
      where: { id: f.id },
      update: {},
      create: { id: f.id, schoolId: SID, name: f.name, type: f.type, capacity: f.capacity, status: f.status },
    });
  }

  // Bookings
  await prisma.facilityBooking.upsert({
    where: { id: 'demo-book-001' },
    update: {},
    create: { id: 'demo-book-001', facilityId: 'demo-fac-001', reservedBy: admin.id, startTime: daysFromNow(3), endTime: new Date(daysFromNow(3).getTime() + 2 * 3600000), purpose: 'Parent-Teacher Conference' },
  });
  await prisma.facilityBooking.upsert({
    where: { id: 'demo-book-002' },
    update: {},
    create: { id: 'demo-book-002', facilityId: 'demo-fac-003', reservedBy: teacher.id, startTime: daysFromNow(1), endTime: new Date(daysFromNow(1).getTime() + 1.5 * 3600000), purpose: 'Basketball Practice' },
  });

  // ─────────────────────────────────────────────────────────
  // -------------------------------------------------------------------------
  // 16.5 Admin School subnav fixtures (departments, curriculum, transport, library)
  // -------------------------------------------------------------------------
  const departments = [
    { id: 'demo-dept-001', name: 'Mathematics', description: 'Math and quantitative sciences', headId: teacher.id },
    { id: 'demo-dept-002', name: 'Science', description: 'Life and physical sciences', headId: teacher2.id },
  ];
  for (const d of departments) {
    await prisma.department.upsert({
      where: { id: d.id },
      update: {},
      create: { id: d.id, schoolId: SID, name: d.name, description: d.description, headId: d.headId },
    });
  }

  await prisma.course.updateMany({
    where: { id: { in: ['demo-course-001', 'demo-course-002', 'demo-course-005'] } },
    data: { departmentId: 'demo-dept-001' },
  });
  await prisma.course.updateMany({
    where: { id: { in: ['demo-course-003', 'demo-course-004'] } },
    data: { departmentId: 'demo-dept-002' },
  });

  const standards = [
    { id: 'demo-std-001', code: 'MTH-G9-ALG', title: 'Algebra Foundations', subject: 'Mathematics', gradeLevel: '9' },
    { id: 'demo-std-002', code: 'SCI-G10-BIO', title: 'Biology Basics', subject: 'Science', gradeLevel: '10' },
    { id: 'demo-std-003', code: 'CS-G9-PY', title: 'Programming Fundamentals', subject: 'Computer Science', gradeLevel: '9' },
  ];
  for (const s of standards) {
    await prisma.curriculumStandard.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        schoolId: SID,
        code: s.code,
        title: s.title,
        description: '',
        subject: s.subject,
        gradeLevel: s.gradeLevel,
      },
    });
  }

  const links = [
    { id: 'demo-link-001', courseId: 'demo-course-001', standardId: 'demo-std-001' },
    { id: 'demo-link-002', courseId: 'demo-course-003', standardId: 'demo-std-002' },
    { id: 'demo-link-003', courseId: 'demo-course-005', standardId: 'demo-std-003' },
  ];
  for (const link of links) {
    await prisma.courseCurriculumLink.upsert({
      where: { courseId_standardId: { courseId: link.courseId, standardId: link.standardId } },
      update: {},
      create: link,
    });
  }

  const expenses = [
    { id: 'demo-exp-001', category: 'Utilities', description: 'Electricity bill - September', amount: 1850, vendor: 'City Utilities', status: 'PAID', incurredAt: daysAgo(10) },
    { id: 'demo-exp-002', category: 'Supplies', description: 'Science lab consumables', amount: 620, vendor: 'Lab Co', status: 'APPROVED', incurredAt: daysAgo(6) },
    { id: 'demo-exp-003', category: 'Transport', description: 'Fuel refill for school buses', amount: 430, vendor: 'Fuel Station', status: 'SUBMITTED', incurredAt: daysAgo(3) },
  ];
  for (const expense of expenses) {
    await prisma.expenseRecord.upsert({
      where: { id: expense.id },
      update: {},
      create: {
        ...expense,
        schoolId: SID,
        notes: '',
        createdBy: finance.id,
      },
    });
  }

  const maintenance = [
    { id: 'demo-maint-001', facilityId: 'demo-fac-004', title: 'Projector replacement', description: 'Projector in computer lab is not powering on', priority: 'HIGH', status: 'OPEN', assignedTo: admin.id, requestedBy: teacher.id },
    { id: 'demo-maint-002', facilityId: 'demo-fac-003', title: 'Gym floor polish', description: 'Quarterly floor maintenance', priority: 'MEDIUM', status: 'IN_PROGRESS', assignedTo: admin.id, requestedBy: teacher2.id },
  ];
  for (const m of maintenance) {
    await prisma.maintenanceRequest.upsert({
      where: { id: m.id },
      update: {},
      create: {
        ...m,
        schoolId: SID,
        notes: '',
      },
    });
  }

  await prisma.transportRoute.upsert({
    where: { id: 'demo-route-001' },
    update: {},
    create: {
      id: 'demo-route-001',
      schoolId: SID,
      name: 'North Route',
      code: 'NR-01',
      driverName: 'Samuel Driver',
      vehicleNumber: 'BUS-12',
      capacity: 48,
      isActive: true,
    },
  });
  await prisma.transportStop.upsert({
    where: { id: 'demo-stop-001' },
    update: {},
    create: { id: 'demo-stop-001', routeId: 'demo-route-001', name: 'Maple Avenue', address: 'Maple Avenue', sequence: 1, scheduledTime: '07:10' },
  });
  await prisma.transportStop.upsert({
    where: { id: 'demo-stop-002' },
    update: {},
    create: { id: 'demo-stop-002', routeId: 'demo-route-001', name: 'Oak Street', address: 'Oak Street', sequence: 2, scheduledTime: '07:25' },
  });
  await prisma.transportAssignment.upsert({
    where: { id: 'demo-assignment-route-001' },
    update: {},
    create: {
      id: 'demo-assignment-route-001',
      schoolId: SID,
      routeId: 'demo-route-001',
      userId: student.id,
      stopId: 'demo-stop-001',
      status: 'ACTIVE',
      notes: '',
    },
  });
  await prisma.transportTrackingEvent.upsert({
    where: { id: 'demo-track-001' },
    update: {},
    create: {
      id: 'demo-track-001',
      assignmentId: 'demo-assignment-route-001',
      status: 'IN_TRANSIT',
      note: 'Student boarded bus',
      recordedBy: admin.id,
    },
  });

  await prisma.libraryItem.upsert({
    where: { id: 'demo-lib-001' },
    update: {},
    create: {
      id: 'demo-lib-001',
      schoolId: SID,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      category: 'Literature',
      totalCopies: 10,
      availableCopies: 9,
      shelfLocation: 'A-12',
      isbn: '9780061120084',
      description: '',
    },
  });
  await prisma.libraryLoan.upsert({
    where: { id: 'demo-loan-001' },
    update: {},
    create: {
      id: 'demo-loan-001',
      schoolId: SID,
      itemId: 'demo-lib-001',
      borrowerId: student2.id,
      dueAt: daysFromNow(14),
      status: 'OUT',
      notes: '',
    },
  });

  // 17. Policies
  // ─────────────────────────────────────────────────────────
  const policies = [
    { id: 'demo-pol-001', title: 'Student Code of Conduct', body: 'All students are expected to maintain high standards of behavior...', status: 'PUBLISHED' as const, publishedAt: daysAgo(30) },
    { id: 'demo-pol-002', title: 'Anti-Bullying Policy', body: 'Greenfield Academy has zero tolerance for bullying in any form...', status: 'PUBLISHED' as const, publishedAt: daysAgo(60) },
    { id: 'demo-pol-003', title: 'Technology Acceptable Use Policy', body: 'School devices and network must be used for educational purposes only...', status: 'DRAFT' as const, publishedAt: null },
  ];
  for (const p of policies) {
    await prisma.policy.upsert({
      where: { id: p.id },
      update: {},
      create: { id: p.id, schoolId: SID, title: p.title, body: p.body, status: p.status, publishedAt: p.publishedAt },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 18. Events
  // ─────────────────────────────────────────────────────────
  const events = [
    { id: 'demo-evt-001', title: 'Fall Sports Day', desc: 'Annual inter-house sports competition', start: 14, end: 14, type: 'SPORTS' as const, audience: ['STUDENT', 'TEACHER', 'PARENT'] },
    { id: 'demo-evt-002', title: 'Science Fair', desc: 'Student science project exhibition', start: 30, end: 30, type: 'ACADEMIC' as const, audience: ['STUDENT', 'TEACHER', 'PARENT'] },
    { id: 'demo-evt-003', title: 'Winter Holiday', desc: 'Winter break begins', start: 60, end: 74, type: 'HOLIDAY' as const, audience: ['PROVIDER', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'FINANCE', 'MARKETING', 'SCHOOL'] },
    { id: 'demo-evt-004', title: 'Staff Meeting', desc: 'Monthly all-staff meeting', start: 5, end: 5, type: 'MEETING' as const, audience: ['ADMIN', 'TEACHER'] },
    { id: 'demo-evt-005', title: 'Cultural Night', desc: 'Celebrating diversity through food, music, and dance', start: 21, end: 21, type: 'CULTURAL' as const, audience: ['STUDENT', 'TEACHER', 'PARENT'] },
  ];
  for (const e of events) {
    await prisma.schoolEvent.upsert({
      where: { id: e.id },
      update: {},
      create: { id: e.id, schoolId: SID, title: e.title, description: e.desc, startDate: daysFromNow(e.start), endDate: daysFromNow(e.end), type: e.type, audience: e.audience as any },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 19. Strategic Goals
  // ─────────────────────────────────────────────────────────
  const goals = [
    { id: 'demo-goal-001', title: 'Improve Math Scores by 15%', desc: 'Increase standardized math test scores across all grades', progress: 45, target: 180, status: 'IN_PROGRESS' as const },
    { id: 'demo-goal-002', title: 'Reduce Student Absenteeism', desc: 'Bring chronic absenteeism below 5%', progress: 60, target: 120, status: 'IN_PROGRESS' as const },
    { id: 'demo-goal-003', title: '100% Digital Classrooms', desc: 'Equip every classroom with smart boards and 1:1 devices', progress: 80, target: 90, status: 'IN_PROGRESS' as const },
    { id: 'demo-goal-004', title: 'New STEM Lab', desc: 'Build and equip a state-of-the-art STEM laboratory', progress: 0, target: 365, status: 'NOT_STARTED' as const },
  ];
  for (const g of goals) {
    await prisma.strategicGoal.upsert({
      where: { id: g.id },
      update: {},
      create: { id: g.id, schoolId: SID, title: g.title, description: g.desc, progress: g.progress, targetDate: daysFromNow(g.target), status: g.status },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 20. Compliance Reports
  // ─────────────────────────────────────────────────────────
  await prisma.complianceReport.upsert({
    where: { id: 'demo-comp-001' },
    update: {},
    create: { id: 'demo-comp-001', schoolId: SID, title: 'Fire Safety Inspection', type: 'SAFETY', content: { inspector: 'John Smith', rating: 'PASS', notes: 'All exits clear. Sprinklers functional.' }, status: 'COMPLETED' },
  });
  await prisma.complianceReport.upsert({
    where: { id: 'demo-comp-002' },
    update: {},
    create: { id: 'demo-comp-002', schoolId: SID, title: 'Annual Accreditation Review', type: 'ACCREDITATION', content: { body: 'AdvancED', year: 2025, status: 'In Progress' }, status: 'DRAFT' },
  });

  // ─────────────────────────────────────────────────────────
  // 21. Applicants (Admissions Pipeline)
  // ─────────────────────────────────────────────────────────
  const applicants = [
    { id: 'demo-app-001', first: 'Oliver', last: 'Smith', email: 'oliver.smith@family.com', stage: 'INQUIRY' as const },
    { id: 'demo-app-002', first: 'Sophia', last: 'Johnson', email: 'sophia.j@family.com', stage: 'APPLICATION' as const },
    { id: 'demo-app-003', first: 'Noah', last: 'Williams', email: 'noah.w@family.com', stage: 'REVIEW' as const },
    { id: 'demo-app-004', first: 'Ava', last: 'Brown', email: 'ava.brown@family.com', stage: 'ACCEPTED' as const },
    { id: 'demo-app-005', first: 'James', last: 'Davis', email: 'james.d@family.com', stage: 'ENROLLED' as const },
  ];
  for (const a of applicants) {
    await prisma.applicant.upsert({
      where: { id: a.id },
      update: {},
      create: { id: a.id, schoolId: SID, firstName: a.first, lastName: a.last, email: a.email, stage: a.stage },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 22. Campaigns
  // ─────────────────────────────────────────────────────────
  const campaigns = [
    { id: 'demo-camp-001', name: 'Fall Open House', channel: 'EMAIL' as const, status: 'ACTIVE' as const, budget: 5000, start: -7, end: 30, metrics: { sent: 1200, opened: 780, clicked: 340, converted: 45 } },
    { id: 'demo-camp-002', name: 'Social Media Awareness', channel: 'SOCIAL' as const, status: 'ACTIVE' as const, budget: 3000, start: -14, end: 60, metrics: { impressions: 25000, clicks: 1800, followers: 320, leads: 85 } },
    { id: 'demo-camp-003', name: 'Google Ads - Enrollment', channel: 'GOOGLE_ADS' as const, status: 'PAUSED' as const, budget: 8000, start: -30, end: 90, metrics: { impressions: 50000, clicks: 3200, ctr: 6.4, conversions: 120 } },
  ];
  for (const c of campaigns) {
    await prisma.campaign.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, schoolId: SID, name: c.name, channel: c.channel, status: c.status, budget: c.budget, startDate: daysFromNow(c.start), endDate: daysFromNow(c.end), metrics: c.metrics },
    });
  }

  // ─────────────────────────────────────────────────────────
  // 23. Parent: Digest Config
  // ─────────────────────────────────────────────────────────
  await prisma.dailyDigestConfig.upsert({
    where: { parentId: parent.id },
    update: {},
    create: { parentId: parent.id, frequency: 'DAILY', preferences: { grades: true, attendance: true, assignments: true, events: true } },
  });

  // ─────────────────────────────────────────────────────────
  // 24. Parent: Feedback
  // ─────────────────────────────────────────────────────────
  await prisma.feedbackSubmission.upsert({
    where: { id: 'demo-fb-001' },
    update: {},
    create: { id: 'demo-fb-001', parentId: parent.id, schoolId: SID, category: 'Academics', body: 'The math curriculum is very challenging. Could supplementary materials be provided?', status: 'REVIEWED' },
  });
  await prisma.feedbackSubmission.upsert({
    where: { id: 'demo-fb-002' },
    update: {},
    create: { id: 'demo-fb-002', parentId: parent.id, schoolId: SID, category: 'Facilities', body: 'The cafeteria could use healthier lunch options.', status: 'PENDING' },
  });

  // ─────────────────────────────────────────────────────────
  // 25. Parent: Volunteer Opportunities
  // ─────────────────────────────────────────────────────────
  await prisma.volunteerOpportunity.upsert({
    where: { id: 'demo-vol-001' },
    update: {},
    create: { id: 'demo-vol-001', schoolId: SID, title: 'Library Book Drive', description: 'Help organize and sort donated books for the school library', date: daysFromNow(10), spotsAvailable: 8 },
  });
  await prisma.volunteerOpportunity.upsert({
    where: { id: 'demo-vol-002' },
    update: {},
    create: { id: 'demo-vol-002', schoolId: SID, title: 'Science Fair Setup', description: 'Assist with setting up displays and equipment for the annual science fair', date: daysFromNow(29), spotsAvailable: 12 },
  });
  await prisma.volunteerOpportunity.upsert({
    where: { id: 'demo-vol-003' },
    update: {},
    create: { id: 'demo-vol-003', schoolId: SID, title: 'Campus Beautification Day', description: 'Join us for gardening and painting to beautify the school campus', date: daysFromNow(21), spotsAvailable: 20 },
  });

  // ─────────────────────────────────────────────────────────
  // 26. Cafeteria
  // ─────────────────────────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    const d = daysFromNow(i);
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    await prisma.cafeteriaMenu.upsert({
      where: { schoolId_date: { schoolId: SID, date: dateOnly } },
      update: {},
      create: {
        schoolId: SID, date: dateOnly,
        meals: {
          breakfast: ['Oatmeal', 'Fresh Fruit', 'Orange Juice'][i % 3] ? ['Oatmeal', 'Fresh Fruit', 'Toast'] : ['Pancakes', 'Yogurt', 'Milk'],
          lunch: [
            ['Grilled Chicken Wrap', 'Caesar Salad', 'Apple Juice'],
            ['Pasta Marinara', 'Garden Salad', 'Milk'],
            ['Turkey Sandwich', 'Tomato Soup', 'Water'],
            ['Fish Tacos', 'Coleslaw', 'Lemonade'],
            ['Veggie Burger', 'Sweet Potato Fries', 'Milk'],
          ][i],
          snack: ['Granola Bar', 'Cheese Crackers', 'Trail Mix', 'Fruit Cup', 'Pretzels'][i],
        },
      },
    });
  }

  // Cafeteria accounts for students
  for (const s of [student, student2, student3]) {
    await prisma.cafeteriaAccount.upsert({
      where: { studentId: s.id },
      update: {},
      create: { studentId: s.id, balance: s === student ? 45.50 : s === student2 ? 120.00 : 8.75 },
    });
  }

  // -------------------------------------------------------------------------
  // 26.5 Parent Portal V2 operational data
  // -------------------------------------------------------------------------
  await prisma.approvalRequest.upsert({
    where: { id: 'demo-approval-001' },
    update: {},
    create: {
      id: 'demo-approval-001',
      schoolId: SID,
      parentId: parent.id,
      studentId: student.id,
      title: 'Museum Field Trip Consent',
      type: 'PERMISSION_SLIP',
      description: 'Approve student participation in city museum visit.',
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: daysFromNow(3),
    },
  });
  await prisma.approvalRequest.upsert({
    where: { id: 'demo-approval-002' },
    update: {},
    create: {
      id: 'demo-approval-002',
      schoolId: SID,
      parentId: parent.id,
      studentId: student2.id,
      title: 'Photography Policy Acknowledgement',
      type: 'POLICY_ACKNOWLEDGMENT',
      description: 'Confirm media usage policy for school events.',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: daysFromNow(6),
    },
  });

  await prisma.consentForm.upsert({
    where: { id: 'demo-consent-001' },
    update: {},
    create: {
      id: 'demo-consent-001',
      schoolId: SID,
      parentId: parent.id,
      studentId: student.id,
      approvalRequestId: 'demo-approval-001',
      title: 'Trip Medical Consent',
      description: 'Medical emergency handling consent for field trip.',
      status: 'PENDING',
      dueDate: daysFromNow(3),
    },
  });

  await prisma.parentDocument.upsert({
    where: { id: 'demo-parent-doc-001' },
    update: {},
    create: {
      id: 'demo-parent-doc-001',
      schoolId: SID,
      parentId: parent.id,
      studentId: student.id,
      title: 'Term 1 Report Card',
      category: 'REPORT_CARD',
      status: 'AVAILABLE',
      fileName: 'term-1-report-card.pdf',
      fileUrl: '/uploads/parent/term-1-report-card.pdf',
      uploadedAt: daysAgo(18),
    },
  });
  await prisma.parentDocument.upsert({
    where: { id: 'demo-parent-doc-002' },
    update: {},
    create: {
      id: 'demo-parent-doc-002',
      schoolId: SID,
      parentId: parent.id,
      studentId: student2.id,
      title: 'Receipt INV-2026-082',
      category: 'RECEIPT',
      status: 'AVAILABLE',
      fileName: 'receipt-inv-2026-082.pdf',
      fileUrl: '/uploads/parent/receipt-inv-2026-082.pdf',
      uploadedAt: daysAgo(5),
    },
  });

  await prisma.receipt.upsert({
    where: { id: 'demo-receipt-001' },
    update: {},
    create: {
      id: 'demo-receipt-001',
      invoiceId: 'demo-inv-001',
      paymentId: 'demo-pay-001',
      schoolId: SID,
      parentId: parent.id,
      studentId: student.id,
      amount: 1350,
      currency: 'USD',
      provider: 'stripe',
      providerRef: 'pi_demo_001',
      fileName: 'receipt-demo-inv-001.pdf',
      issuedAt: daysAgo(10),
    },
  });

  await prisma.exam.upsert({
    where: { id: 'demo-exam-001' },
    update: {},
    create: {
      id: 'demo-exam-001',
      schoolId: SID,
      studentId: student.id,
      title: 'Quarterly Algebra Exam',
      subject: 'Mathematics',
      instructions: 'Bring calculator and geometry tools.',
      status: 'UPCOMING',
    },
  });
  await prisma.exam.upsert({
    where: { id: 'demo-exam-002' },
    update: {},
    create: {
      id: 'demo-exam-002',
      schoolId: SID,
      studentId: student2.id,
      title: 'French Vocabulary Quiz',
      subject: 'French',
      instructions: 'Written and oral sections.',
      status: 'UPCOMING',
    },
  });

  await prisma.examScheduleItem.upsert({
    where: { id: 'demo-exam-sch-001' },
    update: {},
    create: {
      id: 'demo-exam-sch-001',
      examId: 'demo-exam-001',
      studentId: student.id,
      date: daysFromNow(7),
      startTime: '09:00',
      endTime: '10:30',
      room: 'Hall B',
      note: 'Arrive 15 minutes early.',
    },
  });
  await prisma.examScheduleItem.upsert({
    where: { id: 'demo-exam-sch-002' },
    update: {},
    create: {
      id: 'demo-exam-sch-002',
      examId: 'demo-exam-002',
      studentId: student2.id,
      date: daysFromNow(6),
      startTime: '08:45',
      endTime: '09:30',
      room: 'C-402',
      note: 'Bring French workbook.',
    },
  });

  await prisma.vehicle.upsert({
    where: { id: 'demo-vehicle-001' },
    update: {},
    create: {
      id: 'demo-vehicle-001',
      schoolId: SID,
      routeId: 'demo-route-001',
      code: 'BUS-12',
      plateNumber: 'AB1234',
      capacity: 40,
      driverName: 'Karim El A.',
      driverPhone: '+1-555-2020',
      isActive: true,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        id: 'demo-parent-notif-001',
        userId: parent.id,
        studentId: student.id,
        type: 'FINANCE',
        title: 'Invoice reminder',
        message: 'Invoice demo-inv-002 is pending.',
        read: false,
      },
      {
        id: 'demo-parent-notif-002',
        userId: parent.id,
        studentId: student2.id,
        type: 'TRANSPORT',
        title: 'Route delay notice',
        message: 'Route B expected 10 minutes late tomorrow.',
        read: false,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.supportTicket.upsert({
    where: { id: 'demo-support-001' },
    update: {},
    create: {
      id: 'demo-support-001',
      schoolId: SID,
      parentId: parent.id,
      studentId: student.id,
      category: 'FINANCE',
      subject: 'Request split payment for March invoice',
      description: 'Can the remaining balance be split over two installments?',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    },
  });
  await prisma.supportTicketReply.upsert({
    where: { id: 'demo-support-reply-001' },
    update: {},
    create: {
      id: 'demo-support-reply-001',
      supportTicketId: 'demo-support-001',
      authorId: admin.id,
      message: 'Finance office approved a two-installment plan.',
    },
  });

  await prisma.parentPreference.upsert({
    where: { parentId: parent.id },
    update: {},
    create: {
      parentId: parent.id,
      locale: 'en',
      theme: 'system',
      contactEmail: 'parent@greenfield.edu',
      contactPhone: '+1-555-1102',
      preferences: { notifyInvoices: true, notifyMessages: true, notifyApprovals: true },
    },
  });

  await prisma.parentWorkspaceItem.upsert({
    where: { parentId_kind_itemId: { parentId: parent.id, kind: 'PIN', itemId: 'pin-fees' } },
    update: {},
    create: {
      parentId: parent.id,
      kind: 'PIN',
      itemId: 'pin-fees',
      label: 'Overdue invoices',
      moduleId: 'fees_payments',
      childId: student.id,
    },
  });
  await prisma.parentWorkspaceItem.upsert({
    where: { parentId_kind_itemId: { parentId: parent.id, kind: 'RECENT', itemId: 'recent-messages' } },
    update: {},
    create: {
      parentId: parent.id,
      kind: 'RECENT',
      itemId: 'recent-messages',
      label: 'History assignment thread',
      moduleId: 'messages',
      childId: student.id,
    },
  });

  await prisma.parentEventRsvp.upsert({
    where: { parentId_eventId: { parentId: parent.id, eventId: 'demo-evt-001' } },
    update: {},
    create: { parentId: parent.id, eventId: 'demo-evt-001', status: 'GOING' },
  });
  // ─────────────────────────────────────────────────────────
  // 27. System Prompts
  // ─────────────────────────────────────────────────────────
  await prisma.systemPrompt.upsert({
    where: { schoolId_toolName: { schoolId: SID, toolName: 'policy-generator' } },
    update: {},
    create: { schoolId: SID, toolName: 'policy-generator', persona: 'school-policy-expert', instructions: 'You are a K-12 school policy expert. Generate clear, enforceable policies.' },
  });

  // ─────────────────────────────────────────────────────────
  // 28. Audit Logs (sample entries)
  // ─────────────────────────────────────────────────────────
  const auditEntries = [
    { userId: admin.id, action: 'CREATE', entity: 'Announcement', entityId: 'demo-announce-001', metadata: { title: 'Welcome to the New School Year!' } },
    { userId: teacher.id, action: 'CREATE', entity: 'Assignment', entityId: 'demo-assignment-001', metadata: { title: 'Algebra Fundamentals Quiz', courseId: 'demo-course-001' } },
    { userId: admin.id, action: 'UPDATE', entity: 'Policy', entityId: 'demo-pol-001', metadata: { field: 'status', from: 'DRAFT', to: 'PUBLISHED' } },
    { userId: finance.id, action: 'CREATE', entity: 'Invoice', entityId: 'demo-inv-001', metadata: { amount: 1350, parentId: parent.id } },
    { userId: provider.id, action: 'UPDATE', entity: 'School', entityId: SID, metadata: { field: 'branding', note: 'Updated logo' } },
  ];
  for (const entry of auditEntries) {
    await prisma.auditLog.create({ data: entry });
  }

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
