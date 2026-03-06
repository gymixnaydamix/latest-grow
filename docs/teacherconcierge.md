Create a module named Concierge for the Teacher dashboard inside a multi-role School Management SaaS.

This is the Teacher Concierge only.

It must be a real premium teaching assistant interface for teachers.
It must be end-to-end, manual, operational, real, and multiverse-advanced.

Do not build:

a KPI dashboard

a generic chatbot

a fake AI page

an empty teacher help widget

a CRM clone

a card gallery with no workflows

Build a real assistant workspace that helps teachers execute daily teaching work from one place:

attendance

lesson flow

assignments

grading

messaging

class coordination

student follow-up

resource sharing

parent meeting prep

class issue logging

GLOBAL PRODUCT RULES
Interaction model
Use one mode only:
iOS-style teacher assistant with bottom-sheet workflow engine

The module must be:

chat-first

action-card powered

preview-first

confirm-before-execute

result-receipt after execution

deeply connected to real teacher workflows and real records

Execution rules
Every real action must follow this flow:

Intent captured

Draft created

Preview shown

Confirmation requested

Execution performed

Receipt generated

Audit log written if sensitive

Sensitive teacher actions
Sensitive actions must require:

explicit confirmation

reason field where needed

permission check

audit event

Sensitive actions include:

attendance edits after submission

grade publishing

mark changes after publish

parent communication

behavior note escalation

exam mark submission

class-wide bulk messaging

NAVIGATION STRUCTURE
Right Sidebar Main Button
Add:

Concierge

Concierge Top Header Buttons
Use exactly these:

Assistant

Class Tasks

Attendance

Grading

Comms

Settings

Left Subnav per Header
Assistant
Chat

Quick Actions

Today

Search

History

Class Tasks
My Tasks

Due Today

Classes

Waiting

Completed

Attendance
Take Attendance

Submitted

Corrections

Alerts

History

Grading
To Grade

Gradebook

Missing Work

Publish Queue

Feedback

Comms
Messages

Class Announcements

Parent Updates

Templates

Delivery Log

Settings
Permissions

Snippets

Templates

Defaults

Notifications

Audit

EXACT FIRST SCREEN LAYOUT
When user clicks Concierge, open Assistant > Chat by default.

Page layout
Use a 3-zone layout:

Zone 1: Top Sticky Context Bar
Component name:
ConciergeTeacherContextBar

Must contain:

Current Campus selector

Subject selector

Class/Section selector

Student selector

Period / Teaching Slot selector

Pin Context button

Clear Context button

Recent Contexts dropdown

Example display:
Working on: Main Campus / Mathematics / Grade 7B / Period 2

Zone 2: Main Assistant Conversation Area
Component name:
ConciergeTeacherConversationPanel

Must contain:

assistant message bubbles

teacher input bubbles

inline action cards

inline result receipts

quick suggestion chips

bottom command composer

Composer component:
ConciergeTeacherCommandComposer

Composer supports:

natural language

slash commands

attachment button

send button

voice placeholder

recent commands

Supported commands:

/attendance

/assignment

/grade

/message

/announce

/student

/meeting

/resource

/search

/feedback

Zone 3: Right Utility Rail
Component name:
ConciergeTeacherUtilityRail

Must contain:

Today Teaching Strip

Recent Actions mini-list

Pinned Shortcuts

Draft Queue

Alerts badge

Keep it slim, premium, and useful.
Do not make it a KPI side dashboard.

EXACT COMPONENTS REQUIRED
Create these exact reusable components:

ConciergeTeacherContextBar

ConciergeTeacherConversationPanel

ConciergeTeacherCommandComposer

ConciergeTeacherActionCard

ConciergeTeacherBottomSheetWizard

ConciergeTeacherExecutionReceipt

ConciergeTeacherQuickActionGrid

ConciergeTeacherTodayStrip

ConciergeTeacherSearchResultsPanel

ConciergeTeacherTaskCard

ConciergeTeacherAttendanceCard

ConciergeTeacherGradeCard

ConciergeTeacherAssignmentDraftCard

ConciergeTeacherCommsDraftCard

ConciergeTeacherMeetingDraftCard

ConciergeTeacherStudentFlagCard

ConciergeTeacherPermissionBadge

ConciergeTeacherAuditNotice

ConciergeTeacherSplitPreviewPanel

ConciergeTeacherTemplatePicker

ASSISTANT > CHAT EXACT CONTENT
Default teacher concierge screen must show:

A. Welcome block
Short premium welcome:

greeting

current context

4 suggested real teacher actions

Example suggestions:

Take attendance

Create assignment

Grade submissions

Message parents/students

Do not make this long.

B. Quick Action Grid
Component:
ConciergeTeacherQuickActionGrid

Show 8 premium action tiles:

Take Attendance

Create Assignment

Grade Submissions

Message Class

Publish Feedback

Share Resource

Schedule Parent Meeting

Flag Student Issue

Each tile opens:

direct bottom-sheet wizard
or

draft action card in chat

C. Today Teaching Strip
Component:
ConciergeTeacherTodayStrip

Show only real actionable teacher items:

3 classes starting soon

2 attendance sheets not submitted

11 submissions to grade

4 missing assignments

2 parent replies waiting

1 student issue flagged

Each chip must be clickable and open the correct workflow.

D. Conversation area starter messages
Show 3 realistic seeded examples:

attendance draft ready for Grade 6A

assignment created for Science class

parent update drafted for missing homework

These must look like real assistant actions.

ASSISTANT > QUICK ACTIONS EXACT CONTENT
Main component:
ConciergeTeacherQuickLaunchBoard

Group advanced teacher actions into sections.

Section 1: Classroom
Take attendance

Open class roster

View class alerts

Flag student issue

Section 2: Teaching
Create assignment

Share lesson resource

Add class note

Plan meeting

Section 3: Grading
Grade submissions

Enter marks

Publish feedback

Review missing work

Section 4: Communication
Message class

Message parent

Send announcement

Use template

ASSISTANT > TODAY EXACT CONTENT
This is not analytics.
It is a teaching operations timeline.

Main component:
ConciergeTeacherTodayTimeline

Show:

next class

attendance due

grading due

student issues needing action

messages waiting

meetings today

class announcements scheduled

Each row includes:

time

title

class/subject

priority

quick action buttons

ASSISTANT > SEARCH EXACT CONTENT
Main component:
ConciergeTeacherSearchResultsPanel

Global teacher search must return:

students

classes

assignments

submissions

grade entries

attendance records

messages

announcements

resources

meetings

parent threads

Each result must include direct actions:

Open

Take Attendance

Grade

Message

Add Feedback

Share Resource

Schedule Meeting

Add Note

This is critical.

ASSISTANT > HISTORY EXACT CONTENT
Main component:
ConciergeTeacherActionHistoryTimeline

Show:

attendance submitted

assignments created

grades entered

feedback published

messages sent

resources shared

meetings scheduled

flags raised

Each item must have:

timestamp

action type

linked class/student

user

result status

open receipt button

BOTTOM-SHEET WIZARD EXACT RULES
Every complex flow must use:

Component:
ConciergeTeacherBottomSheetWizard

Visual behavior
rounded top corners

premium frosted panel

drag handle

4-step or 5-step flow

sticky footer with next/confirm

review step before execute

success state after execute

Mandatory wizard flows
1. Take Attendance Wizard
Steps:

Select class/period/date

Review roster

Mark attendance

Review summary

Confirm submit

2. Create Assignment Wizard
Steps:

Select class/subject

Enter instructions and due date

Attach files/resources

Preview assignment

Confirm publish

3. Grade Submission Wizard
Steps:

Select class/assignment

Review submission

Enter marks and comments

Preview result

Confirm save/publish

4. Send Parent/Class Message Wizard
Steps:

Select audience

Draft message

Preview recipients

Review timing/template

Confirm send

5. Share Resource Wizard
Steps:

Select class

Select/upload resource

Add note/instructions

Preview student view

Confirm share

6. Schedule Parent Meeting Wizard
Steps:

Select student/parent

Choose purpose

Propose time

Review invitation

Confirm schedule

7. Flag Student Issue Wizard
Steps:

Select student

Choose issue type

Add note/evidence

Choose escalation path

Confirm create

8. Publish Feedback Wizard
Steps:

Select graded item

Review feedback text

Review visibility

Preview student/parent view

Confirm publish

EXACT ACTION CARD TYPES
Inside chat, assistant must generate these exact card types:

AttendanceDraftCard

AssignmentDraftCard

GradeDraftCard

FeedbackPublishCard

MessageDraftCard

MeetingProposalCard

StudentIssueFlagCard

ResourceShareCard

RecordUpdateDraftCard

Every card must contain:

title

status chip

linked entities

editable fields

preview button

confirm button

cancel button

permission chip

audit warning if sensitive

CLASS TASKS HEADER EXACT BUILD
Class Tasks > My Tasks
Show task cards:

title

linked class/student

due date

priority

checklist progress

blocked badge if waiting

Class Tasks > Due Today
Urgency-sorted list.

Class Tasks > Classes
Grouped by class and subject.

Class Tasks > Waiting
Show blocked items:

waiting on student submission

waiting on parent reply

waiting on admin approval

waiting on marks confirmation

Class Tasks > Completed
Archived task list with receipts.

Task actions
Open

Complete

Reschedule

Snooze

Escalate

Reassign

Add checklist

Link record

ATTENDANCE HEADER EXACT BUILD
Use split layout:

left = attendance queue / class list

right = attendance detail / roster panel

Component names:
ConciergeTeacherAttendanceQueue

ConciergeTeacherAttendanceDetailPanel

Attendance > Take Attendance
Fast class roster attendance interface.

Attendance > Submitted
List of submitted attendance records.

Attendance > Corrections
Pending correction requests and edit history.

Attendance > Alerts
Show:

attendance not submitted

unusual absence patterns

late students repeated

missing attendance entries

Attendance > History
Timeline and filters by class/date/student.

Must support
Present / Absent / Late / Excused

bulk mark all present

quick keyboard shortcuts

mobile-friendly tap/swipe

reason/note fields

submission confirmation receipt

GRADING HEADER EXACT BUILD
Use split layout:

left = grading queue

right = grading panel / submission viewer

Component names:
ConciergeTeacherGradingQueue

ConciergeTeacherGradingDetailPanel

Grading > To Grade
Ungraded submissions queue.

Grading > Gradebook
Subject/class gradebook table.

Grading > Missing Work
Students with missing or late submissions.

Grading > Publish Queue
Draft grades/feedback waiting for publication.

Grading > Feedback
Published and draft feedback records.

Required grading features
mark entry

comment entry

rubric placeholder

save draft

publish later

bulk grading support

missing marks warnings

grade change compare history

publish confirmation

COMMS HEADER EXACT BUILD
Comms > Messages
One-to-one and group threads.

Comms > Class Announcements
Teacher-to-class announcements.

Comms > Parent Updates
Parent-facing updates tied to class/student context.

Comms > Templates
Reusable class communication templates.

Comms > Delivery Log
Track:

queued

sent

delivered

failed

opened if supported

Required comms features
class-based targeting

student-specific targeting

parent-linked messaging

attachment support

preview audience

schedule send

quiet-hours rule

duplicate-send prevention

result receipt after send

SETTINGS HEADER EXACT BUILD
Settings > Permissions
Teacher can configure visibility rules within allowed policy:

who sees feedback

who receives class updates

communication scope

publish confirmation rules

Settings > Snippets
Reusable templates:

homework reminder

missing work notice

parent meeting invite

class update

feedback phrases

Settings > Templates
Assignment, resource, and message defaults.

Settings > Defaults
Default class, subject, due-time, feedback preferences.

Settings > Notifications
Due alerts, reply alerts, class reminders.

Settings > Audit
Visibility of teacher action history for sensitive actions.

CUTTING-EDGE FEATURES TO FORCE
Add these features exactly:

1. Universal Action Search
Every search result exposes actions, not just links.

2. Session Context Engine
Teacher concierge remembers active class, student, subject, and slot during session.

3. Result Receipt System
Every completed action produces a premium receipt card.

4. Split Draft/Preview System
For assignments, feedback, messages, and updates.

5. Batch Workflow Support
Support:

mark attendance for many students fast

grade multiple submissions

send follow-up to multiple parents

publish multiple feedback items

6. Student Attention Layer
Detect and surface manual attention items:

repeated absence

repeated late work

missing submissions

no parent reply

meeting recommended

7. Execution Safety Layer
Permission + reason + preview + confirm + audit for sensitive actions.

8. Resource Share Layer
Teacher can quickly share lesson files/links/notes to class context.

9. Deep Linking Everywhere
Every receipt and action card links to assignment, attendance, gradebook, student profile, or thread.

10. Activity History Timeline
Full action trail for teacher assistant actions.

11. Smart Next-Step Suggestions
After action completion, suggest the next relevant manual action:

“Now notify parents”

“Now publish feedback”

“Now schedule support meeting”

12. Actionable Utility Rail
The slim utility rail must remain practical and always useful.

DATA MODEL
Create and wire real entities:

TeacherConciergeConversation

TeacherConciergeMessage

TeacherConciergeContextSession

TeacherConciergeActionCard

TeacherTask

AttendanceRecord

AttendanceCorrectionRequest

Assignment

AssignmentSubmission

GradeEntry

FeedbackEntry

MessageDraft

SentMessage

AnnouncementDraft

MeetingDraft

CalendarEvent

StudentIssueFlag

ResourceShare

ExecutionReceipt

AuditLogEvent

Each entity must support:

list view

detail view

state/status

timestamps

linked records

permissions

history

search

DEMO DATA
Generate realistic seeded teacher data:

15 teacher assistant conversations

20 class tasks

12 attendance scenarios

18 submissions to grade

10 published feedback actions

8 parent meeting flows

12 message threads

10 shared resources

8 student issue flags

10 execution receipts

15 global search result scenarios

Use realistic teacher/student/class names.
No lorem ipsum.

DESIGN STYLE
Make it feel like:

premium 2039 teaching assistant UI

iOS-inspired workflow engine

futuristic but believable

elegant, calm, fast, academic, operational

Light mode
Use:

soft silver

blue metallic

ivory slate

academic amber accents

Dark mode
Use:

graphite

deep slate

muted indigo

steel blue

low glow accents

Avoid:

pure white

pure black

childish AI visuals

flat CRM look

useless chart clutter

FINAL BUILD COMMAND
Build Concierge (Teacher) as a real end-to-end teaching assistant with:

exact header buttons

exact left subnav

exact first screen layout

exact reusable components

bottom-sheet wizard system

action cards

execution receipts

real teacher workflows

real permissions

real audit trail

cutting-edge but believable UX

premium multiverse-advanced visual language

Do not simplify it into a chatbot.
Do not turn it into a KPI dashboard.
Do not fake workflows.
Make it serious, premium, minimal, and operational.