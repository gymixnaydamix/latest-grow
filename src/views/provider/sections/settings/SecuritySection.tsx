/* ─── SecuritySection ─── Authentication, Roles, IP Rules, Audit Log ── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Shield, Lock, Users, Globe, ScrollText, Plus, Trash2,
  ChevronLeft, ChevronRight, CheckCircle, AlertTriangle,
  ShieldCheck, ShieldAlert, Fingerprint,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useAuthSettings, useUpsertAuthSetting,
  usePlatformRoles, useCreateRole, useUpdateRole, useDeleteRole,
  useIpRules, useCreateIpRule, useDeleteIpRule,
  useAuditLog,
  type AuthSetting, type PlatformRole, type IpRule,
} from '@/hooks/api/use-settings';

/* ── 3D Icons ────────────────────────────────────────────────── */
function Icon3D_Shield() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(168,85,247,.35))' }}>
      <defs>
        <linearGradient id="shield3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="shieldShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#shield3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#shieldShine)" />
      <g transform="translate(12,10)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 0L0 4v5c0 5.5 3.4 10.6 8 12 4.6-1.4 8-6.5 8-12V4L8 0z" /><path d="M5 10l2 2 4-4" />
      </g>
    </svg>
  );
}

function Icon3D_Role() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(236,72,153,.35))' }}>
      <defs>
        <linearGradient id="role3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f472b6" /><stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <radialGradient id="roleShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#role3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#roleShine)" />
      <g transform="translate(10,11)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="4" r="4" /><path d="M0 16c0-4 3-7 7-7s7 3 7 7" /><circle cx="14" cy="5" r="3" /><path d="M20 16c0-3.5-2.5-6-5-6" />
      </g>
    </svg>
  );
}

function Icon3D_IP() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,.35))' }}>
      <defs>
        <linearGradient id="ip3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <radialGradient id="ipShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#ip3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#ipShine)" />
      <g transform="translate(10,10)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="9" /><path d="M1 10h18" /><path d="M10 1c2.8 2.8 4.4 6 4.4 9S12.8 17.2 10 19c-2.8-1.8-4.4-5-4.4-9S7.2 3.8 10 1z" />
      </g>
    </svg>
  );
}

function Icon3D_Audit() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(99,102,241,.35))' }}>
      <defs>
        <linearGradient id="audit3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <radialGradient id="auditShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#audit3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#auditShine)" />
      <g transform="translate(11,10)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 0h18v20H0V0z" /><path d="M4 5h10" /><path d="M4 9h7" /><path d="M4 13h10" />
      </g>
    </svg>
  );
}

/* ── Main Export ───────────────────────────────────────────────── */
export function SecuritySection() {
  const { activeSubNav } = useNavigationStore();
  const ref = useStaggerAnimate<HTMLDivElement>([activeSubNav]);

  const view = (() => {
    switch (activeSubNav) {
      case 'roles_permissions': return <RolesPermissionsView />;
      case 'ip_rules': return <IPRulesView />;
      case 'audit_log': return <AuditLogView />;
      default: return <AuthenticationView />;
    }
  })();

  return <div ref={ref} className="space-y-3 h-full overflow-y-auto pr-1">{view}</div>;
}

/* ════════════════════════════════════════════════════════════════
 * AUTHENTICATION VIEW
 * ════════════════════════════════════════════════════════════════ */

const defaultAuthSettings = [
  { key: 'mfa_required', label: 'Require MFA', description: 'Enforce multi-factor authentication for all users', category: 'mfa' },
  { key: 'mfa_methods', label: 'MFA Methods', description: 'Allowed methods: totp, sms, email', category: 'mfa' },
  { key: 'password_min_length', label: 'Min Password Length', description: 'Minimum characters for passwords', category: 'password' },
  { key: 'password_require_uppercase', label: 'Require Uppercase', description: 'Passwords must have uppercase letter', category: 'password' },
  { key: 'password_require_number', label: 'Require Number', description: 'Passwords must have a number', category: 'password' },
  { key: 'password_require_special', label: 'Require Special Char', description: 'Passwords must have special character', category: 'password' },
  { key: 'session_max_age', label: 'Session Timeout (min)', description: 'Auto-logout after N minutes of inactivity', category: 'session' },
  { key: 'login_attempts_limit', label: 'Max Login Attempts', description: 'Account lockout after N failures', category: 'session' },
  { key: 'sso_enabled', label: 'Enable SSO', description: 'Allow Single Sign-On via SAML/OIDC', category: 'sso' },
  { key: 'sso_provider', label: 'SSO Provider URL', description: 'Identity provider endpoint', category: 'sso' },
];

function AuthenticationView() {
  const { data: settings, loading, refetch } = useAuthSettings();
  const { mutate: upsertSetting } = useUpsertAuthSetting();

  const settingsMap: Record<string, string> = {};
  settings.forEach((s: AuthSetting) => { settingsMap[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value); });

  const handleUpdate = async (key: string, value: string, category: string) => {
    await upsertSetting({ key, value, category });
    refetch();
  };

  const grouped: Record<string, typeof defaultAuthSettings> = {};
  defaultAuthSettings.forEach((s) => {
    (grouped[s.category] ??= []).push(s);
  });

  const categoryLabels: Record<string, { label: string; icon: typeof Shield }> = {
    mfa: { label: 'Multi-Factor Auth', icon: Fingerprint },
    password: { label: 'Password Policy', icon: Lock },
    session: { label: 'Sessions', icon: ShieldCheck },
    sso: { label: 'Single Sign-On', icon: ShieldAlert },
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-purple-500/20 bg-linear-to-br from-purple-500/8 to-violet-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-purple-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Shield />
          <div>
            <h2 className="text-base font-bold tracking-tight">Authentication</h2>
            <p className="text-xs text-muted-foreground">MFA, password policies, sessions & SSO</p>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px]">{settings.length} configured</Badge>
        </div>
      </div>

      {/* Grouped settings */}
      {Object.entries(grouped).map(([cat, items]) => {
        const info = categoryLabels[cat] ?? { label: cat, icon: Shield };
        const Icon = info.icon;
        return (
          <div key={cat} data-animate className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground px-1">
              <Icon className="size-3.5" /> {info.label}
            </div>
            <div className="space-y-1">
              {items.map((item) => {
                const isToggle = item.key.startsWith('mfa_required') || item.key.startsWith('password_require') || item.key.startsWith('sso_enabled');
                const currentVal = settingsMap[item.key] ?? '';
                return (
                  <Card key={item.key} className="group border-border/60 transition-all duration-300 hover:border-purple-500/30 hover:shadow-sm">
                    <CardContent className="flex items-center gap-3 py-2.5 px-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{item.label}</p>
                        <p className="text-[9px] text-muted-foreground">{item.description}</p>
                      </div>
                      {isToggle ? (
                        <button
                          onClick={() => handleUpdate(item.key, currentVal === 'true' ? 'false' : 'true', item.category)}
                          className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${currentVal === 'true' ? 'bg-purple-500' : 'bg-muted/60'}`}
                        >
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${currentVal === 'true' ? 'left-4.5' : 'left-0.5'}`} />
                        </button>
                      ) : (
                        <Input
                          className="h-7 w-36 text-xs text-right"
                          value={currentVal}
                          onChange={() => {}}
                          onBlur={(e) => {
                            if (e.target.value !== currentVal) {
                              handleUpdate(item.key, e.target.value, item.category);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              handleUpdate(item.key, target.value, item.category);
                            }
                          }}
                          defaultValue={currentVal}
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
 * ROLES & PERMISSIONS VIEW
 * ════════════════════════════════════════════════════════════════ */

function RolesPermissionsView() {
  const { data: roles, loading, refetch } = usePlatformRoles();
  const { mutate: createRole, loading: creating } = useCreateRole();
  const { mutate: _updateRole } = useUpdateRole();
  const { mutate: deleteRole } = useDeleteRole();

  const [showCreate, setShowCreate] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', color: '#7c3aed', permissions: ['read'] as string[] });
  const [permInput, setPermInput] = useState('');

  const handleCreate = async () => {
    if (!newRole.name) return;
    const perms = [...newRole.permissions, ...permInput.split(',').map((s) => s.trim()).filter(Boolean)];
    await createRole({ ...newRole, permissions: [...new Set(perms)] });
    setNewRole({ name: '', description: '', color: '#7c3aed', permissions: ['read'] });
    setPermInput('');
    setShowCreate(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteRole(undefined, `/${id}`);
    refetch();
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-pink-500/20 bg-linear-to-br from-pink-500/8 to-rose-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-pink-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Role />
          <div>
            <h2 className="text-base font-bold tracking-tight">Roles & Permissions</h2>
            <p className="text-xs text-muted-foreground">Custom roles with fine-grained permissions</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{roles.length} roles</Badge>
            <Button size="sm" className="gap-1.5 bg-pink-500 hover:bg-pink-600" onClick={() => setShowCreate(true)}>
              <Plus className="size-3" /> New Role
            </Button>
          </div>
        </div>
      </div>

      {/* Create */}
      {showCreate && (
        <Card data-animate className="border-pink-500/30 bg-pink-500/5">
          <CardContent className="py-3 px-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><Users className="size-3 text-pink-500" /> Create Role</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Role name" className="h-7 text-xs" value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} />
              <Input placeholder="Description" className="h-7 text-xs" value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} />
              <div className="flex items-center gap-2">
                <input type="color" className="h-7 w-10 rounded border cursor-pointer" value={newRole.color} onChange={(e) => setNewRole({ ...newRole, color: e.target.value })} />
                <Input placeholder="Extra permissions (comma-separated)" className="h-7 text-xs flex-1" value={permInput} onChange={(e) => setPermInput(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-pink-500 hover:bg-pink-600 h-7 text-xs" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles List */}
      <div className="space-y-1.5" data-animate>
        {roles.map((role: PlatformRole) => (
          <Card key={role.id} className="group border-border/60 transition-all duration-300 hover:border-pink-500/30 hover:shadow-sm">
            <CardContent className="flex items-center gap-3 py-2.5 px-3">
              <div className="size-3 rounded-full shrink-0" style={{ backgroundColor: role.color || '#7c3aed' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold">{role.name}</p>
                  {role.isSystem && <Badge variant="secondary" className="text-[8px]">System</Badge>}
                </div>
                <p className="text-[9px] text-muted-foreground">{role.description || 'No description'}</p>
              </div>
              <div className="flex flex-wrap gap-0.5 max-w-40">
                {role.permissions.slice(0, 4).map((p) => (
                  <Badge key={p} variant="outline" className="text-[8px]">{p}</Badge>
                ))}
                {role.permissions.length > 4 && <Badge variant="outline" className="text-[8px]">+{role.permissions.length - 4}</Badge>}
              </div>
              <span className="text-[9px] text-muted-foreground hidden sm:block">{role.userCount} users</span>
              {!role.isSystem && (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(role.id)}>
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
 * IP RULES VIEW
 * ════════════════════════════════════════════════════════════════ */

function IPRulesView() {
  const { data: rules, loading, refetch } = useIpRules();
  const { mutate: createRule, loading: creating } = useCreateIpRule();
  const { mutate: deleteRule } = useDeleteIpRule();

  const [showCreate, setShowCreate] = useState(false);
  const [newRule, setNewRule] = useState({ ip: '', label: '', type: 'whitelist' as string });

  const handleCreate = async () => {
    if (!newRule.ip) return;
    await createRule(newRule);
    setNewRule({ ip: '', label: '', type: 'whitelist' });
    setShowCreate(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteRule(undefined, `/${id}`);
    refetch();
  };

  const whitelist = rules.filter((r: IpRule) => r.type === 'whitelist');
  const blocklist = rules.filter((r: IpRule) => r.type === 'blocklist');

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/8 to-teal-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_IP />
          <div>
            <h2 className="text-base font-bold tracking-tight">IP Rules</h2>
            <p className="text-xs text-muted-foreground">Whitelist and blocklist management</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] text-emerald-500">{whitelist.length} allowed</Badge>
            <Badge variant="outline" className="text-[10px] text-red-500">{blocklist.length} blocked</Badge>
            <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600" onClick={() => setShowCreate(true)}>
              <Plus className="size-3" /> Add Rule
            </Button>
          </div>
        </div>
      </div>

      {/* Create */}
      {showCreate && (
        <Card data-animate className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="py-3 px-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><Globe className="size-3 text-emerald-500" /> New IP Rule</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input placeholder="IP address (e.g. 192.168.1.0/24)" className="h-7 text-xs font-mono" value={newRule.ip} onChange={(e) => setNewRule({ ...newRule, ip: e.target.value })} />
              <Input placeholder="Label" className="h-7 text-xs" value={newRule.label} onChange={(e) => setNewRule({ ...newRule, label: e.target.value })} />
              <select
                className="h-7 rounded-md border border-border/60 bg-muted/30 px-2 text-xs"
                value={newRule.type}
                onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
              >
                <option value="whitelist">Whitelist (allow)</option>
                <option value="blocklist">Blocklist (deny)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-7 text-xs" onClick={handleCreate} disabled={creating}>{creating ? 'Adding...' : 'Add Rule'}</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Whitelist */}
      {whitelist.length > 0 && (
        <div data-animate className="space-y-1.5">
          <p className="text-xs font-semibold flex items-center gap-1.5 px-1 text-emerald-500"><CheckCircle className="size-3" /> Allowed IPs</p>
          {whitelist.map((r: IpRule) => (
            <Card key={r.id} className="group border-border/60 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-sm">
              <CardContent className="flex items-center gap-3 py-2 px-3">
                <Globe className="size-3.5 text-emerald-500 shrink-0" />
                <code className="text-xs font-mono flex-1">{r.ip}</code>
                <span className="text-[9px] text-muted-foreground">{r.label}</span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Blocklist */}
      {blocklist.length > 0 && (
        <div data-animate className="space-y-1.5">
          <p className="text-xs font-semibold flex items-center gap-1.5 px-1 text-red-500"><AlertTriangle className="size-3" /> Blocked IPs</p>
          {blocklist.map((r: IpRule) => (
            <Card key={r.id} className="group border-border/60 transition-all duration-300 hover:border-red-500/30 hover:shadow-sm">
              <CardContent className="flex items-center gap-3 py-2 px-3">
                <Globe className="size-3.5 text-red-500 shrink-0" />
                <code className="text-xs font-mono flex-1">{r.ip}</code>
                <span className="text-[9px] text-muted-foreground">{r.label}</span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      )}

      {!loading && rules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Globe className="size-8 mb-2 opacity-30" />
          <p className="text-xs">No IP rules configured</p>
          <p className="text-[10px]">All IPs are currently allowed by default</p>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
 * AUDIT LOG VIEW
 * ════════════════════════════════════════════════════════════════ */

function AuditLogView() {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { data: entries, meta, loading } = useAuditLog(page, pageSize);

  const actionColors: Record<string, string> = {
    CREATE: 'text-emerald-500 bg-emerald-500/10',
    UPDATE: 'text-blue-500 bg-blue-500/10',
    DELETE: 'text-red-500 bg-red-500/10',
    LOGIN: 'text-amber-500 bg-amber-500/10',
    LOGOUT: 'text-slate-500 bg-slate-500/10',
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/8 to-blue-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-indigo-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Audit />
          <div>
            <h2 className="text-base font-bold tracking-tight">Audit Log</h2>
            <p className="text-xs text-muted-foreground">Full activity trail for security compliance</p>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px]">{meta.total} entries</Badge>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-1" data-animate>
        {entries.map((entry) => {
          const actionClass = actionColors[entry.action] ?? actionColors.UPDATE;
          return (
            <Card key={entry.id} className="border-border/60">
              <CardContent className="flex items-center gap-3 py-2 px-3">
                <Badge className={`text-[9px] shrink-0 ${actionClass}`}>{entry.action}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    <span className="font-medium">{entry.entity}</span>
                    <span className="text-muted-foreground"> #{entry.entityId?.slice(0, 8)}</span>
                  </p>
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && <p className="text-[9px] text-muted-foreground truncate">{JSON.stringify(entry.metadata)}</p>}
                </div>
                <span className="text-[9px] text-muted-foreground shrink-0 hidden sm:block">{entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'System'}</span>
                <span className="text-[9px] text-muted-foreground shrink-0 tabular-nums">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div data-animate className="flex items-center justify-center gap-3 py-2">
          <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="size-3" /> Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}>
            Next <ChevronRight className="size-3" />
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <ScrollText className="size-8 mb-2 opacity-30" />
          <p className="text-xs">No audit entries yet</p>
        </div>
      )}
    </>
  );
}
