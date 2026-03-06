/* ─── RolesView ─── Role overview + assignment ─── */
import { useState } from 'react';
import {
  Users, Search, Shield, X, CheckCircle, Loader2, Crown, Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useUserList, useUserStats, useBulkUpdateRole,
  type UserRole,
} from '@/hooks/api';
import {
  ROLE_CONFIG, ALL_ROLES, ROLE_PERMISSIONS,
  Icon3D_Shield, RoleBadge, UserAvatar,
} from './shared';

export function RolesView({ subNav }: { subNav: string }) {
  if (subNav === 'role_assignment') return <RoleAssignmentView />;
  return <RoleOverviewView />;
}

/* ── Role Overview ──────────────────────────────────────────────── */
function RoleOverviewView() {
  const { data: stats } = useUserStats();
  const roleCounts = stats?.roleCounts ?? {};

  return (
    <div className="h-full overflow-y-auto px-1 space-y-6 pb-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-violet-600/30 via-purple-600/20 to-indigo-600/30" />
        <div className="absolute inset-0 bg-linear-to-b from-white/6 to-transparent" />
        <div className="relative p-6 flex items-center gap-4">
          <Icon3D_Shield />
          <div>
            <h1 className="text-2xl font-bold text-white/95 tracking-tight">Role Overview</h1>
            <p className="text-sm text-white/50 mt-0.5">{ALL_ROLES.length} platform roles configured</p>
          </div>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ALL_ROLES.map(role => {
          const cfg = ROLE_CONFIG[role];
          const perms = ROLE_PERMISSIONS[role];
          const count = roleCounts[role] ?? 0;
          return (
            <Card key={role} className="bg-white/3 border-white/6 hover:border-white/12 transition-all group">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${cfg.bg}`}>
                      {role === 'PROVIDER' ? <Crown className={`size-4 ${cfg.color}`} /> : <Shield className={`size-4 ${cfg.color}`} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/85">{cfg.label}</p>
                      <p className="text-[10px] text-white/40">{perms.desc}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${cfg.border} ${cfg.color}`}>{count} users</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Permissions</p>
                  <div className="flex flex-wrap gap-1">
                    {perms.permissions.map(p => (
                      <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/6">{p}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <Card className="bg-white/3 border-white/6 overflow-hidden">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <Lock className="size-4 text-indigo-400" /> Permissions Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="p-2 text-left font-semibold text-white/50 uppercase tracking-wider">Module</th>
                  {ALL_ROLES.map(r => (
                    <th key={r} className="p-2 text-center">
                      <span className={`text-[9px] font-bold ${ROLE_CONFIG[r].color}`}>{ROLE_CONFIG[r].label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Dashboard', 'User Management', 'Tenant Mgmt', 'Billing', 'Academics', 'Communication', 'AI Tools', 'Settings'].map(mod => (
                  <tr key={mod} className="border-b border-white/4 hover:bg-white/2">
                    <td className="p-2 text-white/60 font-medium">{mod}</td>
                    {ALL_ROLES.map(r => {
                      const has = ROLE_PERMISSIONS[r].permissions.some(p =>
                        p.toLowerCase().includes(mod.toLowerCase().split(' ')[0]) || p === 'All Permissions');
                      return (
                        <td key={r} className="p-2 text-center">
                          {has
                            ? <CheckCircle className="size-3.5 mx-auto text-emerald-400" />
                            : <X className="size-3.5 mx-auto text-white/15" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Role Assignment ────────────────────────────────────────────── */
function RoleAssignmentView() {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const { data: users, loading, refetch } = useUserList({ page: 1, pageSize: 100, search, role: selectedRole || undefined });
  const { mutate: bulkUpdateRole, loading: updating } = useBulkUpdateRole();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetRole, setTargetRole] = useState<UserRole>('STUDENT');

  const toggleUser = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleAssign = async () => {
    if (selected.size === 0) return;
    await bulkUpdateRole({ ids: Array.from(selected), role: targetRole });
    setSelected(new Set());
    refetch();
  };

  return (
    <div className="h-full overflow-y-auto px-1 space-y-6 pb-6">
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/30 via-indigo-600/20 to-violet-600/30" />
        <div className="absolute inset-0 bg-linear-to-b from-white/6 to-transparent" />
        <div className="relative p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Icon3D_Shield />
            <div>
              <h1 className="text-2xl font-bold text-white/95 tracking-tight">Role Assignment</h1>
              <p className="text-sm text-white/50 mt-0.5">Assign or change user roles in bulk</p>
            </div>
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <select value={targetRole} onChange={e => setTargetRole(e.target.value as UserRole)} className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white/80 text-sm">
                {ALL_ROLES.map(r => <option key={r} value={r} className="bg-gray-900">{ROLE_CONFIG[r].label}</option>)}
              </select>
              <Button onClick={handleAssign} disabled={updating} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1">
                {updating ? <Loader2 className="size-3 animate-spin" /> : <Shield className="size-3" />}
                Assign {selected.size} user{selected.size > 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card className="bg-white/3 border-white/6">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
          <select value={selectedRole} onChange={e => setSelectedRole(e.target.value as UserRole | '')} className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white/80 text-sm">
            <option value="" className="bg-gray-900">All Roles</option>
            {ALL_ROLES.map(r => <option key={r} value={r} className="bg-gray-900">{ROLE_CONFIG[r].label}</option>)}
          </select>
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 text-xs">{selected.size} selected</Badge>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-3 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-2">
          {users.map(user => (
            <Card key={user.id} onClick={() => toggleUser(user.id)} className={`cursor-pointer transition-all ${selected.has(user.id) ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/3 border-white/6 hover:border-white/12'}`}>
              <CardContent className="flex items-center gap-3 py-3">
                <input type="checkbox" checked={selected.has(user.id)} onChange={() => toggleUser(user.id)} className="rounded border-white/20 bg-white/5 accent-indigo-500" />
                <UserAvatar user={user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/85 truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
                <RoleBadge role={user.role} />
                <span className={`text-xs ${user.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </CardContent>
            </Card>
          ))}
          {users.length === 0 && (
            <Card className="bg-white/3 border-white/6">
              <CardContent className="py-12 text-center">
                <Users className="size-10 mx-auto text-white/20 mb-3" />
                <p className="text-white/40">No users found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
