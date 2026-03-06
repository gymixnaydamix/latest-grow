# Grow Your Need - School Admin Dashboard Wireframe & UI/UX Specification

This document provides a comprehensive wireframe and specification for the "School Admin" role view within the Dynamic SaaS Dashboard. It details the specific navigation, components, and features available to an administrator managing a single school tenant.

---

## 1. School Admin Dashboard Overview

**Role:** School Admin (e.g., Dr. Evelyn Reed)

**Primary Objective:** To provide a school administrator with a powerful, centralized interface for managing all aspects of their school's operations on the platform. This includes user management (staff, students, parents), academic organization, school finances, communications, and tenant-specific settings.

**General Layout:** The School Admin's view utilizes the main application shell, consisting of a fixed Header, a flexible main content area with a Right Sidebar and an optional Left Sub-navigation, and a fixed Footer with the App Launcher. The components and data displayed are tailored specifically for managing a single school instance.

---

## 2. Style & Appearance

The School Admin dashboard adheres to the core UI philosophy and style guide outlined in the main `grow-your-need-wire-frame.md` document, ensuring a consistent and high-quality user experience across all roles.

-   **Color Palette:** Utilizes the primary (light/dark theme) color palette. Key active states are highlighted with `--accent-primary` (Right Sidebar) and `--accent-secondary` (Left Sub-navigation).
-   **Typography:** Employs the `Inter` font family for all text.
-   **Layout & Spacing:** All components use the standard `1rem` border-radius and `shadow-custom`.

---

## 3. Component Wireframe: School Admin's View

### 3.1. Right Sidebar (Main Navigation)

This is the primary navigation hub for the School Admin. The sections are focused on school and tenant management.

| Icon                            | Label               | ID                  | Description                                                                                             |
| ------------------------------- | ------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `home-icon`                     | Dashboard           | `dashboard`         | Displays an overview of the school's key metrics, alerts, and quick actions.                            |
| `graduation-cap-icon`           | School              | `school`            | Manages users, academics, finances, facilities, and other core school operations.                     |
| `calculator-icon`               | CRM                 | `crm`               | Manages admissions pipelines, student/family relations, and fundraising campaigns.                      |
| `briefcase-icon`                | Tool-Platform       | `tool_platform`     | Manages third-party integrations (e.g., Google Classroom) and API access for the school.              |
| `chat-bubble-left-right-icon`   | Communication       | `communication`     | Accesses school-wide communication tools like email blasts, social media, and community announcements.  |
| `sparkles-icon`                 | Concierge AI        | `concierge_ai`      | Utilizes the AI assistant for administrative tasks, data analysis, and support.                       |
| `heart-icon`                    | Wellness            | `wellness`          | Monitors student and staff wellness metrics and accesses related resources.                             |
| `wrench-screwdriver-icon`       | Tools               | `tools`             | Accesses platform-provided productivity tools.                                                          |
| `cog-6-tooth-icon`              | Setting             | `setting`           | Manages the admin's personal profile, notifications, and school billing information.                    |

### 3.2. Header Navigation (Contextual)

The header's central navigation bar adapts based on the selected Right Sidebar section.

| Right Sidebar Section | Header Buttons Displayed                                         |
| --------------------- | ---------------------------------------------------------------- |
| **Dashboard**         | Overview, Analytics, Market, System                              |
| **School**            | Onboarding, Users, Academics, Finance, Facilities, Transportation, Library, White Labeling |
| **CRM**               | Admissions, Student & Family Relations, Alumni & Fundraising, Campaigns & Outreach, Analytics & Reporting |
| **Tool-Platform**     | Integrations, API Access                                         |
| **Communication**     | Email, Social-Media, Community, Templates, Management            |
| **Concierge AI**      | Assistant, Analytics, Operations, Development, Settings          |
| **Wellness**          | Overview                                                         |
| **Tools**             | Overview                                                         |
| **Setting**           | Account                                                          |

### 3.3. Left Sub-navigation (Contextual)

This sidebar appears only when the selected Header item has further sub-categories.

| Right Sidebar -> Header | Left Sub-nav Buttons Displayed                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **School** -> Users              | Manage Staff, Manage Students, Manage Parents                                                                                                                                                                       |
| **School** -> Academics          | Departments, Curriculum, Gradebook                                                                                                                                                                                  |
| **School** -> Finance            | Tuition & Billing, Expense Tracking, Financial Reporting                                                                                                                                                            |
| **School** -> Facilities         | Room Booking, Maintenance                                                                                                                                                                                           |
| **School** -> Transportation     | Bus Routes, Student Tracking                                                                                                                                                                                          |
| **School** -> Library            | Catalog, Check-in/Out                                                                                                                                                                                                 |
| **School** -> White Labeling     | Branding, Login Page                                                                                                                                                                                                    |
| **CRM** -> (All except Pipeline) | Varies by header (e.g., *Admissions*: Pipeline, Applications; *Relations*: Directory, Communication Log)                                                                                                             |
| **Tool-Platform** -> Integrations | Marketplace, My Integrations                                                                                                                                                                                          |
| **Tool-Platform** -> API Access   | Keys, Logs                                                                                                                                                                                                              |
| **Communication** -> (All) | Varies by header (e.g., *Email*: Compose, Inbox, Starred; *Management*: Email, Social-Media, Community)                                                                                                                  |
| **Setting** -> Account           | Profile, Notifications, Billing                                                                                                                                                                                         |

---

## 4. Detailed Main Content Views

### 4.1. Main Dashboard (`dashboard/overview`)

This view (`AdminDashboard.tsx`) is the command center, offering a snapshot of the school's immediate status.

-   **School At-a-Glance Panel:** A prominent header section with key stats:
    -   **Total Students:** 550
    -   **Total Staff:** 45
    -   **Today's Attendance Rate:** 96.5%
    -   **Current Date & Time:** Live clock.
-   **Actionable Alerts Card:** Dynamically generated alerts that demand immediate attention.
    -   *Red Alert:* "3 Staff Absences Reported for Today."
    -   *Yellow Alert:* "5 Overdue Tuition Invoices."
    -   *Blue Alert:* "New High-Priority IT Support Ticket."
    -   *Gray Alert:* "Facility Maintenance Request: Room 201."
-   **Enrollment Funnel Card:** A visual bar chart showing the number of students at each admissions stage: `Inquiries (120)` -> `Applications (85)` -> `Admitted (60)` -> `Enrolled (55)`.
-   **Quick Actions Card:** Large, easy-to-click buttons for the most common administrative tasks.
    -   "Manage Users" (links to `school/users`)
    -   "Send Announcement" (links to `communication/community`)
    -   "View Financial Reports" (links to `school/finance`)
    -   "Review Admissions" (links to `crm/admissions`)
-   **Recent Activity Feed:** A chronological list of the latest important events within the tenant.
    -   `[10:05 AM] Mr. Chen submitted grades for 'History Essay'.`
    -   `[9:30 AM] A new application was submitted by 'Samantha Ray'.`
    -   `[Yesterday] A payment of $550.00 was received from the 'Miller Family'.`

### 4.2. School Management (`school/*`)

-   **User Management (`/school/users/*`):**
    -   A tabbed interface for "Staff," "Students," and "Parents."
    -   Each tab displays a searchable and filterable table with relevant columns (e.g., Name, ID, Email, Role/Grade, Status).
    -   **Bulk Actions:** Buttons above the table for "Add New User," "Bulk Import from CSV," and "Send Bulk Message."
    -   **Row Actions:** Each row has a menu with options to "View Profile," "Edit Roles/Permissions," "Reset Password," "Suspend Account."

-   **Academics Management (`/school/academics/*`):**
    -   **Departments:** An interface to create/edit departments (e.g., "Math," "Science") and assign a "Head of Department" from the staff list.
    -   **Curriculum:** A tool to manage curriculum standards, allowing admins to upload standard sets (e.g., Common Core) and see which courses are mapped to which standards.
    -   **Gradebook (Admin View):** A high-level analytics view. It shows school-wide grade distribution charts, identifies courses with the lowest average scores, and flags teachers who have a high number of ungraded assignments.

-   **Finance Management (`/school/finance/*`):**
    -   **Tuition & Billing:** Set up tuition plans and fee structures. Generate invoices for all students in bulk. Track payment status (Paid, Unpaid, Overdue) and send automated reminders.
    -   **Expense Tracking:** A tool to log and categorize school expenses (salaries, supplies, utilities).
    -   **Financial Reporting:** Generate comprehensive reports like "Profit & Loss," "Revenue by Month," and "Outstanding Balances." Reports can be exported to CSV or PDF.

-   **White Labeling (`/school/whitelabeling/*`):**
    -   **Branding:** A settings page with a color picker to set the primary brand color and a file uploader for the school's logo. A live preview shows how the login page will look.
    -   **Login Page:** Customize the text and background image of the tenant's login portal.
    -   **Custom Domain:** A form to input a custom domain (e.g., `portal.yourschool.com`) with instructions for updating DNS records.

### 4.3. CRM (`crm/*`)

-   **Admissions Pipeline (`/crm/admissions/pipeline`):**
    -   A full-screen Kanban board with draggable cards representing prospective students.
    -   **Columns:** Inquiry, Application Submitted, Interviewed, Admitted, Enrolled, Withdrawn.
    -   **Card Details:** Each card shows the student's name, application date, and key tags (e.g., "Scholarship Candidate," "Sibling Enrolled"). Clicking a card opens a detailed view with all application data and communication logs.
-   **Alumni & Fundraising (`/crm/fundraising/*`):**
    -   **Alumni Directory:** A searchable database of past students.
    -   **Campaigns:** Create and manage fundraising campaigns. Each campaign has a goal amount, a progress bar (thermometer), a list of donors, and communication tools to reach out to potential contributors.

---

## 5. School Admin-Specific AI Capabilities (Concierge AI)

The Concierge AI acts as a powerful data analyst and administrative assistant for the School Admin.

-   **Data Analysis & Reporting:**
    -   "Show me the overall attendance rate for 9th grade vs 10th grade for the last month."
    -   "Generate a report of all students with more than 3 overdue assignments."
    -   "What is our total outstanding tuition revenue for this semester?"
    -   "List all teachers who have not submitted their final grades for Q1."
-   **Administrative Tasks:**
    -   "Find the contact information for Alex Johnson's parents."
    -   "Draft an announcement to all parents about the upcoming school closure for the holiday."
    -   "Schedule a meeting for all department heads next Tuesday at 10 AM and book the conference room."
-   **Problem Solving & Insights:**
    -   "Which courses have the lowest average student performance? Show me the top 3."
    -   "Analyze the admissions data. What are the most common reasons applicants withdraw after being admitted?"
    -   "Summarize the recent maintenance requests. Are there any recurring issues in a specific building?"
-   **Policy & Information Retrieval:**
    -   "What is the school's official policy on excused absences?"
    -   "Pull up the curriculum standards for 11th Grade English."

---

## 6. Settings (`setting/account/*`)

-   **Profile:** Manage personal information (name, contact details, password).
-   **Notifications:** A detailed list of toggle switches to control which notifications the admin receives and how (in-app, email, push).
    -   Examples: "A new high-priority support ticket is created," "A tuition payment over $1,000 is received," "A teacher reports an absence for today."
-   **Billing (SaaS Subscription):** A read-only view of the school's subscription plan with the Grow Your Need platform. Shows the current plan, usage against limits (e.g., 550 / 1000 students), payment method on file, and a history of invoices from Grow Your Need.