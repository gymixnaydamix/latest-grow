DO $$
BEGIN
  CREATE TYPE "AttendanceExplanationStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'SUBMITTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Attendance"
  ADD COLUMN "explanationStatus" "AttendanceExplanationStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
  ADD COLUMN "explanationNote" TEXT,
  ADD COLUMN "explainedAt" TIMESTAMP(3),
  ADD COLUMN "explainedByParentId" TEXT;

UPDATE "Attendance"
SET "explanationStatus" = CASE
  WHEN "status" = 'ABSENT' THEN 'PENDING'::"AttendanceExplanationStatus"
  ELSE 'NOT_REQUIRED'::"AttendanceExplanationStatus"
END;

ALTER TABLE "Attendance"
  ADD CONSTRAINT "Attendance_explainedByParentId_fkey"
  FOREIGN KEY ("explainedByParentId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Attendance_explainedByParentId_idx" ON "Attendance"("explainedByParentId");
CREATE INDEX "Attendance_explanationStatus_idx" ON "Attendance"("explanationStatus");

ALTER TABLE "SupportTicket"
  ADD CONSTRAINT "SupportTicket_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupportTicketReply"
  ADD CONSTRAINT "SupportTicketReply_supportTicketId_fkey"
  FOREIGN KEY ("supportTicketId") REFERENCES "SupportTicket"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SupportTicketReply"
  ADD CONSTRAINT "SupportTicketReply_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
