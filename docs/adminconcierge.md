Create a module named Concierge for the School Admin dashboard inside a multi-role School Management SaaS.

This is the Admin Concierge only.

It must be a real premium executive assistant interface for school admins.
It must be end-to-end, manual, operational, real, and multiverse-advanced.

Do not build:

a KPI dashboard

a generic chatbot

a fake AI page

a CRM clone

a support ticket page only

a card gallery with no workflows

Build a real assistant workspace that can launch, draft, review, confirm, and execute real school workflows.

GLOBAL PRODUCT RULES
Interaction model
Use one mode only:
iOS-style assistant with bottom-sheet workflow engine

The module must be:

chat-first

action-card powered

preview-first

confirm-before-execute

result-receipt after execution

deeply connected to real entities and workflows

Execution rules
Every actionable operation must follow this pattern:

Intent captured

Draft created

Preview shown

Confirmation requested

Execution performed

Receipt generated

Audit log written

Sensitive action rules
Sensitive actions must require:

explicit confirmation

reason field

permission check

audit event

Sensitive actions include:

approval decisions

discount approval

refund approval

attendance correction approval

bulk communication send

student record change

admission decision

fee follow-up batch action

NAVIGATION STRUCTURE
Right Sidebar Main Button
Add:

Concierge

Concierge Top Header Buttons
Use exactly these:

Assistant

Tasks

Approvals

Documents

Comms

Settings

Left Subnav per Header
Assistant
Chat

Quick Actions

Today

Search

History

Tasks
My Tasks

Due Today

Scheduled

Waiting

Completed

Approvals
Admissions

Discounts

Refunds

Attendance Corrections

Leave Requests

Record Changes

Documents
Generate

Templates

Requests

Sent / Published

Comms
Announcements

Messages

Broadcasts

Templates

Delivery Log

Settings
Permissions

Snippets

Templates

Routing Rules

Notifications

Audit

EXACT FIRST SCREEN LAYOUT
When user clicks Concierge, open Assistant > Chat by default.

Page layout
Use a 3-zone layout:

Zone 1: Top Sticky Context Bar
Height: compact
Always visible

Component name:
ConciergeContextBar

Must contain:
Current Campus selector

Academic Year selector

Grade/Class selector

Student selector

Staff selector

Pin Context button

Clear Context button

Recent Contexts dropdown

Example display:
Working on: Main Campus / 2025–2026 / Grade 5A / Student: Sara Ali

Zone 2: Main Assistant Conversation Area
This is the center and largest area.

Component name:
ConciergeConversationPanel

Must contain:
assistant message bubbles

admin input bubbles

action cards inline

execution receipts inline

quick chips under latest assistant response

bottom composer input

Composer component:
ConciergeCommandComposer

Composer supports:
natural language input

slash commands

attachment button

send button

voice placeholder button

recent commands dropdown

Supported commands:

/announce

/doc

/approve

/meeting

/request

/task

/search

/student

/invoice

Zone 3: Right Utility Rail
Slim contextual utility column.

Component name:
ConciergeUtilityRail

Must contain:
School Today strip

Recent Actions mini-list

Pinned Shortcuts

Active Drafts

Notifications badge

Do not make this a large dashboard column. Keep it slim and elegant.

EXACT COMPONENTS REQUIRED
Create these exact reusable components:

ConciergeContextBar

ConciergeConversationPanel

ConciergeCommandComposer

ConciergeActionCard

ConciergeBottomSheetWizard

ConciergeExecutionReceipt

ConciergeQuickActionGrid

ConciergeTodayStrip

ConciergeSearchResultsPanel

ConciergeTaskCard

ConciergeApprovalCard

ConciergeDocumentDraftCard

ConciergeCommsDraftCard

ConciergeMeetingDraftCard

ConciergeExceptionCard

ConciergePermissionBadge

ConciergeAuditNotice

ConciergeSplitPreviewPanel

ConciergeTemplatePicker

ConciergeRecipientPreview

ASSISTANT > CHAT EXACT CONTENT
The default assistant screen must show:

A. Welcome block
A premium short welcome:

greeting

current context summary

4 suggested real actions

Example suggestions:

Create announcement

Generate document

Review approvals

Schedule meeting

Do not make this long.

B. Quick Action Grid
Component:
ConciergeQuickActionGrid

Show 8 large premium action tiles:

Create Announcement

Generate Certificate

Review Approvals

Schedule Meeting

Create Request

Follow Up Fees

Resolve Exception

Assign Task

Each tile opens either:

direct bottom-sheet wizard
or

draft action card in chat

C. School Today Strip
Component:
ConciergeTodayStrip

Show only real action counters, not KPI cards:

6 Approvals waiting

4 Urgent requests

3 Meetings today

8 Overdue invoices to follow up

2 Timetable conflicts

5 Document requests pending

Each chip is clickable and opens the right workflow.

D. Conversation area starter messages
Show 3 realistic sample admin actions in the timeline:

Draft fee reminder to Grade 6 parents

Enrollment certificate generated for student

Attendance correction request awaiting decision

These should appear as realistic seeded examples.

ASSISTANT > QUICK ACTIONS EXACT CONTENT
Main component:
ConciergeQuickLaunchBoard

Show a structured grid of advanced actions grouped into sections.

Section 1: Communication
Create announcement

Broadcast reminder

Send targeted message

Use template

Section 2: Documents
Generate certificate

Generate fee statement

Reissue receipt

Open template library

Section 3: Approvals
Review admissions

Review discounts

Review refunds

Review attendance corrections

Section 4: Operations
Create internal request

Assign task

Schedule meeting

Resolve exception

ASSISTANT > TODAY EXACT CONTENT
This page is not analytics.
It is an operations timeline.

Main component:
ConciergeTodayTimeline

Show:

approvals due today

meetings scheduled today

request tickets needing action

communications queued for send

document requests pending

escalations needing review

Each row includes:

time

title

entity

priority

quick action buttons

ASSISTANT > SEARCH EXACT CONTENT
Main component:
ConciergeSearchResultsPanel

Global search must return:

students

parents

teachers

classes

invoices

approvals

requests

documents

announcements

tasks

Each result must include direct actions:

Open

Message

Generate Doc

Create Task

Schedule Meeting

Review Fees

Add Note

This is critical.

ASSISTANT > HISTORY EXACT CONTENT
Main component:
ConciergeActionHistoryTimeline

Show:

actions executed

drafts created

communications sent

approvals processed

documents generated

tasks assigned

Each item must have:

timestamp

action type

linked records

user

result status

open receipt button

BOTTOM-SHEET WIZARD EXACT RULES
Every complex flow must use:

Component:
ConciergeBottomSheetWizard

Visual behavior
rounded top corners

frosted premium panel

drag handle

4-step or 5-step wizard

sticky footer with next/confirm

review step before execute

success state after execute

Mandatory wizard flows
1. Create Announcement Wizard
Steps:

Select audience

Draft message

Preview recipients

Review & schedule

Confirm send

2. Generate Document Wizard
Steps:

Select entity

Choose template

Edit mapped fields

Preview output

Confirm generate

3. Review Approval Wizard
Steps:

Open approval

Review summary and attachments

Review checklist and risk warnings

Choose decision and note

Confirm

4. Schedule Meeting Wizard
Steps:

Select participants

Choose purpose

Suggest times

Confirm slot

Send invite

5. Create Request Wizard
Steps:

Choose request type

Enter details

Suggest assignee and priority

Review SLA and notes

Confirm create

6. Follow Up Fees Wizard
Steps:

Select invoices or filter set

Choose audience

Draft reminder

Preview recipients

Confirm send

7. Resolve Exception Wizard
Steps:

Open exception item

Review linked records

Choose resolution path

Preview changes

Confirm action

8. Assign Task Wizard
Steps:

Select target record

Create task details

Assign owner and due date

Add checklist

Confirm task creation

EXACT ACTION CARD TYPES
Inside chat, the assistant must generate these exact card types:

AnnouncementDraftCard

DocumentDraftCard

ApprovalDecisionCard

MeetingProposalCard

RequestDraftCard

TaskDraftCard

FeeFollowUpCard

ExceptionResolutionCard

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

audit warning if needed

TASKS HEADER EXACT BUILD
Tasks > My Tasks
Show clean stack of task cards:

title

linked entity

due date

owner

priority

checklist progress

waiting badge if blocked

Tasks > Due Today
Show urgency-sorted list.

Tasks > Scheduled
Calendar-like timeline view.

Tasks > Waiting
Show blocked tasks:

waiting on parent

waiting on teacher

waiting on finance

waiting on registrar

Tasks > Completed
Show archived tasks with execution receipt links.

Task actions
Open

Complete

Reschedule

Snooze

Escalate

Reassign

Add checklist

Link record

APPROVALS HEADER EXACT BUILD
Use split layout:

left = approval queue

right = approval detail and compare panel

Component names:
ConciergeApprovalQueue

ConciergeApprovalDetailPanel

Each approval row includes:

request type

requester

affected record

status

priority

threshold badge

due date

Detail panel includes:

summary

before/after compare

checklist

attachments

timeline

risk warnings

decision buttons

Decision buttons:

Approve

Reject

Request Info

Delegate

Escalate

DOCUMENTS HEADER EXACT BUILD
Documents > Generate
Use split view:

left = wizard / template form

right = live preview

Component:
ConciergeSplitPreviewPanel

Documents > Templates
Show template library grid:

name

type

language

last used

mapped fields count

Documents > Requests
Show incoming document request queue.

Documents > Sent / Published
Show generated docs history with:

preview

download

publish status

reissue

audit log

COMMS HEADER EXACT BUILD
Comms > Announcements
Announcement management board.

Comms > Messages
Targeted one-to-one or group messaging.

Comms > Broadcasts
Bulk communication campaigns.

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
audience filters

recipient preview

quiet-hours control

duplicate-send prevention

campaign checklist

attachment support

schedule send

result receipt after send

SETTINGS HEADER EXACT BUILD
Settings > Permissions
Who can:

send communications

approve discounts

approve refunds

approve attendance edits

change records

run batch actions

Settings > Snippets
Reusable:

fee reminders

meeting invites

attendance warnings

admission responses

certificate replies

Settings > Templates
Default templates for docs and comms.

Settings > Routing Rules
Examples:

facilities issue → facilities queue

finance issue → finance queue

transport issue → transport owner

Settings > Notifications
Configure:

reminders

due alerts

result alerts

escalations

Settings > Audit
Retention and visibility of audit events.

CUTTING-EDGE FEATURES TO FORCE
Add these features exactly:

1. Universal Action Search
Every search result must expose actions, not only links.

2. Session Context Engine
Assistant remembers active school context during the session.

3. Result Receipt System
Every finished action produces a premium receipt card.

4. Split Draft/Preview System
For comms, docs, and record changes.

5. Batch Workflow Support
Support multi-record operations.

6. Escalation Layer
For blocked or sensitive actions.

7. Execution Safety Layer
Permission + reason + preview + confirm + audit.

8. Template and Snippet Layer
Deeply reusable.

9. Deep Linking Everywhere
Every receipt and card links to real records.

10. Activity History Timeline
Full action trail.

11. Smart Next-Step Suggestions
After action completion, suggest the next most relevant manual step.

12. Actionable Utility Rail
The right-side utility rail must stay slim but useful.

DATA MODEL
Create and wire real entities:

ConciergeConversation

ConciergeMessage

ConciergeContextSession

ConciergeActionCard

ConciergeTask

ApprovalRequest

ApprovalDecision

DocumentTemplate

GeneratedDocument

AnnouncementDraft

SentAnnouncement

MessageCampaign

MeetingDraft

CalendarEvent

SupportRequest

RequestComment

ExceptionItem

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
Generate realistic seeded data:

15 admin conversations

20 tasks

12 approvals

15 templates

25 generated docs

10 message campaigns

8 meeting workflows

12 requests

10 execution receipts

15 global search result scenarios

realistic school names, student names, parent names, teacher names

No lorem ipsum.

DESIGN STYLE
Make it feel like:

premium 2039 assistant UI

iOS-inspired workflow engine

futuristic but believable

elegant enterprise consumer hybrid

Light mode
Use:

soft silver

blue metallic

ivory slate

amber accents

Dark mode
Use:

graphite

deep slate

muted indigo

steel blue

low glow

Avoid:

pure white

pure black

childish AI visuals

flat CRM look

useless chart clutter

FINAL BUILD COMMAND
Build Concierge (Admin) as a real end-to-end executive assistant for school administrators with:

exact header buttons

exact left subnav

exact first screen layout

exact reusable components

bottom-sheet wizard system

action cards

execution receipts

real records

real permissions

real audit trail

cutting-edge but believable UX

premium multiverse-advanced visual language

Do not simplify it into a chatbot.
Do not turn it into a KPI dashboard.
Do not fake workflows.
Make it serious, premium, minimal, and operational.