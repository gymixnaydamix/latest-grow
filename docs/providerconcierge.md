Create a module named Concierge for the Provider / SaaS Owner dashboard inside a multi-tenant School Management SaaS platform.

This is the Provider Concierge only.

It must be a real premium provider executive assistant + platform control center.
It must be end-to-end, manual, operational, real, multiverse-advanced, and development-aware.

Do not build:

a KPI-only dashboard

a generic AI chatbot

a toy admin assistant

a card gallery with fake actions

a normal CRM helpdesk

a shallow support panel

Build a real master assistant workspace that lets the provider control the entire SaaS ecosystem from one place:

all schools

all tenant dashboards

all modules

all roles

all environments

all billing flows

all support flows

all incidents

all releases

all permissions

all development pipelines

all data operations

This Concierge must feel like:

executive operator

platform owner cockpit

SaaS mission control

release commander

tenant governance console

development-aware assistant

premium enterprise assistant

GLOBAL PRODUCT RULES
Interaction model
Use one mode only:
iOS-style provider assistant with bottom-sheet workflow engine

The module must be:

chat-first

action-card powered

preview-first

confirm-before-execute

result-receipt after execution

deeply connected to all real provider workflows and real platform records

Execution rules
Every real action must follow this flow:

Intent captured

Context resolved

Draft created

Preview shown

Confirmation requested

Execution performed

Receipt generated

Audit log written

Follow-up actions suggested

Sensitive provider actions
Sensitive actions must require:

explicit confirmation

reason field

permission check

dual confirmation for critical actions if configured

audit event

environment impact warning

tenant impact preview

rollback/revert strategy if applicable

Sensitive actions include:

suspend/reactivate tenant

force logout users

change tenant plan

change permissions

bulk billing changes

refunds/credits

feature flag rollout

environment config changes

release promotion

production deploy

rollback

data export/deletion

impersonation placeholder

support escalations

incident declarations

NAVIGATION STRUCTURE
Right Sidebar Main Button
Add:

Concierge

Concierge Top Header Buttons
Use exactly these:

Assistant

Tenants

Operations

Development

Comms

Settings

Left Subnav per Header
Assistant
Chat

Quick Actions

Today

Search

History

Tenants
All Tenants

Health Watch

Onboarding

Plans & Billing

Roles & Modules

Tenant Actions

Operations
Support Desk

Requests & Escalations

Incidents

Data Ops

Security & Compliance

Audit Center

Development
Roadmap

Releases

Feature Flags

Environments

QA & Testing

Dev Tasks

Comms
Broadcasts

Tenant Notices

Release Notes

Incident Updates

Templates

Delivery Log

Settings
Permissions

Routing Rules

Templates & Snippets

Execution Policies

Notifications

Audit Rules

EXACT FIRST SCREEN LAYOUT
When user clicks Concierge, open Assistant > Chat by default.

Page layout
Use a 3-zone layout:

Zone 1: Top Sticky Context Bar
Component name:
ConciergeProviderContextBar

Must contain:

Current Tenant selector

Environment selector (Local / Dev / QA / Staging / Production)

Module selector

Role selector

Release selector

Incident selector

Pin Context button

Clear Context button

Recent Contexts dropdown

Example display:
Working on: Tenant: Green Valley School / Environment: Production / Module: Finance / Role: School Admin

Must support:

single tenant mode

all-tenant global mode

batch tenant context mode

Zone 2: Main Assistant Conversation Area
Component name:
ConciergeProviderConversationPanel

Must contain:

provider assistant message bubbles

provider input bubbles

inline action cards

inline execution receipts

quick suggestion chips

bottom command composer

Composer component:
ConciergeProviderCommandComposer

Composer supports:

natural language

slash commands

attachment button

send button

voice placeholder

recent commands dropdown

Supported commands:

/tenant

/billing

/support

/incident

/release

/deploy

/rollback

/flag

/module

/permission

/export

/delete

/search

/roadmap

/task

/qa

/env

Zone 3: Right Utility Rail
Component name:
ConciergeProviderUtilityRail

Must contain:

Platform Today Strip

Recent Actions mini-list

Active Drafts

Pinned Shortcuts

Alerts badge

Incident status badge

Environment risk badge

Keep it slim, elite, and useful.
Do not make it a KPI-heavy side dashboard.

EXACT COMPONENTS REQUIRED
Create these exact reusable components:

ConciergeProviderContextBar

ConciergeProviderConversationPanel

ConciergeProviderCommandComposer

ConciergeProviderActionCard

ConciergeProviderBottomSheetWizard

ConciergeProviderExecutionReceipt

ConciergeProviderQuickActionGrid

ConciergeProviderTodayStrip

ConciergeProviderSearchResultsPanel

ConciergeProviderTenantCard

ConciergeProviderOpsCard

ConciergeProviderDevCard

ConciergeProviderBillingCard

ConciergeProviderReleaseCard

ConciergeProviderIncidentCard

ConciergeProviderPermissionBadge

ConciergeProviderAuditNotice

ConciergeProviderSplitPreviewPanel

ConciergeProviderTemplatePicker

ConciergeProviderImpactPreviewPanel

ConciergeProviderEnvironmentBadge

ConciergeProviderRollbackPanel

ConciergeProviderTenantBatchPanel

ConciergeProviderModuleMatrix

ConciergeProviderExecutionPolicyBadge

ASSISTANT > CHAT EXACT CONTENT
Default provider concierge screen must show:

A. Welcome block
Short premium welcome:

greeting

current platform context

4 suggested real provider actions

Example suggestions:

Review tenant health

Launch a release

Resolve urgent support escalation

Configure a tenant module

Do not make this long.

B. Quick Action Grid
Component:
ConciergeProviderQuickActionGrid

Show 10 premium action tiles:

Open Tenant Control

Create / Provision School

Change Plan / Billing

Resolve Support Escalation

Declare Incident

Launch Release

Change Feature Flag

Run Data Export

Assign Dev Task

Broadcast Tenant Notice

Each tile opens:

direct bottom-sheet wizard
or

draft action card in chat

C. Platform Today Strip
Component:
ConciergeProviderTodayStrip

Show only real actionable provider items:

6 tenants need attention

3 failed billing collections

4 urgent support escalations

1 active incident

2 staged releases awaiting approval

5 feature flags pending rollout

3 data export/delete requests

7 dev tasks blocked

Each chip must be clickable and open the correct workflow.

D. Conversation area starter messages
Show 4 realistic seeded examples:

tenant suspension draft with impact preview

production release promotion draft

urgent support escalation routed

billing follow-up campaign prepared

These must look like real provider assistant actions.

ASSISTANT > QUICK ACTIONS EXACT CONTENT
Main component:
ConciergeProviderQuickLaunchBoard

Group advanced provider actions into sections.

Section 1: Tenant Control
Open tenant

Provision school

Suspend/reactivate tenant

Configure modules

Section 2: Platform Operations
Resolve escalation

Create support task

Open incident workflow

Run data operation

Section 3: Billing & Commercial
Change subscription plan

Apply credit/refund

Follow up failed billing

Broadcast renewal reminder

Section 4: Development & Release
Create release

Promote build

Toggle feature flag

Open rollback workflow

Section 5: Governance
Update permissions

Run access review

Export audit package

Open compliance request

ASSISTANT > TODAY EXACT CONTENT
This is not analytics.
It is a platform operations timeline.

Main component:
ConciergeProviderTodayTimeline

Show:

onboarding tasks due today

support escalations

failed payments

active incidents

release approvals due

QA blockers

flagged tenant issues

security/compliance requests

Each row includes:

time

title

tenant/environment context

severity

quick action buttons

ASSISTANT > SEARCH EXACT CONTENT
Main component:
ConciergeProviderSearchResultsPanel

Global provider search must return:

tenants

school admins

subscriptions

invoices/payments/refunds

support tickets

incidents

release records

feature flags

environments

deployments

audit events

permissions

modules

requests

data operations

dev tasks

QA runs

Each result must include direct actions:

Open

Change Status

Assign

Broadcast

Toggle Flag

Deploy

Rollback

Export

Approve

Suspend

Reactivate

Add Note

Escalate

This is critical.

ASSISTANT > HISTORY EXACT CONTENT
Main component:
ConciergeProviderActionHistoryTimeline

Show:

tenant changes

support resolutions

billing changes

refunds issued

releases created/promoted

feature flags changed

incidents declared/resolved

data exports/deletions

permissions updated

dev tasks assigned

audit package exports

Each item must have:

timestamp

action type

tenant/environment context

user

result status

open receipt button

BOTTOM-SHEET WIZARD EXACT RULES
Every complex flow must use:

Component:
ConciergeProviderBottomSheetWizard

Visual behavior
rounded top corners

premium frosted panel

drag handle

4-step or 5-step flow

sticky footer with next/confirm

review step before execute

impact preview before execute

success state after execute

rollback guidance if applicable

Mandatory wizard flows
1. Provision Tenant Wizard
Steps:

Enter school identity

Choose plan/modules/limits

Configure admin/domain/branding placeholders

Review provisioning summary

Confirm create tenant

2. Tenant Change Control Wizard
Steps:

Select tenant

Choose action

Review affected modules/users/billing

Review impact preview

Confirm execute

Supported actions:

suspend

reactivate

plan upgrade/downgrade

module enable/disable

role permission preset update

storage/usage limit update

3. Support Escalation Wizard
Steps:

Select ticket/request

Review issue and SLA

Choose owner/priority/escalation path

Review reply/internal notes

Confirm update

4. Incident Command Wizard
Steps:

Declare/select incident

Define severity and affected services

Choose impacted tenants/environments

Draft comms and mitigation actions

Confirm incident action

5. Release Promotion Wizard
Steps:

Select release/build

Select environment

Review QA gates and dependencies

Review rollout/rollback plan

Confirm promote/deploy

6. Feature Flag Wizard
Steps:

Select feature

Choose scope (global/plan/tenant/env)

Review risk and dependency impact

Preview rollout

Confirm toggle

7. Data Operation Wizard
Steps:

Select export/delete/migration/repair

Select tenant/data scope

Review security/compliance checks

Review impact and delivery target

Confirm execute

8. Billing Action Wizard
Steps:

Select tenant/account

Choose action (invoice/refund/credit/plan change/follow-up)

Review amounts and policy checks

Preview customer-facing output

Confirm execute

9. Permission Change Wizard
Steps:

Select role/team/tenant scope

Review current permissions

Edit permissions/preset

Review risk + audit summary

Confirm apply

10. Dev Task / QA Workflow Wizard
Steps:

Select issue/release/task context

Choose owner/stage/environment

Add checklist/acceptance rules

Review execution plan

Confirm create/update

EXACT ACTION CARD TYPES
Inside chat, the assistant must generate these exact card types:

TenantProvisionDraftCard

TenantControlActionCard

BillingActionDraftCard

SupportEscalationCard

IncidentCommandCard

ReleasePromotionCard

FeatureFlagCard

DataOperationCard

PermissionChangeCard

DevTaskDraftCard

RollbackActionCard

BroadcastDraftCard

EnvironmentConfigCard

ComplianceRequestCard

QAWorkflowCard

Every card must contain:

title

status chip

tenant/environment scope

linked entities

editable fields

impact preview button

confirm button

cancel button

permission chip

audit warning

rollback note if relevant

TENANTS HEADER EXACT BUILD
Tenants > All Tenants
Show a real tenant control list.

Component names:
ConciergeProviderTenantQueue

ConciergeProviderTenantDetailPanel

Each row includes:

tenant name

status

plan

billing state

health state

active modules

last activity

urgent flags

Direct actions:

Open

Suspend

Reactivate

Change Plan

Configure Modules

View Usage

Open Billing

Send Notice

Tenants > Health Watch
Show tenants with operational warnings:

usage limit risk

failed billing

support overload

incidents impacting tenant

low activity / onboarding stalled

error spikes placeholder

Tenants > Onboarding
Show onboarding pipeline:

lead approved

created

configured

imported

trained

live

blocked

Tenants > Plans & Billing
Show tenant subscription and commercial status.

Tenants > Roles & Modules
Show role access and enabled module matrix.

Tenants > Tenant Actions
Show batch operations and recent provider actions on tenants.

OPERATIONS HEADER EXACT BUILD
Use split layout:

left = operational queue

right = detail / resolution panel

Component names:
ConciergeProviderOpsQueue

ConciergeProviderOpsDetailPanel

Operations > Support Desk
Ticket queues by SLA and severity.

Operations > Requests & Escalations
High-touch provider-level requests.

Operations > Incidents
Incident command board.

Operations > Data Ops
Exports, deletes, migrations, repairs.

Operations > Security & Compliance
Access reviews, suspicious actions, retention/deletion requests.

Operations > Audit Center
Deep action history and compliance logs.

Required operations features
queue filters

owner assignment

SLA state

severity

linked tenants

environment badges

internal notes

external communication links

action receipts

DEVELOPMENT HEADER EXACT BUILD
This is critical.
You asked to include development, so build this as a real provider dev-control layer.

Use split layout:

left = development/release/QA queue

right = release detail / environment / execution panel

Component names:
ConciergeProviderDevQueue

ConciergeProviderDevDetailPanel

Development > Roadmap
Roadmap items grouped by:

planned

in progress

QA

staged

released

blocked

Development > Releases
Release list with:

version

scope

modules impacted

environments

status

release notes

risk badge

Development > Feature Flags
Flag matrix by:

global

environment

plan

tenant

beta cohort

Development > Environments
Show:

local

dev

QA

staging

production

Each environment must show:

status

last deploy

current release

pending promotion

rollback availability

config variance placeholder

Development > QA & Testing
Show:

test runs

manual QA checklists

blocked items

regression suites placeholder

release signoff queue

Development > Dev Tasks
Show:

provider-created tasks

engineering tasks

integration tasks

bugfix tasks

hotfix tasks

dependency blockers

Required development features
create release draft

promote release between environments

compare environments

toggle flags

assign dev tasks

create QA task

block release

unblock release

rollback planning

release note drafting

dependency warnings

tenant impact preview

COMMS HEADER EXACT BUILD
Comms > Broadcasts
Provider-to-tenant communication campaigns.

Comms > Tenant Notices
Targeted notices to specific schools or cohorts.

Comms > Release Notes
Release communication center.

Comms > Incident Updates
Incident-related status messages and follow-ups.

Comms > Templates
Reusable provider message templates.

Comms > Delivery Log
Track:

queued

sent

delivered

failed

opened if supported

Required comms features
audience scope by tenant/plan/module/region

targeted release notes

incident notices

billing reminders

onboarding reminders

support closure messages

preview recipients

schedule send

duplicate-send prevention

quiet hours / business-hour policy

result receipt after send

SETTINGS HEADER EXACT BUILD
Settings > Permissions
Who can:

suspend tenants

change plans

issue refunds

push releases

toggle flags

export/delete data

access production actions

resolve incidents

impersonation placeholder access

Settings > Routing Rules
Examples:

billing escalation → finance ops

security issue → security admin

failed deploy → release owner

stalled onboarding → customer success

incident severity 1 → incident commander

Settings > Templates & Snippets
Reusable provider templates:

billing notices

onboarding nudges

release notes

incident updates

support replies

compliance responses

rollback notices

Settings > Execution Policies
Rules for:

dual approval

production confirmations

rollback requirements

audit retention

sensitive action gating

release gate policies

Settings > Notifications
Configure:

incident alerts

billing failures

release approvals

QA blockers

security alerts

support SLA breaches

Settings > Audit Rules
Retention, visibility, export package settings.

CUTTING-EDGE FEATURES TO FORCE
Add these features exactly:

1. Universal Action Search
Every provider search result exposes direct actions, not just links.

2. Session Context Engine
Provider concierge remembers tenant, environment, module, role, release, and incident context during session.

3. Result Receipt System
Every completed action produces a premium receipt card.

4. Split Draft/Preview System
For notices, billing actions, permission changes, release notes, and record changes.

5. Impact Preview Layer
Before action execution, always preview:

affected tenants

affected modules

affected users

billing/commercial impact

environment risk

rollback possibility

6. Batch Workflow Support
Support:

batch tenant updates

batch billing reminders

batch module enable/disable

batch permission updates

batch data export packaging

batch support reassignment

7. Environment Control Layer
Deep environment-aware operations:

compare envs

promote release

verify QA gate

flag config drift placeholder

rollback readiness

release freeze mode

8. Release Safety Layer
Before deploy/promotion:

show QA status

dependency checks

impacted modules

tenant cohort

rollout path

rollback plan

9. Feature Flag Control Layer
Granular flag management:

global

environment

plan

tenant

beta cohort

test cohort

10. Incident Command Layer
Support:

declare incident

assign commander

impacted tenant mapping

mitigation tasks

public/internal notes

status updates

resolution handoff

11. Billing Governance Layer
Support:

invoice actions

credits

refunds

retries

plan changes

renewal campaigns

suspension rules

12. Data Governance Layer
Support:

export package generation

deletion requests

retention policy enforcement

repair/migration tasks

audit packaging

13. Development Workflow Layer
Support:

roadmap linking

release management

QA signoff

hotfix actions

task delegation

issue triage

deployment readiness

post-release follow-up

14. Deep Linking Everywhere
Every receipt and card links to:

tenant

release

environment

audit event

support request

billing record

incident

flag

task

module config

15. Activity History Timeline
Full platform action trail.

16. Smart Next-Step Suggestions
After action completion, suggest the next relevant provider action:

“Now notify affected tenants”

“Now create rollback watch task”

“Now verify QA signoff”

“Now open tenant billing history”

“Now schedule post-release audit”

17. Actionable Utility Rail
The slim utility rail must remain dense, elegant, and useful.

18. Development + Production Separation Awareness
All actions must clearly show whether they affect:

local

dev

QA

staging

production

Never blur them.

DATA MODEL
Create and wire real entities:

ProviderConciergeConversation

ProviderConciergeMessage

ProviderConciergeContextSession

ProviderConciergeActionCard

Tenant

TenantModuleConfig

TenantRoleConfig

Subscription

Invoice

Payment

Refund

CreditAction

SupportTicket

EscalationRecord

Incident

IncidentUpdate

DataOperation

ComplianceRequest

PermissionPolicy

AuditLogEvent

ReleaseRecord

ReleaseNote

DeploymentRecord

EnvironmentRecord

FeatureFlag

FeatureFlagScope

QARun

DevTask

ExecutionReceipt

BroadcastCampaign

TenantNotice

Each entity must support:

list view

detail view

state/status

timestamps

linked records

permissions

history

search

tenant/environment scope where relevant

DEMO DATA
Generate realistic seeded provider data:

20 provider assistant conversations

15 tenant control workflows

12 billing scenarios

14 support escalations

8 incidents

10 releases

12 feature flag changes

10 environment operations

14 dev/QA tasks

10 data/compliance requests

12 broadcasts/notices

15 execution receipts

20 global search result scenarios

Use realistic:

school names

tenant plans

release versions

incident titles

billing events

module names

environment states

No lorem ipsum.

DESIGN STYLE
Make it feel like:

premium 2039 provider mission-control assistant

iOS-inspired workflow engine

futuristic but believable

elite, calm, powerful, enterprise, operational

Light mode
Use:

soft silver

blue metallic

ivory slate

restrained amber accents

premium red/orange only for risk and incidents

Dark mode
Use:

graphite

deep slate

muted indigo

steel blue

low glow accents

premium severity highlights

Avoid:

pure white

pure black

childish AI visuals

flat CRM look

useless chart clutter

fake dev console styling

FINAL BUILD COMMAND
Build Concierge (Provider / SaaS Owner) as a real end-to-end master platform assistant with:

exact header buttons

exact left subnav

exact first screen layout

exact reusable components

bottom-sheet wizard system

action cards

execution receipts

real provider workflows

real tenant controls

real development and release controls

real environment awareness

real permissions

real audit trail

cutting-edge but believable UX

premium multiverse-advanced visual language

This Concierge must control:

all school dashboards

all tenant settings

all plans and billing

all support and incidents

all modules and permissions

all releases and flags

all environments

all development and QA workflows

all data and compliance operations

Do not simplify it into a chatbot.
Do not turn it into a KPI dashboard.
Do not fake workflows.
Make it serious, premium, minimal, powerful, and operational.