-- AlterTable (idempotent â€” column may already exist from a prior migration)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Course' AND column_name = 'departmentId'
  ) THEN
    ALTER TABLE "Course" ADD COLUMN "departmentId" TEXT;
  END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Department" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "headId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CurriculumStandard" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL DEFAULT '',
    "gradeLevel" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumStandard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CourseCurriculumLink" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "standardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseCurriculumLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ExpenseRecord" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "vendor" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "incurredAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "facilityId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TransportRoute" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "driverName" TEXT NOT NULL DEFAULT '',
    "vehicleNumber" TEXT NOT NULL DEFAULT '',
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TransportStop" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "sequence" INTEGER NOT NULL,
    "scheduledTime" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TransportAssignment" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stopId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TransportTrackingEvent" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "recordedBy" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransportTrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LibraryItem" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT '',
    "isbn" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "shelfLocation" TEXT NOT NULL DEFAULT '',
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "availableCopies" INTEGER NOT NULL DEFAULT 1,
    "publishedYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "LibraryLoan" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "checkedOutAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "returnedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OUT',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryLoan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Course_departmentId_idx" ON "Course"("departmentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Department_schoolId_idx" ON "Department"("schoolId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Department_headId_idx" ON "Department"("headId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Department_schoolId_name_key" ON "Department"("schoolId", "name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CurriculumStandard_schoolId_idx" ON "CurriculumStandard"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CurriculumStandard_schoolId_code_key" ON "CurriculumStandard"("schoolId", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CourseCurriculumLink_courseId_idx" ON "CourseCurriculumLink"("courseId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CourseCurriculumLink_standardId_idx" ON "CourseCurriculumLink"("standardId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CourseCurriculumLink_courseId_standardId_key" ON "CourseCurriculumLink"("courseId", "standardId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExpenseRecord_schoolId_idx" ON "ExpenseRecord"("schoolId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExpenseRecord_status_idx" ON "ExpenseRecord"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExpenseRecord_incurredAt_idx" ON "ExpenseRecord"("incurredAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExpenseRecord_createdBy_idx" ON "ExpenseRecord"("createdBy");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MaintenanceRequest_schoolId_idx" ON "MaintenanceRequest"("schoolId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MaintenanceRequest_facilityId_idx" ON "MaintenanceRequest"("facilityId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MaintenanceRequest_status_idx" ON "MaintenanceRequest"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MaintenanceRequest_priority_idx" ON "MaintenanceRequest"("priority");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MaintenanceRequest_assignedTo_idx" ON "MaintenanceRequest"("assignedTo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransportRoute_schoolId_idx" ON "TransportRoute"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TransportRoute_schoolId_name_key" ON "TransportRoute"("schoolId", "name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransportStop_routeId_idx" ON "TransportStop"("routeId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TransportStop_routeId_sequence_key" ON "TransportStop"("routeId", "sequence");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransportAssignment_schoolId_idx" ON "TransportAssignment"("schoolId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransportAssignment_routeId_idx" ON "TransportAssignment"("routeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransportAssignment_userId_idx" ON "TransportAssignment"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransportAssignment_stopId_idx" ON "TransportAssignment"("stopId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransportAssignment_status_idx" ON "TransportAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TransportAssignment_routeId_userId_key" ON "TransportAssignment"("routeId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransportTrackingEvent_assignmentId_idx" ON "TransportTrackingEvent"("assignmentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransportTrackingEvent_recordedAt_idx" ON "TransportTrackingEvent"("recordedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TransportTrackingEvent_recordedBy_idx" ON "TransportTrackingEvent"("recordedBy");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LibraryItem_schoolId_idx" ON "LibraryItem"("schoolId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LibraryItem_title_idx" ON "LibraryItem"("title");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LibraryLoan_schoolId_idx" ON "LibraryLoan"("schoolId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LibraryLoan_itemId_idx" ON "LibraryLoan"("itemId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LibraryLoan_borrowerId_idx" ON "LibraryLoan"("borrowerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LibraryLoan_status_idx" ON "LibraryLoan"("status");

-- AddForeignKey (all idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Course_departmentId_fkey') THEN
    ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Department_schoolId_fkey') THEN
    ALTER TABLE "Department" ADD CONSTRAINT "Department_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Department_headId_fkey') THEN
    ALTER TABLE "Department" ADD CONSTRAINT "Department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CurriculumStandard_schoolId_fkey') THEN
    ALTER TABLE "CurriculumStandard" ADD CONSTRAINT "CurriculumStandard_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CourseCurriculumLink_courseId_fkey') THEN
    ALTER TABLE "CourseCurriculumLink" ADD CONSTRAINT "CourseCurriculumLink_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CourseCurriculumLink_standardId_fkey') THEN
    ALTER TABLE "CourseCurriculumLink" ADD CONSTRAINT "CourseCurriculumLink_standardId_fkey" FOREIGN KEY ("standardId") REFERENCES "CurriculumStandard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ExpenseRecord_schoolId_fkey') THEN
    ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ExpenseRecord_createdBy_fkey') THEN
    ALTER TABLE "ExpenseRecord" ADD CONSTRAINT "ExpenseRecord_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MaintenanceRequest_schoolId_fkey') THEN
    ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MaintenanceRequest_facilityId_fkey') THEN
    ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MaintenanceRequest_assignedTo_fkey') THEN
    ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MaintenanceRequest_requestedBy_fkey') THEN
    ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TransportRoute_schoolId_fkey') THEN
    ALTER TABLE "TransportRoute" ADD CONSTRAINT "TransportRoute_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TransportStop_routeId_fkey') THEN
    ALTER TABLE "TransportStop" ADD CONSTRAINT "TransportStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TransportRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TransportAssignment_schoolId_fkey') THEN
    ALTER TABLE "TransportAssignment" ADD CONSTRAINT "TransportAssignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TransportAssignment_routeId_fkey') THEN
    ALTER TABLE "TransportAssignment" ADD CONSTRAINT "TransportAssignment_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "TransportRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TransportAssignment_userId_fkey') THEN
    ALTER TABLE "TransportAssignment" ADD CONSTRAINT "TransportAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TransportAssignment_stopId_fkey') THEN
    ALTER TABLE "TransportAssignment" ADD CONSTRAINT "TransportAssignment_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "TransportStop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TransportTrackingEvent_assignmentId_fkey') THEN
    ALTER TABLE "TransportTrackingEvent" ADD CONSTRAINT "TransportTrackingEvent_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "TransportAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TransportTrackingEvent_recordedBy_fkey') THEN
    ALTER TABLE "TransportTrackingEvent" ADD CONSTRAINT "TransportTrackingEvent_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LibraryItem_schoolId_fkey') THEN
    ALTER TABLE "LibraryItem" ADD CONSTRAINT "LibraryItem_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LibraryLoan_schoolId_fkey') THEN
    ALTER TABLE "LibraryLoan" ADD CONSTRAINT "LibraryLoan_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LibraryLoan_itemId_fkey') THEN
    ALTER TABLE "LibraryLoan" ADD CONSTRAINT "LibraryLoan_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LibraryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LibraryLoan_borrowerId_fkey') THEN
    ALTER TABLE "LibraryLoan" ADD CONSTRAINT "LibraryLoan_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
