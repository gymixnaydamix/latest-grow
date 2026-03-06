/* ─── User Management — shared components, types, constants ─── */
import { useState } from 'react';
import {
  Edit2, X, Check, UserPlus, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useCreateUser, useUpdateUser, useBulkUpdateRole,
  type UserRecord, type UserRole,
} from '@/hooks/api';

/* ══════════════════════════════════════════════════════════════════
 * Role color map
 * ══════════════════════════════════════════════════════════════════ */
export const ROLE_CONFIG: Record<UserRole, { color: string; bg: string; border: string; label: string }> = {
  PROVIDER:  { color: 'text-purple-300', bg: 'bg-purple-500/20', border: 'border-purple-500/30', label: 'Provider' },
  ADMIN:     { color: 'text-blue-300',   bg: 'bg-blue-500/20',   border: 'border-blue-500/30',   label: 'Admin' },
  FINANCE:   { color: 'text-emerald-300',bg: 'bg-emerald-500/20',border: 'border-emerald-500/30', label: 'Finance' },
  MARKETING: { color: 'text-pink-300',   bg: 'bg-pink-500/20',   border: 'border-pink-500/30',   label: 'Marketing' },
  SCHOOL:    { color: 'text-amber-300',  bg: 'bg-amber-500/20',  border: 'border-amber-500/30',  label: 'School' },
  TEACHER:   { color: 'text-cyan-300',   bg: 'bg-cyan-500/20',   border: 'border-cyan-500/30',   label: 'Teacher' },
  STUDENT:   { color: 'text-indigo-300', bg: 'bg-indigo-500/20', border: 'border-indigo-500/30', label: 'Student' },
  PARENT:    { color: 'text-orange-300', bg: 'bg-orange-500/20', border: 'border-orange-500/30', label: 'Parent' },
};

export const ALL_ROLES: UserRole[] = ['PROVIDER', 'ADMIN', 'FINANCE', 'MARKETING', 'SCHOOL', 'TEACHER', 'STUDENT', 'PARENT'];

/* ══════════════════════════════════════════════════════════════════
 * 3D Icons
 * ══════════════════════════════════════════════════════════════════ */
export function Icon3D_Users() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(99,102,241,.35))' }}>
      <defs>
        <linearGradient id="usrmgmt3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <radialGradient id="usrmgmtShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#usrmgmt3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#usrmgmtShine)" />
      <g transform="translate(10,11)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="4" r="4" /><path d="M0 16c0-4 3-7 7-7s7 3 7 7" /><circle cx="16" cy="5" r="3" /><path d="M20 16c0-3.5-2.5-6-5-6" />
      </g>
    </svg>
  );
}

export function Icon3D_Stats() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,.35))' }}>
      <defs>
        <linearGradient id="stat3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <radialGradient id="statShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#stat3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#statShine)" />
      <g transform="translate(10,10)" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <rect x="0" y="10" width="5" height="10" rx="1" fill="white" opacity="0.7" />
        <rect x="8" y="5" width="5" height="15" rx="1" fill="white" opacity="0.85" />
        <rect x="16" y="0" width="5" height="20" rx="1" fill="white" />
      </g>
    </svg>
  );
}

export function Icon3D_Shield() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(168,85,247,.35))' }}>
      <defs>
        <linearGradient id="usrshield3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="usrshieldShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#usrshield3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#usrshieldShine)" />
      <g transform="translate(12,10)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 0L0 4v5c0 5.5 3.4 10.6 8 12 4.6-1.4 8-6.5 8-12V4L8 0z" /><path d="M5 10l2 2 4-4" />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Role Badge component
 * ══════════════════════════════════════════════════════════════════ */
export function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.STUDENT;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.bg.replace('/20', '/80')}`} />
      {cfg.label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Avatar helper
 * ══════════════════════════════════════════════════════════════════ */
export function UserAvatar({ user, size = 'md' }: { user: UserRecord; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
  const cfg = ROLE_CONFIG[user.role];
  if (user.avatar) {
    return <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className={`${sizeClass} rounded-full object-cover ring-2 ring-white/10`} />;
  }
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold ${cfg.bg} ${cfg.color} ring-2 ring-white/10`}>
      {initials}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Create / Edit Modal
 * ══════════════════════════════════════════════════════════════════ */
interface UserModalProps {
  user?: UserRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

export function UserModal({ user, onClose, onSaved }: UserModalProps) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    email: user?.email ?? '',
    password: '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    role: (user?.role ?? 'STUDENT') as UserRole,
    isActive: user?.isActive ?? true,
  });
  const [validationError, setValidationError] = useState('');

  const { mutate: createUser, loading: creating } = useCreateUser();
  const { mutate: updateUser, loading: updating } = useUpdateUser();

  const handleSubmit = async () => {
    setValidationError('');
    if (!form.email || !form.firstName || !form.lastName) {
      setValidationError('Email, first name, and last name are required.');
      return;
    }
    if (!isEdit && form.password.length < 8) {
      setValidationError('Password must be at least 8 characters.');
      return;
    }
    try {
      if (isEdit) {
        const body: any = { firstName: form.firstName, lastName: form.lastName, role: form.role, isActive: form.isActive, email: form.email };
        if (form.password) body.password = form.password;
        await updateUser(body, `/${user!.id}`);
      } else {
        await createUser({ ...form });
      }
      onSaved();
      onClose();
    } catch {
      setValidationError('Operation failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-linear-to-br from-white/8 to-white/2 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {isEdit ? <Edit2 className="w-5 h-5 text-blue-400" /> : <UserPlus className="w-5 h-5 text-emerald-400" />}
            <h2 className="text-lg font-semibold text-white/90">{isEdit ? 'Edit User' : 'Create New User'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">First Name</label>
              <Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" placeholder="John" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Last Name</label>
              <Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Email</label>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" placeholder="john@example.com" />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">{isEdit ? 'New Password (leave blank to keep)' : 'Password'}</label>
            <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="bg-white/5 border-white/10 text-white placeholder:text-white/30" placeholder={isEdit ? '••••••••' : 'Min 8 characters'} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Role</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {ALL_ROLES.map(r => (
                  <option key={r} value={r} className="bg-gray-900 text-white">{ROLE_CONFIG[r].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Status</label>
              <button
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`w-full h-9 px-3 rounded-md border text-sm font-medium transition-all ${
                  form.isActive
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/20 border-red-500/30 text-red-300'
                }`}
              >
                {form.isActive ? '● Active' : '○ Inactive'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose} className="text-white/60 hover:text-white/80">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={creating || updating}
            className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25"
          >
            {creating || updating ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isEdit ? 'Saving...' : 'Creating...'}</span>
            ) : (
              <span className="flex items-center gap-2"><Check className="w-4 h-4" />{isEdit ? 'Save Changes' : 'Create User'}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Bulk Role Modal
 * ══════════════════════════════════════════════════════════════════ */
export function BulkRoleModal({ ids, onClose, onDone }: { ids: string[]; onClose: () => void; onDone: () => void }) {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const { mutate, loading } = useBulkUpdateRole();

  const handleApply = async () => {
    await mutate({ ids, role });
    onDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 bg-linear-to-br from-white/8 to-white/2 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Icon3D_Shield />
          <div>
            <h3 className="text-lg font-semibold text-white/90">Assign Role</h3>
            <p className="text-xs text-white/50">{ids.length} user(s) selected</p>
          </div>
        </div>
        <select
          value={role}
          onChange={e => setRole(e.target.value as UserRole)}
          className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          {ALL_ROLES.map(r => (
            <option key={r} value={r} className="bg-gray-900 text-white">{ROLE_CONFIG[r].label}</option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-white/60">Cancel</Button>
          <Button onClick={handleApply} disabled={loading} className="bg-linear-to-r from-purple-600 to-indigo-600 text-white">
            {loading ? 'Applying...' : 'Apply Role'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
 * Role permission data
 * ══════════════════════════════════════════════════════════════════ */
export const ROLE_PERMISSIONS: Record<UserRole, { permissions: string[]; desc: string }> = {
  PROVIDER:  { desc: 'Full platform access \u2014 super-admin', permissions: ['All Permissions', 'Platform Settings', 'Billing Management', 'User Management', 'Tenant Mgmt'] },
  ADMIN:     { desc: 'School admin \u2014 manages school operations', permissions: ['School Settings', 'Staff/Student Mgmt', 'Academics', 'Finance', 'Facilities'] },
  FINANCE:   { desc: 'Finance dashboard \u2014 reports, billing', permissions: ['Financial Reports', 'Billing Config', 'Expense Tracking', 'Budget Management'] },
  MARKETING: { desc: 'Marketing campaigns & analytics', permissions: ['Campaigns', 'Analytics', 'Social Media', 'Email Templates', 'Lead Tracking'] },
  SCHOOL:    { desc: 'School leader \u2014 academic oversight', permissions: ['Academic Reports', 'Teacher Mgmt', 'Curriculum', 'Parent Comms'] },
  TEACHER:   { desc: 'Classroom management & grading', permissions: ['My Classes', 'Gradebook', 'Lesson Plans', 'Attendance', 'Parent Comms'] },
  STUDENT:   { desc: 'Student access \u2014 courses, grades, tools', permissions: ['My Courses', 'Gradebook (view)', 'Wellness', 'Tools', 'Communication'] },
  PARENT:    { desc: 'Parent portal \u2014 child overview', permissions: ['Child Dashboard', 'Grades (view)', 'Communication', 'Fee Payments', 'Calendar'] },
};
