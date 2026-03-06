Create a module named Concierge for the Parent dashboard inside a multi-role School Management SaaS.

This is the Parent Concierge only.

It must be a real premium family-school assistant interface for parents/guardians.
It must be end-to-end, manual, operational, real, and multiverse-advanced.

Do not build:

a KPI dashboard

a generic chatbot

a fake AI page

a simple inbox only

a CRM clone

a card gallery with no workflows

Build a real assistant workspace that helps parents handle daily school responsibilities from one place:

check what needs attention

review children status

pay or review fees

approve forms

message school

track attendance

review grades and report cards

follow assignments and exams

schedule meetings

manage school documents

GLOBAL PRODUCT RULES
Interaction model
Use one mode only:
iOS-style parent assistant with bottom-sheet workflow engine

The module must be:

chat-first

action-card powered

preview-first

confirm-before-execute

result-receipt after execution

deeply connected to real parent workflows and real records

Execution rules
Every real action must follow this flow:

Intent captured

Draft created

Preview shown

Confirmation requested

Execution performed

Receipt generated

Audit log written if sensitive

Sensitive parent actions
Sensitive actions must require:

explicit confirmation

reason field where needed

permission check

audit event

Sensitive actions include:

fee payment confirmation

form/consent approval

document submission

absence explanation submission

meeting confirmation

transport change request

child-related support escalation

NAVIGATION STRUCTURE
Right Sidebar Main Button
Add:

Concierge

Concierge Top Header Buttons
Use exactly these:

Assistant

Family Tasks

Payments

Forms & Approvals

Comms

Settings

Left Subnav per Header
Assistant
Chat

Quick Actions

Today

Search

History

Family Tasks
My Tasks

Due Today

By Child

Waiting

Completed

Payments
Due Now

Invoices

Receipts

Installments

History

Forms & Approvals
Pending

Consent Forms

School Requests

Submitted

History

Comms
Messages

Announcements

Parent Updates

Templates

Delivery Log

Settings
Preferences

Snippets

Documents

Notifications

Linked Children

Audit

EXACT FIRST SCREEN LAYOUT
When user clicks Concierge, open Assistant > Chat by default.

Page layout
Use a 3-zone layout:

Zone 1: Top Sticky Context Bar
Component name:
ConciergeParentContextBar

Must contain:

Current Child selector

Family View toggle

Campus selector

Class selector

Recent Contexts dropdown

Pin Context button

Clear Context button

Example display:
Working on: Family View / Child: Sara Ali / Grade 5A / Main Campus

Zone 2: Main Assistant Conversation Area
Component name:
ConciergeParentConversationPanel

Must contain:

assistant message bubbles

parent input bubbles

inline action cards

inline result receipts

quick suggestion chips

bottom command composer

Composer component:
ConciergeParentCommandComposer

Composer supports:

natural language

slash commands

attachment button

send button

voice placeholder

recent commands

Supported commands:

/pay

/invoice

/form

/message

/meeting

/document

/attendance

/grades

/assignment

/search

Zone 3: Right Utility Rail
Component name:
ConciergeParentUtilityRail

Must contain:

Family Today Strip

Recent Actions mini-list

Pinned Shortcuts

Draft Queue

Alerts badge

Keep it slim, premium, and useful.
Do not make it a KPI side dashboard.

EXACT COMPONENTS REQUIRED
Create these exact reusable components:

ConciergeParentContextBar

ConciergeParentConversationPanel

ConciergeParentCommandComposer

ConciergeParentActionCard

ConciergeParentBottomSheetWizard

ConciergeParentExecutionReceipt

ConciergeParentQuickActionGrid

ConciergeParentTodayStrip

ConciergeParentSearchResultsPanel

ConciergeParentTaskCard

ConciergeParentPaymentCard

ConciergeParentFormCard

ConciergeParentDocumentDraftCard

ConciergeParentCommsDraftCard

ConciergeParentMeetingDraftCard

ConciergeParentChildAlertCard

ConciergeParentPermissionBadge

ConciergeParentAuditNotice

ConciergeParentSplitPreviewPanel

ConciergeParentTemplatePicker

ASSISTANT > CHAT EXACT CONTENT
Default parent concierge screen must show:

A. Welcome block
Short premium welcome:

greeting

current child/family context

4 suggested real parent actions

Example suggestions:

Pay invoice

Approve form

Message school

Check assignments

Do not make this long.

B. Quick Action Grid
Component:
ConciergeParentQuickActionGrid

Show 8 premium action tiles:

Pay School Fees

Approve Form

Message Teacher

Review Attendance

Check Grades

Download Document

Schedule Meeting

Submit Request

Each tile opens:

direct bottom-sheet wizard
or

draft action card in chat

C. Family Today Strip
Component:
ConciergeParentTodayStrip

Show only real actionable family items:

2 invoices due

1 consent form waiting

3 unread school announcements

1 meeting request pending

2 assignments due soon

1 attendance alert

Each chip must be clickable and open the correct workflow.

D. Conversation area starter messages
Show 3 realistic seeded examples:

invoice reminder prepared for review

consent form pending approval

parent-teacher meeting proposal ready

These must look like real assistant actions.

ASSISTANT > QUICK ACTIONS EXACT CONTENT
Main component:
ConciergeParentQuickLaunchBoard

Group advanced parent actions into sections.

Section 1: Family
Switch child context

Review child updates

View attendance alerts

Check assignments due

Section 2: Payments
Pay invoice

Review receipt

Check installment plan

Download fee statement

Section 3: Approvals
Approve consent form

Submit requested document

Confirm meeting

Reply to school request

Section 4: Communication
Message teacher

Message admin

Read announcement

Use message template

ASSISTANT > TODAY EXACT CONTENT
This is not analytics.
It is a family school action timeline.

Main component:
ConciergeParentTodayTimeline

Show:

payments due today

forms awaiting approval

meetings today

assignments due soon

attendance alerts

school messages needing reply

new report card/document availability

Each row includes:

time

title

child context

priority

quick action buttons

ASSISTANT > SEARCH EXACT CONTENT
Main component:
ConciergeParentSearchResultsPanel

Global parent search must return:

linked children

invoices

receipts

forms

messages

announcements

assignments

grades

attendance records

documents

meetings

support requests

Each result must include direct actions:

Open

Pay

Download

Approve

Message

Schedule Meeting

Add Note

Submit Reply

This is critical.

ASSISTANT > HISTORY EXACT CONTENT
Main component:
ConciergeParentActionHistoryTimeline

Show:

payments completed

forms approved

documents downloaded

messages sent

meetings scheduled

absence explanations submitted

support requests created

Each item must have:

timestamp

action type

linked child/record

user

result status

open receipt button

BOTTOM-SHEET WIZARD EXACT RULES
Every complex flow must use:

Component:
ConciergeParentBottomSheetWizard

Visual behavior
rounded top corners

premium frosted panel

drag handle

4-step or 5-step flow

sticky footer with next/confirm

review step before execute

success state after execute

Mandatory wizard flows
1. Pay Invoice Wizard
Steps:

Select invoice

Review amount and breakdown

Choose payment method placeholder

Review receipt details

Confirm payment

2. Approve Form Wizard
Steps:

Select form/request

Review details and attachments

Confirm guardian information

Review submission

Confirm approve/submit

3. Send Message Wizard
Steps:

Select audience

Draft message

Preview recipients

Review timing/template

Confirm send

4. Schedule Meeting Wizard
Steps:

Select child and purpose

Select school contact

Propose or choose time

Review invitation

Confirm schedule

5. Submit Document Wizard
Steps:

Select request type

Upload or choose file

Add note

Review linked child/request

Confirm submit

6. Submit Absence Explanation Wizard
Steps:

Select child/date

Choose reason

Add note/attachment

Review explanation

Confirm submit

7. Download School Document Wizard
Steps:

Select document type

Select child

Preview metadata

Choose download/share option

Confirm action

8. Create Support Request Wizard
Steps:

Choose request category

Enter details

Select child context if needed

Review request

Confirm create

EXACT ACTION CARD TYPES
Inside chat, assistant must generate these exact card types:

PaymentDraftCard

FormApprovalCard

MessageDraftCard

MeetingProposalCard

DocumentSubmissionCard

AbsenceExplanationCard

SupportRequestDraftCard

DocumentDownloadCard

ChildRecordActionCard

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

FAMILY TASKS HEADER EXACT BUILD
Family Tasks > My Tasks
Show task cards:

title

linked child/record

due date

priority

checklist progress

blocked badge if waiting

Family Tasks > Due Today
Urgency-sorted list.

Family Tasks > By Child
Grouped by child.

Family Tasks > Waiting
Show blocked items:

waiting on school reply

waiting on document review

waiting on payment confirmation

waiting on meeting approval

Family Tasks > Completed
Archived task list with receipts.

Task actions
Open

Complete

Reschedule

Snooze

Escalate

Add note

Link record

PAYMENTS HEADER EXACT BUILD
Use split layout:

left = payment queue / invoice list

right = invoice detail / receipt panel

Component names:
ConciergeParentPaymentQueue

ConciergeParentPaymentDetailPanel

Payments > Due Now
Immediate invoices and urgent payment items.

Payments > Invoices
Full invoice list with filters.

Payments > Receipts
Receipt archive and download center.

Payments > Installments
Installment plan details and next due actions.

Payments > History
Timeline of payments and changes.

Must support
invoice detail

amount breakdown

due date

status

partial payment placeholder

receipt download

fee statement download

payment confirmation receipt

FORMS & APPROVALS HEADER EXACT BUILD
Use split layout:

left = forms queue

right = form detail / submission panel

Component names:
ConciergeParentFormsQueue

ConciergeParentFormDetailPanel

Forms & Approvals > Pending
Open items requiring action.

Forms & Approvals > Consent Forms
Trips, events, permissions, acknowledgments.

Forms & Approvals > School Requests
Documents, confirmations, profile updates.

Forms & Approvals > Submitted
Completed submissions.

Forms & Approvals > History
Past approvals and responses.

Required features
form detail

linked child

attachments

due date

confirmation checkbox

guardian confirmation

submission receipt

audit log for sensitive approvals

COMMS HEADER EXACT BUILD
Comms > Messages
Parent threads with teachers/admin/support.

Comms > Announcements
School-wide and child-specific announcements.

Comms > Parent Updates
Personalized updates tied to child context.

Comms > Templates
Reusable message templates/snippets.

Comms > Delivery Log
Track:

queued

sent

delivered

failed

opened if supported

Required comms features
child-based targeting context

teacher/admin messaging

attachment support

preview recipients

schedule send placeholder

quiet-hours rule

duplicate-send prevention

result receipt after send

SETTINGS HEADER EXACT BUILD
Settings > Preferences
Theme, language, default family/child view.

Settings > Snippets
Reusable parent message snippets:

meeting request

fee inquiry

document follow-up

absence explanation

teacher update request

Settings > Documents
Preferred document actions and saved downloads.

Settings > Notifications
Payment reminders, school messages, attendance alerts, report card notices.

Settings > Linked Children
Manage context and linked student visibility.

Settings > Audit
Visibility of parent action history for sensitive submissions.

CUTTING-EDGE FEATURES TO FORCE
Add these features exactly:

1. Universal Action Search
Every search result exposes actions, not just links.

2. Session Context Engine
Parent concierge remembers active child, family view, class, and campus during session.

3. Result Receipt System
Every completed action produces a premium receipt card.

4. Split Draft/Preview System
For payments, forms, messages, and submissions.

5. Batch Workflow Support
Support:

pay/review multiple invoices

download multiple documents

manage multiple children actions

review multiple pending forms

6. Family Attention Layer
Surface actionable family items:

unpaid fees

upcoming exams

repeated absence

missing assignments

pending forms

unread urgent messages

7. Execution Safety Layer
Permission + reason + preview + confirm + audit for sensitive actions.

8. Multi-Child Context Layer
Fast switch between children and family-wide mode.

9. Deep Linking Everywhere
Every receipt and action card links to invoice, form, child profile, message thread, or meeting.

10. Activity History Timeline
Full action trail for parent assistant actions.

11. Smart Next-Step Suggestions
After action completion, suggest the next relevant manual step:

“Now download receipt”

“Now message school”

“Now review assignments”

“Now confirm meeting”

12. Actionable Utility Rail
The slim utility rail must remain practical and always useful.

DATA MODEL
Create and wire real entities:

ParentConciergeConversation

ParentConciergeMessage

ParentConciergeContextSession

ParentConciergeActionCard

FamilyTask

Invoice

Receipt

FormRequest

ConsentApproval

MessageDraft

SentMessage

MeetingDraft

CalendarEvent

DocumentRequest

DocumentSubmission

AttendanceAlert

AssignmentAlert

SupportRequest

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
Generate realistic seeded parent data:

15 parent assistant conversations

20 family tasks

12 invoice/payment scenarios

10 form approvals

14 school messages

8 meeting workflows

10 document requests/downloads

8 attendance/assignment alerts

10 execution receipts

15 global search result scenarios

Use realistic parent/child/class names.
No lorem ipsum.

DESIGN STYLE
Make it feel like:

premium 2039 family-school assistant UI

iOS-inspired workflow engine

futuristic but believable

elegant, calm, warm, trustworthy, operational

Light mode
Use:

soft silver

blue metallic

ivory slate

warm amber accents

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
Build Concierge (Parent) as a real end-to-end family-school assistant with:

exact header buttons

exact left subnav

exact first screen layout

exact reusable components

bottom-sheet wizard system

action cards

execution receipts

real parent workflows

real permissions

real audit trail

cutting-edge but believable UX

premium multiverse-advanced visual language

Do not simplify it into a chatbot.
Do not turn it into a KPI dashboard.
Do not fake workflows.
Make it serious, premium, minimal, and operational.