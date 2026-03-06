# Grow Your Need - Owner Dashboard Wireframe & UI/UX Specification

This document provides a comprehensive wireframe and specification for the "Owner" role view within the Dynamic SaaS Dashboard. It details the specific navigation, components, and features available to the platform owner.

---

## 1. Owner's Dashboard Overview

**Role:** Owner (e.g., Yassine Eljebari)

**Primary Objective:** To provide the platform owner with a high-level, centralized view of the entire SaaS ecosystem. This includes monitoring key business metrics (MRR, churn), managing tenants (schools, individuals), configuring platform-wide settings, and accessing advanced AI-powered administrative tools.

**General Layout:** The Owner's view uses the main application shell, consisting of a fixed Header, a flexible main content area with a Right Sidebar and an optional Left Sub-navigation, and a fixed Footer with the App Launcher. The components and data displayed are tailored specifically for the Owner's administrative and strategic needs.

---

## 2. Style & Appearance

The Owner's dashboard adheres to the core UI philosophy and style guide outlined in the main `grow-your-need-wire-frame.md` document.

-   **Color Palette:** Utilizes the primary (light/dark theme) color palette. Key active states are highlighted with `--accent-primary` (Right Sidebar) and `--accent-secondary` (Left Sub-navigation).
-   **Typography:** Employs the `Inter` font family for all text, using a consistent type scale for hierarchy.
-   **Layout & Spacing:** All components use the standard `1rem` border-radius and `shadow-custom` for a clean, consistent look. Spacing follows a predictable scale.

---

## 3. Component Wireframe: Owner's View

### 3.1. Right Sidebar (Main Navigation)

This is the primary navigation hub for the Owner. The labels are specifically tailored for this role.

| Icon                            | Label (Owner View)  | ID                  | Description                                                                                             |
| ------------------------------- | ------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `home-icon`                     | Dashboard           | `dashboard`         | Displays the main overview with platform-wide KPIs and alerts.                                        |
| `graduation-cap-icon`           | Tenant Mgt          | `school`            | Manages all tenants (schools and individuals), platform billing plans, and invoices.                  |
| `calculator-icon`               | Platform CRM        | `crm`               | Accesses the top-level CRM for managing the sales pipeline and tenant accounts.                         |
| `briefcase-icon`                | Tool-Platform       | `tool_platform`     | Manages platform-level integrations and API access for tenants.                                         |
| `chat-bubble-left-right-icon`   | Communication       | `communication`     | Accesses platform-wide communication tools like email and social media management.                      |
| `sparkles-icon`                 | Concierge AI        | `concierge_ai`      | The central hub for configuring, training, and operating the platform's core AI assistant.              |
| `heart-icon`                    | Wellness            | `wellness`          | Provides an overview of wellness features and usage across the platform.                                |
| `wrench-screwdriver-icon`       | Tools               | `tools`             | Provides an overview of productivity tools available to users.                                          |
| `squares-plus-icon`             | Overlay-Setting     | `overlay_setting`   | Manages the settings and content for all overlay applications (Studio, Media, etc.).                  |
| `cog-6-tooth-icon`              | Platform Settings   | `setting`           | Configures global platform settings like feature flags, security, and legal information.                |

**Visual States:**
-   **Default:** Gray icon and text (`--secondary`).
-   **Hover:** Background color changes (`--accent-primary/10`).
-   **Active:** Background is `bg-accent-primary/20`, text/icon is `text-accent-primary`, and a vertical `bg-accent-primary` bar appears on the left edge.

### 3.2. Header Navigation (Contextual)

The header's central navigation bar adapts based on the selected Right Sidebar section.

| Right Sidebar Section | Header Buttons Displayed                                         |
| --------------------- | ---------------------------------------------------------------- |
| **Dashboard**         | Overview, Analytics, Market, System                              |
| **Tenant Mgt**        | Tenants, Platform Billing                                        |
| **Platform CRM**      | Sales Pipeline, Tenant Accounts                                  |
| **Tool-Platform**     | Integrations, API Access                                         |
| **Communication**     | Email, Social-Media, Community, Templates, Management            |
| **Concierge AI**      | Assistant, Analytics, Operations, Development, Settings          |
| **Wellness**          | Overview                                                         |
| **Tools**             | Overview                                                         |
| **Overlay-Setting**   | Management                                                       |
| **Platform Settings** | Configuration                                                    |

### 3.3. Left Sub-navigation (Contextual)

This sidebar appears only when the selected Header item has further sub-categories.

| Right Sidebar -> Header | Left Sub-nav Buttons Displayed                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tenant Mgt** -> Tenants        | Schools, Individuals                                                                                                                                                                                                |
| **Tenant Mgt** -> Platform Billing | Plans, Invoices, Gateways                                                                                                                                                                                           |
| **Tool-Platform** -> Integrations | Marketplace, My Integrations                                                                                                                                                                                          |
| **Tool-Platform** -> API Access   | Keys, Logs                                                                                                                                                                                                              |
| **Communication** -> (All) | Varies by header (e.g., *Email*: Compose, Inbox, Starred; *Management*: Email, Social-Media, Community)                                                                                                                  |
| **Concierge AI** -> (All)  | Varies by header (e.g., *Development*: Code Gen, DB Schema, Log Analysis, Add Component, Modify Component, Manage Deps, Create API, Project Enhancer; *Settings*: Configuration, Data Sources, Usage, Training)             |
| **Overlay-Setting** -> Management | Studio, Media, Gamification, Leisure, Market, Lifestyle, Hobbies, Knowledge, Sports, Religion, Services (a list of all overlay apps)                                                                                   |
| **Platform Settings** -> Configuration | General, Feature Flags, Integrations, Security & Access, Legal                                                                                                                                                    |

### 3.4. Main Content Views

#### 3.4.1. Owner's Dashboard (`dashboard/overview`)
The default view renders the `OwnerDashboard.tsx` component, which is a high-level summary of the entire platform's health.
-   **KPI Cards:** A row of key performance indicators:
    -   **MRR:** "$15,230" with subtext "+2.1% from last month".
    -   **Active Tenants:** "120" with subtext "85 Schools, 35 Individuals".
    -   **LTV:** "$2,450" (Customer Lifetime Value).
    -   **Churn Rate:** "2.1%" with subtext "-0.5% from last month".
-   **Actionable Alerts Card:** Highlights critical system or business events.
    -   *Red Alert:* "High API Error Rate Detected (5.2%)".
    -   *Yellow Alert:* "Payment Gateway Connection Issue".
    -   *Blue Alert:* "3 High-Priority Support Escalations".
-   **Growth Charts:**
    -   **MRR Growth:** A line chart showing Monthly Recurring Revenue over the last 12 months.
    -   **New Trials:** A bar chart showing new trial sign-ups per month.
-   **Platform Controls Card:** Quick navigation buttons to key management areas like "Manage Subscription Plans" and "Platform Settings".

#### 3.4.2. Tenant Management (`school/*`)
-   **Tenants View:** A searchable, filterable table of all tenants. Columns include Tenant Name, Type (School/Individual), Status (Active/Trial/Suspended), User Count, and Subscription Plan. Each row has a "Manage" button.
-   **Platform Billing View:**
    -   **Plans:** An interface to create, edit, and archive subscription plans (e.g., Pro, Enterprise).
    -   **Invoices:** A searchable log of all invoices generated for all tenants.
    -   **Gateways:** Configuration for payment gateways like Stripe.

#### 3.4.3. Platform CRM (`crm/*`)
-   **Sales Pipeline View:** A Kanban-style board with columns for "Lead," "Contacted," "Demo Scheduled," "Trial," and "Subscribed."
-   **Tenant Accounts View:** A detailed view of each tenant with CRM-specific fields like account owner, contact history, and notes.

#### 3.4.4. Concierge AI (`concierge_ai/*`)
-   **Assistant View:** A full-screen chat interface where the owner can issue commands and ask questions about platform-wide data.
-   **Analytics View:** Dashboards showing AI usage statistics, token consumption, estimated costs per provider, and most common user queries.
-   **Operations View:**
    -   *System Health:* Real-time dashboards monitoring API response times, database load, and background job queues.
    -   *Tenant Management:* A view to configure AI feature access on a per-tenant or per-plan basis.
    -   *Support:* A queue of escalated support tickets where the AI has been unable to find an answer, allowing the owner to intervene and provide a correct response for future training.
-   **Development View (Advanced):** A suite of AI-powered tools for the owner to directly modify the application:
    -   *Code Gen:* Generate new code snippets based on a prompt.
    -   *DB Schema:* A read-only viewer for the current Drizzle ORM database schema.
    -   *Log Analysis:* An interface to paste logs and ask the AI to find anomalies or summarize issues.
    -   *Add/Modify Component:* A form to submit a natural language request to create a new React component or modify an existing one.
    -   *Manage Deps:* A form to request adding or removing npm packages.
    -   *Create API:* A form to request a new tRPC API procedure.
    -   *Project Enhancer:* The most powerful tool; a large textarea where the owner can describe a complex, multi-file feature request for the AI to implement.
-   **Settings View:** A detailed interface to configure all AI providers (API keys, models), vector database connections, and the global system prompt.

#### 3.4.5. Platform Settings (`setting/*`)
-   **Feature Flags View:** A list of all platform features with switches to enable or disable them globally or restrict them to certain subscription plans.
-   **Integrations View:** Configure platform-wide integrations (e.g., global email service, analytics provider).
-   **Security & Access View:** Manage access control for owner-level administrative staff.

---

## 4. Owner-Specific AI Capabilities (Concierge AI)

The Concierge AI provides the owner with unparalleled insight and control over the platform. Example prompts include:

-   **Business Intelligence:**
    -   "Show me the MRR growth trend for the last 6 months."
    -   "Which subscription plan has the highest churn rate?"
    -   "List all school tenants currently in their trial period with more than 50 users."
-   **System Diagnostics:**
    -   "Analyze the recent error logs and summarize the root cause of the 500 errors."
    -   "Are there any database queries that are consistently slow?"
    -   "What was the peak API usage time yesterday?"
-   **User & Tenant Management:**
    -   "Draft an email to all tenants on the 'Pro' plan about the new 'AI Study Hub' feature."
    -   "Find the user account associated with the email 'alex@example.com'."
-   **AI-Assisted Development (via Development Tools):**
    -   "Generate a new React component named 'BillingSummaryCard' that accepts an invoice object as a prop and displays the amount and due date."
    -   "Add a 'status' column to the `classes` table in the database schema."
    -   "Add the `react-beautiful-dnd` package to the project to implement drag-and-drop."
    -   **(Project Enhancer):** "Create a new 'Wellness' section. It needs a right sidebar entry and a dashboard page. The dashboard should have cards for 'Mood Tracking', 'Journaling', and 'Goals'. Add the necessary navigation logic and create placeholder components for these features."

---

## 5. Footer & App Launcher

-   **Functionality:** The footer provides toggles for the sidebars and access to the App Launcher, consistent with the main platform design.
-   **Available Overlay Apps:** The Owner has access to all overlay applications (Studio, Media, etc.) to manage global content and features. The internal navigation within these apps is identical across all roles.

---

## 6. Conclusion

The Owner Dashboard is a powerful tool that provides comprehensive insights and controls for managing the platform effectively. With its advanced AI capabilities, intuitive navigation, and robust feature set, it empowers owners to make data-driven decisions, enhance user experiences, and streamline administrative tasks. By leveraging the various views and tools available, owners can ensure the platform meets the needs of all users while driving continuous improvement and innovation.

---

## Appendix: Future Enhancements & Considerations
-   **Multi-Owner Support:** Future iterations could allow multiple owners with varying levels of access and permissions.
-   **Customizable Dashboards:** Allow owners to customize their dashboard layout and choose which KPIs to display.
-   **Audit Logs:** Implement detailed audit logs for all owner actions to enhance security and accountability.
-   **AI Model Training:** Provide tools for owners to train custom AI models based on their specific platform data and use cases.
-   **Notification Preferences:** A dedicated settings page where owners can toggle which notifications they want to receive and how they want to receive them (e.g., "Send me an email for high-severity alerts, but only a push notification for new tenant sign-ups").   
-   **Tenant Data Visibility:** A setting that allows owners to respect tenant privacy while keeping essential data visible. For example, an owner might choose to hide individual user activity logs but keep overall usage statistics visible. This fosters trust while keeping owners informed on essential matters.

-   **Integration with External BI Tools:** Allow owners to export data or connect with external business intelligence tools for deeper analysis.
-   **Mobile Optimization:** Ensure the Owner Dashboard is fully responsive and optimized for mobile devices, allowing owners to manage the platform on-the-go.
---