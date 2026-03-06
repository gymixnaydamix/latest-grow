/* ─── ProviderTeamSection ─── Staff · Roles · Permissions · Shifts ─── */
import { useState } from 'react';
import { Calendar, Loader2, PlusCircle, Shield, SlidersHorizontal, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderModuleData,
  useProviderPermissionContext,
  useInviteProviderTeamMember,
  useRemoveProviderTeamMember,
  useCreateProviderRole,
  useUpdateProviderShift,
} from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, Row, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderTeamSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'team_staff':       return <StaffView />;
    case 'team_roles':       return <RolesView />;
    case 'team_permissions': return <PermissionMatrixView />;
    case 'team_shifts':      return <ShiftPlannerView />;
    default: return <StaffView />;
  }
}

function useTeamData() {
  const { data: moduleData } = useProviderModuleData();
  const { data: permCtx } = useProviderPermissionContext();
  const users = (moduleData?.providerUsers ?? []) as Array<Record<string, unknown>>;
  const roles = (moduleData?.providerRoles ?? []) as Array<Record<string, unknown>>;
  const currentUser = permCtx?.user as Record<string, unknown> | null;
  const roleName = (key: string) => {
    const r = roles.find((entry) => entry.key === key);
    return r ? String(r.name ?? r.key) : key;
  };
  const roleUserMap = new Map<string, Array<Record<string, unknown>>>();
  for (const user of users) {
    const rk = String(user.roleKey ?? '');
    if (!roleUserMap.has(rk)) roleUserMap.set(rk, []);
    roleUserMap.get(rk)!.push(user);
  }
  return { users, roles, currentUser, roleName, roleUserMap };
}

/* ── Staff Directory ── */
function StaffView() {
  const { users, roles, currentUser, roleName } = useTeamData();
  const accent = getAccent('provider_team');
  const invite = useInviteProviderTeamMember();
  const remove = useRemoveProviderTeamMember();
  const [showInvite, setShowInvite] = useState(false);
  const [invEmail, setInvEmail] = useState('');
  const [invFirst, setInvFirst] = useState('');
  const [invLast, setInvLast] = useState('');
  const [invRole, setInvRole] = useState('');

  const handleInvite = () => {
    const reason = reasonPrompt('Invite team member');
    if (!reason) return;
    invite.mutate({ email: invEmail, firstName: invFirst, lastName: invLast, roleKey: invRole, reason }, { onSuccess: () => { setShowInvite(false); setInvEmail(''); setInvFirst(''); setInvLast(''); setInvRole(''); } });
  };

  const handleRemove = (user: Record<string, unknown>) => {
    const reason = reasonPrompt(`Remove ${user.firstName} ${user.lastName}`);
    if (!reason) return;
    remove.mutate({ userId: String(user.id), reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Users} title="Staff Accounts" description="Provider team member directory" accent={accent} actions={
        <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={() => setShowInvite(true)}><PlusCircle className="mr-1 size-3" />Invite Member</Button>
      } />
      {showInvite && (
        <Panel title="Invite Team Member" accentBorder="border-blue-500/20">
          <div className="grid gap-2 md:grid-cols-2">
            <Input value={invFirst} onChange={(e) => setInvFirst(e.target.value)} placeholder="First name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Input value={invLast} onChange={(e) => setInvLast(e.target.value)} placeholder="Last name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Input value={invEmail} onChange={(e) => setInvEmail(e.target.value)} placeholder="Email address" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={invRole} onChange={(e) => setInvRole(e.target.value)}>
              <option value="">Select role…</option>
              {roles.map((r) => <option key={String(r.key)} value={String(r.key)}>{String(r.name ?? r.key)}</option>)}
            </select>
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={handleInvite} disabled={!invEmail.trim() || !invRole || invite.isPending}>
              {invite.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Send Invite
            </Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Staff" value={String(users.length)} sub="Team members" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Roles" value={String(roles.length)} sub="Defined" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Active" value={String(users.filter((u) => u.status === 'ACTIVE').length)} sub="Currently active" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="You" value={currentUser ? String(currentUser.name ?? currentUser.email ?? '—') : '—'} sub={currentUser ? String(currentUser.roleKey ?? '—') : '—'} gradient="from-sky-500/10 to-sky-500/5" />
      </div>
      <Panel title="Staff Directory">
        <div className="space-y-2">
          {users.map((user) => (
            <Row key={String(user.id ?? user.email)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-200">
                    {String(user.firstName ?? '').charAt(0)}{String(user.lastName ?? '').charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100">
                      {String(user.firstName ?? '')} {String(user.lastName ?? '')}
                      {String(user.email) === String(currentUser?.email ?? '') && (
                        <span className="ml-2 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] text-sky-300">You</span>
                      )}
                    </p>
                    <p className="text-slate-400">{String(user.email)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{roleName(String(user.roleKey ?? ''))}</span>
                  {user.mfaEnforced ? (
                    <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-300">MFA</span>
                  ) : (
                    <span className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] text-red-300">No MFA</span>
                  )}
                  <StatusBadge status={String(user.status ?? 'ACTIVE')} />
                  {String(user.email) !== String(currentUser?.email ?? '') && (
                    <Button size="sm" className="h-6 bg-red-500/20 text-red-100 hover:bg-red-500/30 text-[10px]" onClick={() => handleRemove(user)} disabled={remove.isPending}>
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Row>
          ))}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Roles ── */
function RolesView() {
  const { roles, roleUserMap, roleName } = useTeamData();
  const accent = getAccent('provider_team');
  const createRole = useCreateProviderRole();
  const [showNew, setShowNew] = useState(false);
  const [rName, setRName] = useState('');
  const [rKey, setRKey] = useState('');
  const [rPerms, setRPerms] = useState('');

  const handleCreate = () => {
    const reason = reasonPrompt('Create role');
    if (!reason) return;
    createRole.mutate({ name: rName, key: rKey, permissions: rPerms.split(',').map((s) => s.trim()).filter(Boolean), reason }, { onSuccess: () => { setShowNew(false); setRName(''); setRKey(''); setRPerms(''); } });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Shield} title="Role Management" description="Define and configure team roles" accent={accent} actions={
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />Create Role</Button>
      } />
      {showNew && (
        <Panel title="Create New Role" accentBorder="border-violet-500/20">
          <div className="grid gap-2 md:grid-cols-3">
            <Input value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Role name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Input value={rKey} onChange={(e) => setRKey(e.target.value)} placeholder="Role key (e.g. ADMIN)" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Input value={rPerms} onChange={(e) => setRPerms(e.target.value)} placeholder="Permissions (comma-sep)" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={handleCreate} disabled={!rName.trim() || !rKey.trim() || createRole.isPending}>
              {createRole.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create
            </Button>
          </div>
        </Panel>
      )}
      <Panel title="Role Distribution" subtitle={`${roles.length} roles defined`}>
        <div className="grid gap-2 md:grid-cols-2">
          {Array.from(roleUserMap.entries()).map(([rk, roleUsers]) => (
            <div key={rk} className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-slate-100">{roleName(rk)}</p>
                <span className="text-xs text-slate-400">{roleUsers.length} member{roleUsers.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {roleUsers.map((u) => (
                  <span key={String(u.email)} className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                    {String(u.firstName ?? '')} {String(u.lastName ?? '')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Permission Matrix ── */
function PermissionMatrixView() {
  const { roles } = useTeamData();
  const accent = getAccent('provider_team');
  const allPerms = new Set<string>();
  for (const role of roles) {
    if (Array.isArray(role.permissions)) (role.permissions as string[]).forEach((p) => allPerms.add(p));
  }
  return (
    <SectionShell>
      <SectionPageHeader icon={SlidersHorizontal} title="Permission Matrix" description="Cross-reference roles against permissions" accent={accent} />
      {roles.length === 0 ? (
        <EmptyState icon={SlidersHorizontal} title="No Roles" description="Define roles to see the permission matrix" />
      ) : (
        <Panel title="Matrix" subtitle={`${roles.length} roles × ${allPerms.size} permissions`}>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header */}
              <div className="grid gap-1 text-[10px] text-slate-400 font-semibold" style={{ gridTemplateColumns: `120px repeat(${allPerms.size}, 1fr)` }}>
                <div />
                {Array.from(allPerms).map((p) => (
                  <div key={p} className="truncate text-center px-1">{p}</div>
                ))}
              </div>
              {/* Rows */}
              {roles.map((role) => (
                <div key={String(role.key)} className="grid gap-1 text-[10px] border-t border-slate-800 py-1" style={{ gridTemplateColumns: `120px repeat(${allPerms.size}, 1fr)` }}>
                  <div className="font-semibold text-slate-100 truncate">{String(role.name ?? role.key)}</div>
                  {Array.from(allPerms).map((p) => (
                    <div key={p} className="flex justify-center">
                      {Array.isArray(role.permissions) && (role.permissions as string[]).includes(p) ? (
                        <span className="size-3 rounded-full bg-emerald-500/40" />
                      ) : (
                        <span className="size-3 rounded-full bg-slate-700/40" />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ── Shift Planner ── */
function ShiftPlannerView() {
  const { users } = useTeamData();
  const accent = getAccent('provider_team');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const states = ['ON_DUTY', 'ON_CALL', 'OFF'] as const;
  const stateColors: Record<string, string> = { ON_DUTY: 'bg-emerald-500/20', ON_CALL: 'bg-blue-500/20', OFF: 'bg-slate-800' };
  const updateShift = useUpdateProviderShift();

  // Local shift state derived from deterministic default
  const [shifts, setShifts] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    users.slice(0, 6).forEach((u, idx) => days.forEach((d, di) => { m[`${String(u.id)}-${d}`] = states[(idx + di) % 3]; }));
    return m;
  });

  const cycle = (userId: string, day: string) => {
    const key = `${userId}-${day}`;
    const cur = shifts[key] ?? 'OFF';
    const next = states[(states.indexOf(cur as typeof states[number]) + 1) % 3];
    setShifts((prev) => ({ ...prev, [key]: next }));
    const reason = reasonPrompt('Update shift');
    if (!reason) { setShifts((prev) => ({ ...prev, [key]: cur })); return; }
    updateShift.mutate({ userId, day, shiftType: next, reason }, { onError: () => setShifts((prev) => ({ ...prev, [key]: cur })) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Calendar} title="Shift Planner" description="Team scheduling and on-call rotation — click cells to cycle" accent={accent} />
      <Panel title="Weekly Schedule" subtitle="Click to toggle: On-duty → On-call → Off">
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-8 gap-1 text-[10px] text-slate-400 font-semibold mb-1">
              <div>Staff</div>
              {days.map((d) => <div key={d} className="text-center">{d}</div>)}
            </div>
            {users.slice(0, 6).map((user) => (
              <div key={String(user.id)} className="grid grid-cols-8 gap-1 text-[10px] py-1 border-t border-slate-800">
                <div className="text-slate-100 truncate">{String(user.firstName ?? '')} {String(user.lastName ?? '').charAt(0)}.</div>
                {days.map((d) => {
                  const st = shifts[`${String(user.id)}-${d}`] ?? 'OFF';
                  return (
                    <div key={d} className={`h-6 rounded cursor-pointer transition-colors ${stateColors[st] ?? 'bg-slate-800'}`} onClick={() => cycle(String(user.id), d)} title={st.replace('_', ' ')} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex gap-3 text-[10px] text-slate-400">
          <div className="flex items-center gap-1"><span className="size-3 rounded bg-emerald-500/20" /> On-duty</div>
          <div className="flex items-center gap-1"><span className="size-3 rounded bg-blue-500/20" /> On-call</div>
          <div className="flex items-center gap-1"><span className="size-3 rounded bg-slate-800" /> Off</div>
        </div>
      </Panel>
    </SectionShell>
  );
}
