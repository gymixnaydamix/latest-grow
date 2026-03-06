Create a module named Concierge for the Student dashboard inside a multi-role School Management SaaS.

This is the Student Concierge only.

It must be a real premium student school-life assistant interface.
It must be end-to-end, manual, operational, real, and multiverse-advanced.

Do not build:

a KPI dashboard

a generic chatbot

a fake AI page

a simple inbox only

a CRM clone

a card gallery with no workflows

Build a real assistant workspace that helps students manage daily school life from one place:

check what is next today

open classes and timetable context

manage assignments and submissions

review grades and teacher feedback

track attendance

read announcements and updates

message teachers or school support

access documents

review exam schedule

manage requests and follow-ups

GLOBAL PRODUCT RULES
Interaction model
Use one mode only:
iOS-style student assistant with bottom-sheet workflow engine

The module must be:

chat-first

action-card powered

preview-first

confirm-before-execute

result-receipt after execution

deeply connected to real student workflows and real records

Execution rules
Every real action must follow this flow:

Intent captured

Draft created

Preview shown

Confirmation requested

Execution performed

Receipt generated

Audit log written if sensitive

Sensitive student actions
Sensitive actions must require:

explicit confirmation

permission check

reason field where needed

audit event if policy requires it

Sensitive actions include:

assignment submission

resubmission

absence explanation request

support request

meeting request

document request

message to staff if policy-controlled

NAVIGATION STRUCTURE
Right Sidebar Main Button
Add:

Concierge

Concierge Top Header Buttons
Use exactly these:

Assistant

Study Tasks

Assignments

Exams & Results

Comms

Settings

Left Subnav per Header
Assistant
Chat

Quick Actions

Today

Search

History

Study Tasks
My Tasks

Due Today

By Subject

Waiting

Completed

Assignments
Due Soon

Drafts

Submitted

Missing

Feedback

Exams & Results
Upcoming Exams

Results

Feedback

Documents

History

Comms
Messages

Announcements

Class Updates

Support

Delivery Log

Settings
Preferences

Snippets

Documents

Notifications

Profile Context

Audit

EXACT FIRST SCREEN LAYOUT
When user clicks Concierge, open Assistant > Chat by default.

Page layout
Use a 3-zone layout:

Zone 1: Top Sticky Context Bar
Component name:
ConciergeStudentContextBar

Must contain:

Current Subject selector

Class/Section selector

Assignment selector

Exam selector

Recent Contexts dropdown

Pin Context button

Clear Context button

Example display:
Working on: Mathematics / Grade 8A / Algebra Assignment 3

Zone 2: Main Assistant Conversation Area
Component name:
ConciergeStudentConversationPanel

Must contain:

assistant message bubbles

student input bubbles

inline action cards

inline result receipts

quick suggestion chips

bottom command composer

Composer component:
ConciergeStudentCommandComposer

Composer supports:

natural language

slash commands

attachment button

send button

voice placeholder

recent commands

Supported commands:

/assignment

/submit

/exam

/grades

/feedback

/message

/support

/document

/attendance

/search

Zone 3: Right Utility Rail
Component name:
ConciergeStudentUtilityRail

Must contain:

My Day Strip

Recent Actions mini-list

Pinned Shortcuts

Draft Queue

Alerts badge

Keep it slim, premium, and useful.
Do not make it a KPI side dashboard.

EXACT COMPONENTS REQUIRED
Create these exact reusable components:

ConciergeStudentContextBar

ConciergeStudentConversationPanel

ConciergeStudentCommandComposer

ConciergeStudentActionCard

ConciergeStudentBottomSheetWizard

ConciergeStudentExecutionReceipt

ConciergeStudentQuickActionGrid

ConciergeStudentTodayStrip

ConciergeStudentSearchResultsPanel

ConciergeStudentTaskCard

ConciergeStudentAssignmentCard

ConciergeStudentExamCard

ConciergeStudentSubmissionDraftCard

ConciergeStudentCommsDraftCard

ConciergeStudentSupportDraftCard

ConciergeStudentFeedbackCard

ConciergeStudentPermissionBadge

ConciergeStudentAuditNotice

ConciergeStudentSplitPreviewPanel

ConciergeStudentTemplatePicker

ASSISTANT > CHAT EXACT CONTENT
Default student concierge screen must show:

A. Welcome block
Short premium welcome:

greeting

current study context

4 suggested real student actions

Example suggestions:

View today’s tasks

Submit assignment

Check exam schedule

Read teacher feedback

Do not make this long.

B. Quick Action Grid
Component:
ConciergeStudentQuickActionGrid

Show 8 premium action tiles:

Open Today’s Tasks

Submit Assignment

Check Exam Schedule

Review Feedback

Message Teacher

Open Attendance

Download Document

Create Support Request

Each tile opens:

direct bottom-sheet wizard
or

draft action card in chat

C. My Day Strip
Component:
ConciergeStudentTodayStrip

Show only real actionable student items:

2 assignments due soon

1 exam this week

3 unread class updates

1 feedback item ready

1 attendance alert

1 support reply waiting

Each chip must be clickable and open the correct workflow.

D. Conversation area starter messages
Show 3 realistic seeded examples:

assignment draft ready for submission

exam schedule opened for review

teacher feedback card ready to read

These must look like real assistant actions.

ASSISTANT > QUICK ACTIONS EXACT CONTENT
Main component:
ConciergeStudentQuickLaunchBoard

Group advanced student actions into sections.

Section 1: Study
Open today’s tasks

Check timetable context

Open subject materials

Review feedback

Section 2: Assignments
Submit assignment

Open draft work

Review missing work

Track submission history

Section 3: Exams
View upcoming exams

Check results

Open report card

Download academic document

Section 4: Communication
Message teacher

Read announcement

Contact support

Use template

ASSISTANT > TODAY EXACT CONTENT
This is not analytics.
It is a student school-life action timeline.

Main component:
ConciergeStudentTodayTimeline

Show:

classes today

assignments due soon

exam reminders

unread teacher feedback

attendance alerts

support messages waiting

announcements needing review

Each row includes:

time

title

subject/class

priority

quick action buttons

ASSISTANT > SEARCH EXACT CONTENT
Main component:
ConciergeStudentSearchResultsPanel

Global student search must return:

assignments

submissions

exams

results

feedback entries

attendance records

class announcements

messages

documents

support requests

subjects

timetable items

Each result must include direct actions:

Open

Submit

Review

Message

Download

Add Note

Request Help

Check Details

This is critical.

ASSISTANT > HISTORY EXACT CONTENT
Main component:
ConciergeStudentActionHistoryTimeline

Show:

assignments submitted

drafts saved

feedback reviewed

messages sent

support requests created

documents downloaded

absence explanations requested if enabled

exam/result views

Each item must have:

timestamp

action type

linked subject/record

user

result status

open receipt button

BOTTOM-SHEET WIZARD EXACT RULES
Every complex flow must use:

Component:
ConciergeStudentBottomSheetWizard

Visual behavior
rounded top corners

premium frosted panel

drag handle

4-step or 5-step flow

sticky footer with next/confirm

review step before execute

success state after execute

Mandatory wizard flows
1. Submit Assignment Wizard
Steps:

Select assignment

Upload/select file or submission content

Add note/comment

Review submission

Confirm submit

2. Review Feedback Wizard
Steps:

Select graded item

Review score and teacher comments

Review attachments or rubric placeholder

Confirm mark as reviewed

Open next action

3. Message Teacher Wizard
Steps:

Select teacher or subject context

Draft message

Preview recipients/context

Review send rules/template

Confirm send

4. Open Exam Plan Wizard
Steps:

Select exam

Review date/time/room/instructions

Review linked subject items

Confirm save/remind action

Open result/history placeholder

5. Create Support Request Wizard
Steps:

Choose request category

Enter details

Link subject/assignment if needed

Review request

Confirm create

6. Download Academic Document Wizard
Steps:

Select document type

Select record scope

Preview metadata

Choose download/share action

Confirm

7. Submit Absence Explanation Request Wizard
Steps:

Select date/class

Choose reason

Add note/attachment

Review request

Confirm submit

8. Save Study Task Wizard
Steps:

Select task/source

Add due date/reminder

Add note/checklist

Review task card

Confirm save

EXACT ACTION CARD TYPES
Inside chat, assistant must generate these exact card types:

AssignmentSubmissionCard

FeedbackReviewCard

MessageDraftCard

ExamPlanCard

SupportRequestDraftCard

DocumentDownloadCard

AttendanceActionCard

StudyTaskDraftCard

RecordOpenActionCard

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

STUDY TASKS HEADER EXACT BUILD
Study Tasks > My Tasks
Show task cards:

title

linked subject/record

due date

priority

checklist progress

blocked badge if waiting

Study Tasks > Due Today
Urgency-sorted list.

Study Tasks > By Subject
Grouped by subject.

Study Tasks > Waiting
Show blocked items:

waiting on teacher feedback

waiting on grading

waiting on support reply

waiting on document availability

Study Tasks > Completed
Archived task list with receipts.

Task actions
Open

Complete

Reschedule

Snooze

Add note

Pin

Link record

ASSIGNMENTS HEADER EXACT BUILD
Use split layout:

left = assignment queue / filters

right = assignment detail / submission panel

Component names:
ConciergeStudentAssignmentsQueue

ConciergeStudentAssignmentDetailPanel

Assignments > Due Soon
Assignments ordered by nearest due date.

Assignments > Drafts
Saved but not submitted work.

Assignments > Submitted
Submission history with status.

Assignments > Missing
Late/missing work items.

Assignments > Feedback
Assignment-linked comments and outcomes.

Must support
assignment detail

instructions

due date

attachments

upload/submit

save draft

resubmit if allowed

submission receipt

teacher feedback visibility

EXAMS & RESULTS HEADER EXACT BUILD
Use split layout:

left = exam/results queue

right = detail / feedback / document panel

Component names:
ConciergeStudentExamQueue

ConciergeStudentExamDetailPanel

Exams & Results > Upcoming Exams
Upcoming schedule with reminders.

Exams & Results > Results
Published results only.

Exams & Results > Feedback
Teacher comments and result context.

Exams & Results > Documents
Report cards, result slips, transcripts if allowed.

Exams & Results > History
Past exams and result timeline.

Required features
exam detail

subject

date/time

venue if available

instructions

result detail

teacher feedback

download result document

receipt after document action

COMMS HEADER EXACT BUILD
Comms > Messages
Student threads with teachers/support/admin where allowed.

Comms > Announcements
School and class announcements.

Comms > Class Updates
Subject/class updates tied to the student context.

Comms > Support
Support request threads and status.

Comms > Delivery Log
Track:

queued

sent

delivered

failed

opened if supported

Required comms features
subject-based context

teacher/support messaging

attachment support where policy allows

preview recipients

schedule send placeholder if allowed

duplicate-send prevention

result receipt after send

SETTINGS HEADER EXACT BUILD
Settings > Preferences
Theme, language, default subject or class context.

Settings > Snippets
Reusable student message snippets:

question for teacher

support help request

document follow-up

meeting request

assignment clarification

Settings > Documents
Preferred document actions and saved downloads.

Settings > Notifications
Assignment reminders, exam reminders, feedback notices, message alerts, attendance alerts.

Settings > Profile Context
Saved contexts and pinned academic items.

Settings > Audit
Visibility of student action history for sensitive submissions.

CUTTING-EDGE FEATURES TO FORCE
Add these features exactly:

1. Universal Action Search
Every search result exposes actions, not just links.

2. Session Context Engine
Student concierge remembers active subject, class, assignment, and exam during session.

3. Result Receipt System
Every completed action produces a premium receipt card.

4. Split Draft/Preview System
For submissions, messages, requests, and downloads.

5. Batch Workflow Support
Support:

review multiple assignments

download multiple documents

mark multiple feedback items as reviewed

save multiple study tasks

6. Student Attention Layer
Surface real student action items:

due soon

missing work

unread feedback

attendance issue

support reply pending

exam approaching

7. Execution Safety Layer
Permission + reason + preview + confirm + audit for sensitive actions.

8. Study Flow Layer
Support chaining of study actions:

open task

open assignment

review submission

read feedback

set reminder

message teacher

9. Deep Linking Everywhere
Every receipt and action card links to assignment, submission, result, message thread, support request, or document.

10. Activity History Timeline
Full action trail for student assistant actions.

11. Smart Next-Step Suggestions
After action completion, suggest the next relevant manual step:

“Now review teacher feedback”

“Now set a reminder”

“Now message your teacher”

“Now open the next assignment”

12. Actionable Utility Rail
The slim utility rail must remain practical and always useful.

DATA MODEL
Create and wire real entities:

StudentConciergeConversation

StudentConciergeMessage

StudentConciergeContextSession

StudentConciergeActionCard

StudyTask

Assignment

AssignmentSubmission

SubmissionDraft

ExamSchedule

ResultRecord

FeedbackEntry

MessageDraft

SentMessage

SupportRequest

AttendanceAlert

DocumentRecord

DownloadAction

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
Generate realistic seeded student data:

15 student assistant conversations

20 study tasks

14 assignment/submission scenarios

10 feedback review flows

8 exam/result workflows

12 message/support threads

10 documents/download actions

8 attendance/alert scenarios

10 execution receipts

15 global search result scenarios

Use realistic student/subject/class names.
No lorem ipsum.

DESIGN STYLE
Make it feel like:

premium 2039 student assistant UI

iOS-inspired workflow engine

futuristic but believable

elegant, focused, motivating, academic, operational

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
Build Concierge (Student) as a real end-to-end school-life assistant with:

exact header buttons

exact left subnav

exact first screen layout

exact reusable components

bottom-sheet wizard system

action cards

execution receipts

real student workflows

real permissions

real audit trail

cutting-edge but believable UX

premium multiverse-advanced visual language

Do not simplify it into a chatbot.
Do not turn it into a KPI dashboard.
Do not fake workflows.
Make it serious, premium, minimal, and operational.