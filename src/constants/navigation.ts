/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * NAVIGATION CONFIG  â€” Maps every role's Right Sidebar â†’ Header â†’ Left Sub-nav
 * Derived 1:1 from the wireframe docs (owner, admin, teacher, student)
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

import {
  Home, GraduationCap, Calculator, Briefcase, MessageSquare,
  Sparkles, Heart, Wrench, SquarePlus, Settings,
  LayoutDashboard, BarChart3, TrendingUp, Monitor,
  Users, CreditCard, Building, Mail, Share2, Globe, FileText, Cog,
  BookOpen, Calendar, ClipboardList, Library, LineChart,
  Map, FolderOpen, Send, DollarSign,
  ShieldCheck, Key, PaintBucket, Shield,
  UserPlus, Megaphone, PieChart, LayoutGrid,
  Code, Gauge, Layers, Film, Truck, Flag, Plug,
  Inbox, CheckSquare, AlertTriangle, Clock,
  FileCheck, Receipt, Wallet, Bus, School,
  Archive, Eye, Activity, Hammer,
  BadgeCheck, FolderSearch, Scale,
  HelpCircle, Trophy, Bell,
  Brain, Timer, FlaskConical,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { isParentPortalV2EnabledByDefault } from '@/config/parentPortalFlags';
import { providerConsoleNav } from '@/constants/provider-navigation';

/* â”€â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export interface SubNavItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  path?: string;
}

export interface HeaderItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  path?: string;
  subNav?: SubNavItem[];
}

export interface SidebarSection {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  path?: string;
  headerItems: HeaderItem[];
}

export interface RoleNavConfig {
  role: string;
  sections: SidebarSection[];
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * OWNER / PROVIDER
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const ownerNav: RoleNavConfig = {
  role: 'PROVIDER',
  sections: [
    {
      id: 'dashboard', label: 'Dashboard', icon: Home,
      description: 'Platform-wide KPIs and alerts',
      headerItems: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'market', label: 'Market', icon: TrendingUp },
        { id: 'system', label: 'System', icon: Monitor },
      ],
    },
    {
      id: 'school', label: 'Tenant Mgt', icon: GraduationCap,
      description: 'Manage tenants, billing plans, invoices',
      headerItems: [
        {
          id: 'tenants', label: 'Tenants', icon: Building,
          subNav: [
            { id: 'schools', label: 'Schools' },
            { id: 'individuals', label: 'Individuals' },
          ],
        },
        {
          id: 'platform_billing', label: 'Platform Billing', icon: CreditCard,
          subNav: [
            { id: 'plans', label: 'Plans' },
            { id: 'invoices', label: 'Invoices' },
            { id: 'gateways', label: 'Gateways' },
          ],
        },
      ],
    },
    {
      id: 'crm', label: 'Platform CRM', icon: Calculator,
      description: 'Sales pipeline, tenant accounts',
      headerItems: [
        { id: 'sales_pipeline', label: 'Sales Pipeline', icon: TrendingUp },
        { id: 'tenant_accounts', label: 'Tenant Accounts', icon: Users },
      ],
    },
    {
      id: 'tool_platform', label: 'Tool-Platform', icon: Briefcase,
      description: 'Platform integrations and API access',
      headerItems: [
        {
          id: 'integrations', label: 'Integrations', icon: Layers,
          subNav: [
            { id: 'marketplace', label: 'Marketplace' },
            { id: 'my_integrations', label: 'My Integrations' },
          ],
        },
        {
          id: 'api_access', label: 'API Access', icon: Key,
          subNav: [
            { id: 'keys', label: 'Keys' },
            { id: 'logs', label: 'Logs' },
          ],
        },
      ],
    },
    {
      id: 'communication', label: 'Communication', icon: MessageSquare,
      description: 'Platform-wide communication tools',
      headerItems: [
        {
          id: 'email', label: 'Email', icon: Mail,
          subNav: [
            { id: 'compose', label: 'Compose' },
            { id: 'inbox', label: 'Inbox' },
            { id: 'starred', label: 'Starred' },
          ],
        },
        { id: 'social_media', label: 'Social-Media', icon: Share2 },
        { id: 'community', label: 'Community', icon: Globe },
        { id: 'templates', label: 'Templates', icon: FileText },
        {
          id: 'management', label: 'Management', icon: Cog,
          subNav: [
            { id: 'email_mgmt', label: 'Email' },
            { id: 'social_mgmt', label: 'Social-Media' },
            { id: 'community_mgmt', label: 'Community' },
          ],
        },
      ],
    },
    {
      id: 'concierge_ai', label: 'Concierge AI', icon: Sparkles,
      description: 'Configure, train, operate the AI assistant',
      headerItems: [
        { id: 'assistant', label: 'Assistant', icon: Sparkles },
        { id: 'ai_analytics', label: 'Analytics', icon: BarChart3 },
        {
          id: 'operations', label: 'Operations', icon: Gauge,
          subNav: [
            { id: 'system_health', label: 'System Health' },
            { id: 'tenant_ai', label: 'Tenant Management' },
            { id: 'support', label: 'Support' },
          ],
        },
        {
          id: 'development', label: 'Development', icon: Code,
          subNav: [
            { id: 'code_gen', label: 'Code Gen' },
            { id: 'db_schema', label: 'DB Schema' },
            { id: 'log_analysis', label: 'Log Analysis' },
            { id: 'add_component', label: 'Add Component' },
            { id: 'modify_component', label: 'Modify Component' },
            { id: 'manage_deps', label: 'Manage Deps' },
            { id: 'create_api', label: 'Create API' },
            { id: 'project_enhancer', label: 'Project Enhancer' },
          ],
        },
        {
          id: 'ai_settings', label: 'Settings', icon: Settings,
          subNav: [
            { id: 'configuration', label: 'Configuration' },
            { id: 'data_sources', label: 'Data Sources' },
            { id: 'usage', label: 'Usage' },
            { id: 'training', label: 'Training' },
          ],
        },
      ],
    },
    {
      id: 'wellness', label: 'Wellness', icon: Heart,
      description: 'Wellness features across the platform',
      headerItems: [{ id: 'wellness_overview', label: 'Overview', icon: Heart }],
    },
    {
      id: 'tools', label: 'Tools', icon: Wrench,
      description: 'Productivity tools overview',
      headerItems: [{ id: 'tools_overview', label: 'Overview', icon: Wrench }],
    },
    {
      id: 'overlay_setting', label: 'Overlay-Setting', icon: SquarePlus,
      description: 'Manage overlay applications',
      headerItems: [
        {
          id: 'overlay_management', label: 'Management', icon: LayoutGrid,
          subNav: [
            { id: 'studio', label: 'Studio' },
            { id: 'media', label: 'Media' },
            { id: 'gamification', label: 'Gamification' },
            { id: 'leisure', label: 'Leisure' },
            { id: 'market_overlay', label: 'Market' },
            { id: 'lifestyle', label: 'Lifestyle' },
            { id: 'hobbies', label: 'Hobbies' },
            { id: 'knowledge', label: 'Knowledge' },
            { id: 'sports', label: 'Sports' },
            { id: 'religion', label: 'Religion' },
            { id: 'services', label: 'Services' },
          ],
        },
      ],
    },
    {
      id: 'user_management', label: 'User Management', icon: Users,
      description: 'Manage platform users, roles, bulk actions',
      headerItems: [
        {
          id: 'all_users', label: 'All Users', icon: Users,
          subNav: [
            { id: 'table_view', label: 'Table View' },
            { id: 'grid_view', label: 'Grid View' },
          ],
        },
        {
          id: 'roles', label: 'Roles', icon: Shield,
          subNav: [
            { id: 'role_overview', label: 'Overview' },
            { id: 'role_assignment', label: 'Assignment' },
          ],
        },
        {
          id: 'bulk_ops', label: 'Bulk Actions', icon: Layers,
          subNav: [
            { id: 'bulk_import', label: 'Import' },
            { id: 'bulk_export', label: 'Export' },
          ],
        },
      ],
    },
    {
      id: 'setting', label: 'Platform Settings', icon: Settings,
      description: 'Feature flags, security, legal',
      headerItems: [
        {
          id: 'platform_config', label: 'Configuration', icon: Cog,
          subNav: [
            { id: 'general', label: 'General' },
            { id: 'branding', label: 'Branding' },
            { id: 'notifications', label: 'Notifications' },
          ],
        },
        {
          id: 'feature_flags', label: 'Feature Flags', icon: Flag,
          subNav: [
            { id: 'active_flags', label: 'Active' },
            { id: 'archived_flags', label: 'Archived' },
            { id: 'ab_tests', label: 'A/B Tests' },
          ],
        },
        {
          id: 'platform_integrations', label: 'Integrations', icon: Plug,
          subNav: [
            { id: 'connections', label: 'Connections' },
            { id: 'webhooks', label: 'Webhooks' },
            { id: 'api_keys', label: 'API Keys' },
          ],
        },
        {
          id: 'security_access', label: 'Security', icon: ShieldCheck,
          subNav: [
            { id: 'authentication', label: 'Authentication' },
            { id: 'roles_permissions', label: 'Roles & Permissions' },
            { id: 'ip_rules', label: 'IP Rules' },
            { id: 'audit_log', label: 'Audit Log' },
          ],
        },
        {
          id: 'legal', label: 'Legal', icon: FileText,
          subNav: [
            { id: 'policies', label: 'Policies' },
            { id: 'data_processing', label: 'Data Processing' },
            { id: 'compliance', label: 'Compliance' },
          ],
        },
      ],
    },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * SCHOOL ADMIN  â€” Real School Management Operations Platform
 * 14 modules: Control Center, Admissions, Students, Academics,
 * Attendance, Exams, Finance, Staff, Communication, Transport,
 * Facilities, Reports, Settings, Audit & Compliance
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const adminNav: RoleNavConfig = {
  role: 'ADMIN',
  sections: [
    /* 1 â”€ Control Center (default landing) */
    {
      id: 'control_center', label: 'Control Center', icon: LayoutDashboard,
      description: 'Operations inbox, approvals, today\'s snapshot',
      headerItems: [
        { id: 'action_inbox', label: 'Action Inbox', icon: Inbox },
        { id: 'today_snapshot', label: 'Today', icon: Activity },
        { id: 'approvals', label: 'Approvals', icon: CheckSquare },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'issues', label: 'Issues', icon: AlertTriangle },
      ],
    },
    /* 2 â”€ Admissions */
    {
      id: 'admissions', label: 'Admissions', icon: UserPlus,
      description: 'Applications, pipeline, enrollment',
      headerItems: [
        { id: 'adm_pipeline', label: 'Pipeline', icon: TrendingUp },
        { id: 'adm_applications', label: 'Applications', icon: FileText },
        { id: 'adm_documents', label: 'Documents', icon: FileCheck },
        { id: 'adm_interviews', label: 'Interviews', icon: Calendar },
        { id: 'adm_waitlist', label: 'Waitlist', icon: Clock },
        { id: 'adm_enrollment', label: 'Enrollment', icon: BadgeCheck },
      ],
    },
    /* 3 â”€ Students */
    {
      id: 'students', label: 'Students', icon: GraduationCap,
      description: 'Student records, profiles, status management',
      headerItems: [
        { id: 'stu_directory', label: 'Directory', icon: Users },
        {
          id: 'stu_profiles', label: 'Profiles', icon: FolderOpen,
          subNav: [
            { id: 'personal', label: 'Personal Info' },
            { id: 'guardians', label: 'Guardians' },
            { id: 'academics', label: 'Academics' },
            { id: 'health', label: 'Health Notes' },
            { id: 'documents', label: 'Documents' },
            { id: 'timeline', label: 'Activity Log' },
          ],
        },
        { id: 'stu_transfers', label: 'Transfers', icon: Send },
        { id: 'stu_disciplinary', label: 'Disciplinary', icon: Shield },
      ],
    },
    /* 4 â”€ Academics */
    {
      id: 'academics', label: 'Academics', icon: BookOpen,
      description: 'Academic structure, classes, curriculum',
      headerItems: [
        { id: 'acad_years', label: 'Academic Years', icon: Calendar },
        { id: 'acad_classes', label: 'Classes', icon: School },
        { id: 'acad_subjects', label: 'Subjects', icon: BookOpen },
        { id: 'acad_teachers', label: 'Teacher Assign', icon: ClipboardList },
        { id: 'acad_timetable', label: 'Timetable', icon: Clock },
        { id: 'acad_promotion', label: 'Promotion', icon: TrendingUp },
      ],
    },
    /* 5 â”€ Attendance */
    {
      id: 'attendance', label: 'Attendance', icon: ClipboardList,
      description: 'Attendance monitoring, corrections, reports',
      headerItems: [
        { id: 'att_overview', label: 'Overview', icon: Eye },
        { id: 'att_daily', label: 'Daily Records', icon: Calendar },
        { id: 'att_exceptions', label: 'Exceptions', icon: AlertTriangle },
        { id: 'att_corrections', label: 'Corrections', icon: FileCheck },
        { id: 'att_staff', label: 'Staff Attendance', icon: Users },
      ],
    },
    /* 6 â”€ Exams & Results */
    {
      id: 'exams', label: 'Exams & Results', icon: FileText,
      description: 'Exam scheduling, grading, report cards',
      headerItems: [
        { id: 'exam_schedule', label: 'Schedule', icon: Calendar },
        { id: 'exam_gradebook', label: 'Gradebook', icon: ClipboardList },
        { id: 'exam_missing', label: 'Missing Marks', icon: AlertTriangle },
        { id: 'exam_results', label: 'Results', icon: BarChart3 },
        { id: 'exam_reports', label: 'Report Cards', icon: FileText },
      ],
    },
    /* 7 â”€ Finance */
    {
      id: 'finance', label: 'Finance', icon: Wallet,
      description: 'Fees, invoices, payments, reconciliation',
      headerItems: [
        { id: 'fin_overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'fin_invoices', label: 'Invoices', icon: Receipt },
        { id: 'fin_payments', label: 'Payments', icon: CreditCard },
        { id: 'fin_fees', label: 'Fee Structures', icon: DollarSign },
        { id: 'fin_discounts', label: 'Discounts', icon: BadgeCheck },
        { id: 'fin_overdue', label: 'Overdue', icon: AlertTriangle },
      ],
    },
    /* 8 â”€ Staff & HR */
    {
      id: 'staff', label: 'Staff & HR', icon: Users,
      description: 'Staff profiles, leave, payroll, permissions',
      headerItems: [
        { id: 'hr_directory', label: 'Directory', icon: Users },
        { id: 'hr_leave', label: 'Leave Requests', icon: Calendar },
        { id: 'hr_departments', label: 'Departments', icon: Building },
        { id: 'hr_payroll', label: 'Payroll', icon: Wallet },
        { id: 'hr_onboarding', label: 'Onboarding', icon: UserPlus },
        { id: 'hr_documents', label: 'Documents', icon: FileText },
      ],
    },
    /* 9 â”€ Communication */
    {
      id: 'communication', label: 'Communication', icon: MessageSquare,
      description: 'Announcements, messages, campaigns',
      headerItems: [
        { id: 'comm_inbox', label: 'Inbox', icon: Inbox },
        { id: 'comm_announcements', label: 'Announcements', icon: Megaphone },
        { id: 'comm_broadcast', label: 'Broadcast', icon: Send },
        { id: 'comm_templates', label: 'Templates', icon: FileText },
        { id: 'comm_logs', label: 'Delivery Logs', icon: Eye },
      ],
    },
    /* 10 â”€ Transport */
    {
      id: 'transport', label: 'Transport', icon: Bus,
      description: 'Vehicles, routes, drivers, assignments',
      headerItems: [
        { id: 'trn_routes', label: 'Routes', icon: Map },
        { id: 'trn_vehicles', label: 'Vehicles', icon: Truck },
        { id: 'trn_assignments', label: 'Assignments', icon: Users },
        { id: 'trn_incidents', label: 'Incidents', icon: AlertTriangle },
      ],
    },
    /* 11 â”€ Facilities */
    {
      id: 'facilities', label: 'Facilities', icon: Building,
      description: 'Rooms, maintenance, assets',
      headerItems: [
        { id: 'fac_rooms', label: 'Rooms', icon: LayoutGrid },
        { id: 'fac_maintenance', label: 'Maintenance', icon: Hammer },
        { id: 'fac_assets', label: 'Assets', icon: Archive },
        { id: 'fac_calendar', label: 'Availability', icon: Calendar },
      ],
    },
    /* 12 â”€ Reports */
    {
      id: 'reports', label: 'Reports', icon: PieChart,
      description: 'Analytics, KPIs, exports',
      headerItems: [
        { id: 'rpt_admissions', label: 'Admissions', icon: UserPlus },
        { id: 'rpt_finance', label: 'Finance', icon: DollarSign },
        { id: 'rpt_attendance', label: 'Attendance', icon: ClipboardList },
        { id: 'rpt_grades', label: 'Grades', icon: BarChart3 },
        { id: 'rpt_staff', label: 'Staff', icon: Users },
        { id: 'rpt_compliance', label: 'Compliance', icon: ShieldCheck },
      ],
    },
    /* 13 â”€ Settings */
    {
      id: 'settings', label: 'Settings', icon: Settings,
      description: 'School profile, grading, fees, roles',
      headerItems: [
        { id: 'set_school', label: 'School Profile', icon: School },
        { id: 'set_academic', label: 'Academic', icon: BookOpen },
        { id: 'set_grading', label: 'Grading', icon: BarChart3 },
        { id: 'set_fees', label: 'Fee Config', icon: DollarSign },
        { id: 'set_roles', label: 'Roles & Permissions', icon: Shield },
        { id: 'set_templates', label: 'Templates', icon: FileText },
        { id: 'set_branding', label: 'Branding', icon: PaintBucket },
      ],
    },
    /* 14 â”€ Audit & Compliance */
    {
      id: 'audit', label: 'Audit', icon: ShieldCheck,
      description: 'Audit log, compliance, data retention',
      headerItems: [
        { id: 'aud_log', label: 'Audit Log', icon: FolderSearch },
        { id: 'aud_approvals', label: 'Approval History', icon: CheckSquare },
        { id: 'aud_compliance', label: 'Compliance Tasks', icon: Scale },
        { id: 'aud_archive', label: 'Archive', icon: Archive },
      ],
    },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * TEACHER  â€” Premium Teaching Command Center (14 modules)
 * Action-first layout: right sidebar main nav, left contextual sub-nav
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const teacherNav: RoleNavConfig = {
  role: 'TEACHER',
  sections: [
    {
      id: 'today', label: 'Today', icon: Home,
      description: 'Teaching command center â€” schedule, actions, alerts',
      headerItems: [
        { id: 'command_center', label: 'Command Center', icon: LayoutDashboard },
      ],
    },
    {
      id: 'my_classes', label: 'My Classes', icon: BookOpen,
      description: 'Class workspaces, rosters, timetables',
      headerItems: [
        { id: 'class_list', label: 'All Classes', icon: BookOpen },
        { id: 'class_timetable', label: 'My Timetable', icon: Calendar },
      ],
    },
    {
      id: 'attendance', label: 'Attendance', icon: CheckSquare,
      description: 'Fast attendance â€” tap, swipe, keyboard',
      headerItems: [
        { id: 'take_attendance', label: 'Take Attendance', icon: CheckSquare },
        { id: 'attendance_history', label: 'History', icon: Clock },
        { id: 'attendance_reports', label: 'Reports', icon: BarChart3 },
      ],
    },
    {
      id: 'lessons', label: 'Lessons', icon: Layers,
      description: 'Lesson plans, resources, curriculum mapping',
      headerItems: [
        { id: 'lesson_calendar', label: 'Calendar', icon: Calendar },
        { id: 'create_lesson', label: 'Create Plan', icon: SquarePlus },
        { id: 'my_lessons', label: 'My Plans', icon: FolderOpen },
        { id: 'resource_library', label: 'Resources', icon: Library },
        { id: 'curriculum_map', label: 'Curriculum', icon: Map },
      ],
    },
    {
      id: 'assignments', label: 'Assignments', icon: FileText,
      description: 'Create, collect, track student work',
      headerItems: [
        { id: 'assignment_list', label: 'All Assignments', icon: FileText },
        { id: 'create_assignment', label: 'Create New', icon: SquarePlus },
        { id: 'submissions', label: 'Submissions', icon: Inbox },
      ],
    },
    {
      id: 'gradebook', label: 'Gradebook', icon: ClipboardList,
      description: 'Grade entry, mastery tracking, report cards',
      headerItems: [
        { id: 'grade_entry', label: 'Grade Entry', icon: ClipboardList },
        { id: 'mastery_view', label: 'Mastery View', icon: Trophy },
        { id: 'grade_reports', label: 'Reports', icon: BarChart3 },
        { id: 'comment_bank', label: 'Comment Bank', icon: MessageSquare },
      ],
    },
    {
      id: 'exams', label: 'Exams', icon: FileCheck,
      description: 'Exam schedules, marks entry, results',
      headerItems: [
        { id: 'exam_schedule', label: 'Schedule', icon: Calendar },
        { id: 'marks_entry', label: 'Marks Entry', icon: ClipboardList },
        { id: 'exam_results', label: 'Results', icon: BarChart3 },
      ],
    },
    {
      id: 'messages', label: 'Messages', icon: MessageSquare,
      description: 'Direct messages with parents, students, staff',
      headerItems: [
        { id: 'inbox', label: 'Inbox', icon: Inbox },
        { id: 'compose', label: 'Compose', icon: Send },
      ],
    },
    {
      id: 'announcements', label: 'Announce', icon: Megaphone,
      description: 'School & class announcements',
      headerItems: [
        { id: 'announcement_feed', label: 'Feed', icon: Bell },
        { id: 'create_announcement', label: 'Create', icon: SquarePlus },
      ],
    },
    {
      id: 'behavior', label: 'Behavior', icon: AlertTriangle,
      description: 'Behavior notes, incident tracking, praise',
      headerItems: [
        { id: 'behavior_log', label: 'Behavior Log', icon: AlertTriangle },
        { id: 'add_note', label: 'Add Note', icon: SquarePlus },
        { id: 'praise_board', label: 'Praise Board', icon: Trophy },
      ],
    },
    {
      id: 'meetings', label: 'Meetings', icon: Users,
      description: 'Parent conferences, staff meetings, office hours',
      headerItems: [
        { id: 'upcoming_meetings', label: 'Upcoming', icon: Calendar },
        { id: 'schedule_meeting', label: 'Schedule', icon: SquarePlus },
        { id: 'office_hours', label: 'Office Hours', icon: Clock },
      ],
    },
    {
      id: 'reports', label: 'Reports', icon: PieChart,
      description: 'Class analytics, student progress, insights',
      headerItems: [
        { id: 'class_analytics', label: 'Class Analytics', icon: BarChart3 },
        { id: 'student_progress', label: 'Student Progress', icon: LineChart },
        { id: 'at_risk', label: 'At-Risk', icon: AlertTriangle },
      ],
    },
    {
      id: 'profile_settings', label: 'Profile', icon: Settings,
      description: 'Profile, preferences, notification settings',
      headerItems: [
        { id: 'my_profile', label: 'My Profile', icon: Users },
        { id: 'preferences', label: 'Preferences', icon: Settings },
        { id: 'notification_settings', label: 'Notifications', icon: Bell },
      ],
    },
    {
      id: 'support', label: 'Support', icon: HelpCircle,
      description: 'Help center, submit tickets, FAQs',
      headerItems: [
        { id: 'help_center', label: 'Help Center', icon: HelpCircle },
        { id: 'submit_ticket', label: 'Submit Ticket', icon: Send },
      ],
    },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * STUDENT
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const studentNav: RoleNavConfig = {
  role: 'STUDENT',
  sections: [
    /* ── Dashboard ── */
    {
      id: 'dashboard', label: 'Dashboard', icon: Home,
      description: 'Today\'s schedule, tasks, deadlines',
      headerItems: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }],
    },
    /* ── Academics ── */
    {
      id: 'school', label: 'Academics', icon: GraduationCap,
      description: 'Courses, grades, assignments, study tools',
      headerItems: [
        {
          id: 'courses', label: 'Courses', icon: BookOpen,
          subNav: [
            { id: 'courses_overview', label: 'Overview' },
          ],
        },
        {
          id: 'grades_assignments', label: 'Grades & Assignments', icon: BarChart3,
          subNav: [
            { id: 'gradebook', label: 'Gradebook' },
            { id: 'upcoming', label: 'Upcoming' },
          ],
        },
        {
          id: 'ai_study_hub', label: 'AI Study Hub', icon: Brain,
          subNav: [
            { id: 'ai_tutor', label: 'AI Tutor' },
            { id: 'planner', label: 'Planner' },
            { id: 'visualizer', label: 'Visualizer' },
          ],
        },
        {
          id: 'learning_path', label: 'Learning Path', icon: Map,
          subNav: [
            { id: 'my_journey', label: 'My Journey' },
            { id: 'leaderboards', label: 'Leaderboards' },
          ],
        },
        {
          id: 'portfolio', label: 'Portfolio', icon: FolderOpen,
          subNav: [
            { id: 'my_skills', label: 'My Skills' },
            { id: 'showcase', label: 'Showcase' },
            { id: 'career_compass', label: 'Career Compass' },
          ],
        },
        {
          id: 'department_requests', label: 'Department Requests', icon: Building,
          subNav: [
            { id: 'dept_finance', label: 'Finance' },
            { id: 'dept_hr', label: 'Human Resources' },
            { id: 'dept_marketing', label: 'Marketing' },
            { id: 'dept_inquiries', label: 'Inquiries' },
          ],
        },
      ],
    },
    /* ── Wellness ── */
    {
      id: 'wellness', label: 'Wellness', icon: Heart,
      description: 'Mood tracking, journaling, goal setting',
      headerItems: [
        {
          id: 'mind_body', label: 'Mind & Body', icon: Heart,
          subNav: [
            { id: 'wellness_dashboard', label: 'Dashboard' },
            { id: 'resources', label: 'Resources' },
            { id: 'journal', label: 'Journal' },
            { id: 'goals', label: 'Goals' },
          ],
        },
      ],
    },
    /* ── Tools ── */
    {
      id: 'tools', label: 'Tools', icon: Wrench,
      description: 'Productivity apps and skill-building labs',
      headerItems: [
        {
          id: 'productivity', label: 'Productivity', icon: Timer,
          subNav: [
            { id: 'focus_timer', label: 'Focus Timer' },
            { id: 'mind_mapper', label: 'Mind Mapper' },
            { id: 'citation_generator', label: 'Citation Generator' },
          ],
        },
        {
          id: 'skill_labs', label: 'Skill Labs', icon: FlaskConical,
          subNav: [
            { id: 'debate_simulator', label: 'Debate Simulator' },
            { id: 'virtual_labs', label: 'Virtual Labs' },
            { id: 'ar_lab', label: 'AR Lab' },
            { id: 'finance_sim', label: 'Finance Sim' },
          ],
        },
      ],
    },
    /* ── Communication ── */
    {
      id: 'communication', label: 'Communication', icon: MessageSquare,
      description: 'Messages, email, community channels',
      headerItems: [
        {
          id: 'email', label: 'Email', icon: Mail,
          subNav: [
            { id: 'compose', label: 'Compose' },
            { id: 'inbox', label: 'Inbox' },
            { id: 'starred', label: 'Starred' },
          ],
        },
        {
          id: 'community', label: 'Community', icon: Users,
          subNav: [
            { id: 'general', label: 'General' },
            { id: 'community_announcements', label: 'Announcements' },
          ],
        },
      ],
    },
    /* ── Concierge AI ── */
    {
      id: 'concierge_ai', label: 'Concierge AI', icon: Sparkles,
      description: 'AI tutoring, research, writing assistance',
      headerItems: [{ id: 'assistant', label: 'Assistant', icon: Sparkles }],
    },
    /* ── Setting ── */
    {
      id: 'setting', label: 'Setting', icon: Settings,
      description: 'Profile, notifications, billing',
      headerItems: [
        {
          id: 'account', label: 'Account', icon: Settings,
          subNav: [
            { id: 'profile_settings', label: 'Profile' },
            { id: 'notification_settings', label: 'Notifications' },
            { id: 'billing_settings', label: 'Billing' },
          ],
        },
      ],
    },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PARENT
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const parentLegacyNav: RoleNavConfig = {
  role: 'PARENT',
  sections: [
    {
      id: 'dashboard', label: 'Dashboard', icon: Home,
      description: 'Child overview, daily digest',
      headerItems: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }],
    },
    {
      id: 'school', label: 'School', icon: GraduationCap,
      description: 'Academics, attendance, school life',
      headerItems: [
        {
          id: 'academics', label: 'Academics', icon: BookOpen,
          subNav: [
            { id: 'grades', label: 'Grades' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'schedule', label: 'Schedule' },
            { id: 'portfolio', label: 'Portfolio' },
          ],
        },
        { id: 'attendance', label: 'Attendance', icon: ClipboardList },
        {
          id: 'school_life', label: 'School Life', icon: Calendar,
          subNav: [
            { id: 'calendar', label: 'Calendar' },
            { id: 'lunch_menu', label: 'Lunch Menu' },
            { id: 'clubs', label: 'Clubs' },
            { id: 'directory', label: 'Directory' },
          ],
        },
      ],
    },
    {
      id: 'communication', label: 'Communication', icon: MessageSquare,
      description: 'Messages with teachers and school',
      headerItems: [
        { id: 'messages', label: 'Messages', icon: Mail },
        { id: 'feedback', label: 'Feedback', icon: Send },
        { id: 'volunteer', label: 'Volunteer', icon: Heart },
      ],
    },
    {
      id: 'finances', label: 'Finances', icon: Wallet,
      description: 'Billing, payments, and fees',
      headerItems: [
        { id: 'billing', label: 'Billing', icon: CreditCard },
      ],
    },
    {
      id: 'wellness', label: 'Wellness', icon: Activity,
      description: 'Mood tracking, goals, resources',
      headerItems: [
        { id: 'overview', label: 'Overview', icon: Activity },
      ],
    },
    {
      id: 'concierge_ai', label: 'Concierge AI', icon: Sparkles,
      description: 'AI support for parent queries',
      headerItems: [{ id: 'assistant', label: 'Assistant', icon: Sparkles }],
    },
    {
      id: 'setting', label: 'Setting', icon: Settings,
      description: 'Profile and preferences',
      headerItems: [
        {
          id: 'account', label: 'Account', icon: Settings,
          subNav: [
            { id: 'profile', label: 'Profile' },
            { id: 'notifications', label: 'Notifications' },
          ],
        },
      ],
    },
  ],
};

export const parentNav: RoleNavConfig = {
  role: 'PARENT',
  sections: [
    {
      id: 'family_home', label: 'Family Home', icon: Home,
      description: 'Family school control center with action-required queue',
      path: '/parent/home/overview',
      headerItems: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/parent/home/overview' },
        { id: 'action_required', label: 'Action Required', icon: AlertTriangle, path: '/parent/home/action-required' },
        { id: 'today_calendar', label: 'Today & Upcoming', icon: Calendar, path: '/parent/home/today' },
      ],
    },
    {
      id: 'my_children', label: 'My Children', icon: GraduationCap,
      description: 'Monitor each linked child profile and school activity',
      path: '/parent/children/profile/overview',
      headerItems: [
        {
          id: 'child_profiles', label: 'Child Profiles', icon: Users,
          path: '/parent/children/profile/overview',
          subNav: [
            { id: 'overview', label: 'Overview', path: '/parent/children/profile/overview' },
            { id: 'academics', label: 'Academics', path: '/parent/children/profile/academics' },
            { id: 'attendance', label: 'Attendance', path: '/parent/children/profile/attendance' },
            { id: 'timetable', label: 'Timetable', path: '/parent/children/profile/timetable' },
            { id: 'assignments', label: 'Assignments', path: '/parent/children/profile/assignments' },
            { id: 'exams', label: 'Exams', path: '/parent/children/profile/exams' },
            { id: 'finance', label: 'Finance', path: '/parent/children/profile/finance' },
            { id: 'transport', label: 'Transport', path: '/parent/children/profile/transport' },
            { id: 'documents', label: 'Documents', path: '/parent/children/profile/documents' },
            { id: 'timeline', label: 'Timeline', path: '/parent/children/profile/timeline' },
          ],
        },
        {
          id: 'student_services', label: 'Student Services', icon: Receipt,
          path: '/parent/children/services/lunch-menu',
          subNav: [
            { id: 'lunch_menu', label: 'Lunch Menu', path: '/parent/children/services/lunch-menu' },
            { id: 'cafeteria_account', label: 'Cafeteria Account', path: '/parent/children/services/cafeteria-account' },
          ],
        },
      ],
    },
    {
      id: 'timetable', label: 'Timetable', icon: Calendar,
      description: 'Daily and weekly class schedule by child',
      path: '/parent/timetable/weekly',
      headerItems: [{ id: 'weekly_timetable', label: 'Weekly View', icon: Calendar, path: '/parent/timetable/weekly' }],
    },
    {
      id: 'assignments', label: 'Assignments', icon: ClipboardList,
      description: 'Track due, missing, submitted, and graded work',
      path: '/parent/assignments/tracker/due-soon',
      headerItems: [
        {
          id: 'assignment_tracker', label: 'Assignment Tracker', icon: ClipboardList,
          path: '/parent/assignments/tracker/due-soon',
          subNav: [
            { id: 'due_soon', label: 'Due Soon', path: '/parent/assignments/tracker/due-soon' },
            { id: 'overdue', label: 'Overdue', path: '/parent/assignments/tracker/overdue' },
            { id: 'submitted', label: 'Submitted', path: '/parent/assignments/tracker/submitted' },
            { id: 'graded', label: 'Graded', path: '/parent/assignments/tracker/graded' },
          ],
        },
      ],
    },
    {
      id: 'exams', label: 'Exams', icon: FileText,
      description: 'Exam timetable, instructions, and result notices',
      path: '/parent/exams/planner',
      headerItems: [{ id: 'exam_planner', label: 'Exam Planner', icon: FileText, path: '/parent/exams/planner' }],
    },
    {
      id: 'grades_report_cards', label: 'Grades & Report Cards', icon: LineChart,
      description: 'View grades, teacher feedback, and report cards',
      path: '/parent/grades/gradebook',
      headerItems: [{ id: 'gradebook', label: 'Gradebook', icon: LineChart, path: '/parent/grades/gradebook' }],
    },
    {
      id: 'attendance', label: 'Attendance', icon: Clock,
      description: 'Attendance records, alerts, and absence explanation',
      path: '/parent/attendance/records',
      headerItems: [{ id: 'attendance_records', label: 'Records', icon: Clock, path: '/parent/attendance/records' }],
    },
    {
      id: 'messages', label: 'Messages', icon: MessageSquare,
      description: 'Threads with teachers and school administration',
      path: '/parent/messages/inbox',
      headerItems: [
        { id: 'inbox', label: 'Inbox', icon: Mail, path: '/parent/messages/inbox' },
        { id: 'compose', label: 'Compose', icon: Send, path: '/parent/messages/compose' },
      ],
    },
    {
      id: 'announcements', label: 'Announcements', icon: Megaphone,
      description: 'School notices, class updates, and urgent alerts',
      path: '/parent/announcements/feed',
      headerItems: [{ id: 'school_feed', label: 'School Feed', icon: Megaphone, path: '/parent/announcements/feed' }],
    },
    {
      id: 'fees_payments', label: 'Fees & Payments', icon: CreditCard,
      description: 'Invoices, payment history, receipts, and statements',
      path: '/parent/fees/billing/invoices',
      headerItems: [
        {
          id: 'billing_center', label: 'Billing Center', icon: CreditCard,
          path: '/parent/fees/billing/invoices',
          subNav: [
            { id: 'invoices', label: 'Invoices', path: '/parent/fees/billing/invoices' },
            { id: 'payments', label: 'Payments', path: '/parent/fees/billing/payments' },
            { id: 'receipts', label: 'Receipts', path: '/parent/fees/billing/receipts' },
          ],
        },
      ],
    },
    {
      id: 'approvals_forms', label: 'Approvals & Forms', icon: CheckSquare,
      description: 'Permission slips, consent forms, and acknowledgements',
      path: '/parent/approvals/pending',
      headerItems: [{ id: 'pending_approvals', label: 'Pending', icon: CheckSquare, path: '/parent/approvals/pending' }],
    },
    {
      id: 'transport', label: 'Transport', icon: Bus,
      description: 'Route assignment, timing updates, and delay notices',
      path: '/parent/transport/tracking',
      headerItems: [{ id: 'route_tracking', label: 'Route Tracking', icon: Bus, path: '/parent/transport/tracking' }],
    },
    {
      id: 'documents', label: 'Documents', icon: FolderOpen,
      description: 'Report cards, receipts, letters, and uploaded records',
      path: '/parent/documents/center',
      headerItems: [{ id: 'document_center', label: 'Document Center', icon: FolderOpen, path: '/parent/documents/center' }],
    },
    {
      id: 'events_meetings', label: 'Events & Meetings', icon: Calendar,
      description: 'School events, meetings, and RSVP actions',
      path: '/parent/events/calendar',
      headerItems: [
        { id: 'events_calendar', label: 'Events Calendar', icon: Calendar, path: '/parent/events/calendar' },
        { id: 'volunteer', label: 'Volunteer', icon: Heart, path: '/parent/events/volunteer' },
      ],
    },
    {
      id: 'profile_settings', label: 'Profile & Settings', icon: Settings,
      description: 'Contact details, notification preferences, privacy',
      path: '/parent/settings/preferences/profile',
      headerItems: [
        {
          id: 'preferences', label: 'Preferences', icon: Settings,
          path: '/parent/settings/preferences/profile',
          subNav: [
            { id: 'profile', label: 'Profile', path: '/parent/settings/preferences/profile' },
            { id: 'notifications', label: 'Notifications', path: '/parent/settings/preferences/notifications' },
            { id: 'security', label: 'Security', path: '/parent/settings/preferences/security' },
            { id: 'privacy', label: 'Privacy', path: '/parent/settings/preferences/privacy' },
            { id: 'daily_digest', label: 'Daily Digest', path: '/parent/settings/preferences/daily-digest' },
          ],
        },
      ],
    },
    {
      id: 'support', label: 'Support', icon: HelpCircle,
      description: 'FAQ, support tickets, and issue tracking',
      path: '/parent/support/tickets',
      headerItems: [
        {
          id: 'ticket_center', label: 'Ticket Center', icon: HelpCircle,
          path: '/parent/support/tickets',
          subNav: [
            { id: 'tickets', label: 'Tickets', path: '/parent/support/tickets' },
            { id: 'feedback', label: 'Feedback', path: '/parent/support/feedback' },
          ],
        },
      ],
    },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * FINANCE
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const financeNav: RoleNavConfig = {
  role: 'FINANCE',
  sections: [
    {
      id: 'dashboard', label: 'Dashboard', icon: Home,
      description: 'Financial overview and KPIs',
      headerItems: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      id: 'school', label: 'Finance', icon: CreditCard,
      description: 'Tuition, invoicing, payroll, budget',
      headerItems: [
        { id: 'tuition', label: 'Tuition', icon: DollarSign },
        { id: 'invoicing', label: 'Invoicing', icon: FileText },
        { id: 'payroll', label: 'Payroll', icon: Users },
        { id: 'budgets', label: 'Budgets', icon: PieChart },
        { id: 'grants', label: 'Grants', icon: Heart },
      ],
    },
    {
      id: 'concierge_ai', label: 'Concierge AI', icon: Sparkles,
      description: 'AI budget prediction tools',
      headerItems: [
        { id: 'assistant', label: 'Assistant', icon: Sparkles },
        { id: 'budget_predictor', label: 'Budget Predictor', icon: TrendingUp },
      ],
    },
    {
      id: 'setting', label: 'Setting', icon: Settings,
      description: 'Profile and preferences',
      headerItems: [
        {
          id: 'account', label: 'Account', icon: Settings,
          subNav: [
            { id: 'profile', label: 'Profile' },
            { id: 'notifications', label: 'Notifications' },
          ],
        },
      ],
    },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * MARKETING
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const marketingNav: RoleNavConfig = {
  role: 'MARKETING',
  sections: [
    {
      id: 'dashboard', label: 'Dashboard', icon: Home,
      description: 'Campaign metrics and leads',
      headerItems: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      id: 'school', label: 'Marketing', icon: Megaphone,
      description: 'Campaigns, leads, media',
      headerItems: [
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
        { id: 'leads', label: 'Lead Management', icon: Users },
        { id: 'media_hub', label: 'Media Hub', icon: Film },
        { id: 'ai_marketing', label: 'AI Marketing', icon: Sparkles },
      ],
    },
    {
      id: 'setting', label: 'Setting', icon: Settings,
      description: 'Profile and preferences',
      headerItems: [
        {
          id: 'account', label: 'Account', icon: Settings,
          subNav: [
            { id: 'profile', label: 'Profile' },
            { id: 'notifications', label: 'Notifications' },
          ],
        },
      ],
    },
  ],
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * SCHOOL LEADER
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const schoolLeaderNav: RoleNavConfig = {
  role: 'SCHOOL',
  sections: [
    {
      id: 'dashboard', label: 'Dashboard', icon: Home,
      description: 'Strategic overview',
      headerItems: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      id: 'school', label: 'School', icon: GraduationCap,
      description: 'Announcements, calendar, branding',
      headerItems: [
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'school_calendar', label: 'Calendar', icon: Calendar },
        { id: 'school_branding', label: 'Branding', icon: PaintBucket },
        { id: 'policy_generator', label: 'Policy Generator', icon: Shield },
        { id: 'strategic_goals', label: 'Strategic Goals', icon: TrendingUp },
        { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
      ],
    },
    {
      id: 'concierge_ai', label: 'Concierge AI', icon: Sparkles,
      description: 'AI planning and feedback analysis',
      headerItems: [
        { id: 'assistant', label: 'Assistant', icon: Sparkles },
        { id: 'community_feedback', label: 'Community Feedback AI', icon: BarChart3 },
      ],
    },
    {
      id: 'setting', label: 'Setting', icon: Settings,
      description: 'Profile and preferences',
      headerItems: [
        {
          id: 'account', label: 'Account', icon: Settings,
          subNav: [
            { id: 'profile', label: 'Profile' },
            { id: 'notifications', label: 'Notifications' },
          ],
        },
      ],
    },
  ],
};

/* â”€â”€â”€â”€ Role â†’ Config mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export const navigationByRole: Record<string, RoleNavConfig> = {
  PROVIDER: ownerNav,
  ADMIN: adminNav,
  TEACHER: teacherNav,
  STUDENT: studentNav,
  PARENT: parentNav,
  FINANCE: financeNav,
  MARKETING: marketingNav,
  SCHOOL: schoolLeaderNav,
};

export function getNavForRole(role: string): RoleNavConfig {
  if (role === 'PROVIDER') {
    return providerConsoleNav as unknown as RoleNavConfig;
  }
  if (role === 'PARENT') {
    return isParentPortalV2EnabledByDefault() ? parentNav : parentLegacyNav;
  }
  return navigationByRole[role] ?? studentNav;
}


