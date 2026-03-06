/* ─── AllUsersView ─── Table/grid view with search, sort, pagination, bulk ops ─── */
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Users, Search, Plus, Trash2, Download, Grid3X3, List,
  ChevronLeft, ChevronRight, Mail, Calendar,
  ArrowUpDown, ArrowUp, ArrowDown, Activity, Shield, Edit2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useUserList, useUserStats, useDeleteUser, useBulkDeleteUsers,
  type UserRecord,
} from '@/hooks/api';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { BulkActionBar } from '@/components/features/BulkActionBar';
import {
  ROLE_CONFIG, ALL_ROLES, Icon3D_Users, Icon3D_Stats, Icon3D_Shield,
  RoleBadge, UserAvatar, UserModal, BulkRoleModal,
} from './shared';

export function AllUsersView({ subNav }: { subNav: string }) {
  const viewFromNav = subNav === 'grid_view' ? 'grid' : 'table';
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(viewFromNav);

  useEffect(() => { setViewMode(viewFromNav); }, [viewFromNav]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalUser, setModalUser] = useState<UserRecord | null | undefined>(undefined);
  const [bulkRoleOpen, setBulkRoleOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: users, meta, loading, refetch } = useUserList({
    page, pageSize, search, role: roleFilter, isActive: statusFilter, sortBy, sortOrder,
  });
  const { data: stats } = useUserStats();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: bulkDelete } = useBulkDeleteUsers();

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.size === users.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map(u => u.id)));
    }
  }, [users, selected]);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteUser(undefined, `/${id}`);
    setDeleteConfirm(null);
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    refetch();
  }, [deleteUser, refetch]);

  const handleBulkDelete = useCallback(async () => {
    if (selected.size === 0) return;
    await bulkDelete({ ids: Array.from(selected) });
    setSelected(new Set());
    refetch();
  }, [bulkDelete, selected, refetch]);

  const handleExport = useCallback(() => {
    const params = new URLSearchParams();
    if (roleFilter) params.set('role', roleFilter);
    if (statusFilter) params.set('isActive', statusFilter);
    window.open(`/api/user-management/users/export?${params.toString()}`, '_blank');
  }, [roleFilter, statusFilter]);

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-white/30" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-400" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />;
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const total = meta.totalPages;
    const cur = meta.page;
    const start = Math.max(1, cur - 2);
    const end = Math.min(total, cur + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [meta]);

  return (
    <div className="h-full overflow-y-auto px-1 space-y-6 pb-6">

      {/* Gradient Header */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-600/30 via-purple-600/20 to-pink-600/30" />
        <div className="absolute inset-0 bg-linear-to-b from-white/6 to-transparent" />
        <div className="relative p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Icon3D_Users />
            <div>
              <h1 className="text-2xl font-bold text-white/95 tracking-tight">User Management</h1>
              <p className="text-sm text-white/50 mt-0.5">Manage platform users, roles & permissions</p>
            </div>
          </div>
          <Button
            onClick={() => setModalUser(null)}
            className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 gap-2"
          >
            <Plus className="w-4 h-4" /> New User
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Users', value: stats.total, icon: <Icon3D_Users />, gradient: 'from-indigo-500/20 to-blue-500/20' },
            { label: 'Active', value: stats.active, icon: <Icon3D_Stats />, gradient: 'from-emerald-500/20 to-teal-500/20' },
            { label: 'Inactive', value: stats.inactive, icon: <Activity className="w-6 h-6 text-amber-400" />, gradient: 'from-amber-500/20 to-orange-500/20' },
            { label: 'Roles', value: Object.keys(stats.roleCounts).length, icon: <Icon3D_Shield />, gradient: 'from-purple-500/20 to-pink-500/20' },
          ].map((s, i) => (
            <Card key={i} className="bg-linear-to-br border-white/6 hover:border-white/10 transition-all duration-300 group">
              <CardContent className={`p-4 bg-linear-to-br ${s.gradient} rounded-xl`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 font-medium">{s.label}</p>
                    <p className="text-2xl font-bold text-white/90 mt-1">{s.value.toLocaleString()}</p>
                  </div>
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-300">{s.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <Card className="bg-white/3 border-white/6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            <select
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="" className="bg-gray-900">All Roles</option>
              {ALL_ROLES.map(r => <option key={r} value={r} className="bg-gray-900">{ROLE_CONFIG[r].label}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="" className="bg-gray-900">All Status</option>
              <option value="true" className="bg-gray-900">Active</option>
              <option value="false" className="bg-gray-900">Inactive</option>
            </select>
            <div className="flex rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-indigo-500/30 text-indigo-300' : 'text-white/40 hover:text-white/60'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-indigo-500/30 text-indigo-300' : 'text-white/40 hover:text-white/60'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {selected.size > 0 && (
            <BulkActionBar
              selectedCount={selected.size}
              selectedIds={Array.from(selected)}
              totalCount={meta.total}
              onClearSelection={() => setSelected(new Set())}
              onSelectAll={() => setSelected(new Set(users.map((u) => u.id)))}
              actions={[
                { id: 'role', label: 'Assign Role', icon: <Shield className="size-3" />, variant: 'default', onClick: () => setBulkRoleOpen(true) },
                { id: 'export', label: 'Export', icon: <Download className="size-3" />, variant: 'default', onClick: () => handleExport() },
                { id: 'delete', label: 'Delete', icon: <Trash2 className="size-3" />, variant: 'destructive', onClick: () => handleBulkDelete() },
              ]}
              className="mt-3"
            />
          )}
        </CardContent>
      </Card>

      {/* Content: Table or Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-3 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <Card className="bg-white/3 border-white/6">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-white/20 mb-4" />
            <p className="text-white/50 text-lg">No users found</p>
            <p className="text-white/30 text-sm mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="bg-white/3 border-white/6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="p-3 text-left w-10">
                    <input type="checkbox" checked={selected.size === users.length && users.length > 0} onChange={toggleSelectAll} className="rounded border-white/20 bg-white/5 accent-indigo-500" />
                  </th>
                  <th className="p-3 text-left">
                    <button onClick={() => handleSort('firstName')} className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors">User <SortIcon field="firstName" /></button>
                  </th>
                  <th className="p-3 text-left">
                    <button onClick={() => handleSort('email')} className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors">Email <SortIcon field="email" /></button>
                  </th>
                  <th className="p-3 text-left">
                    <button onClick={() => handleSort('role')} className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors">Role <SortIcon field="role" /></button>
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left">
                    <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1.5 text-xs font-semibold text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors">Joined <SortIcon field="createdAt" /></button>
                  </th>
                  <th className="p-3 text-right text-xs font-semibold text-white/50 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id} className={`border-b border-white/4 hover:bg-white/3 transition-all duration-150 ${selected.has(user.id) ? 'bg-indigo-500/6' : ''}`} style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="p-3">
                      <input type="checkbox" checked={selected.has(user.id)} onChange={() => toggleSelect(user.id)} className="rounded border-white/20 bg-white/5 accent-indigo-500" />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-white/85">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-white/40">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-sm text-white/60"><Mail className="w-3.5 h-3.5 text-white/30" />{user.email}</div>
                    </td>
                    <td className="p-3"><RoleBadge role={user.role} /></td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm' : 'bg-red-400'}`} />
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-xs text-white/40"><Calendar className="w-3.5 h-3.5" />{new Date(user.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setModalUser(user)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-blue-400 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(user.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((user, idx) => (
            <Card key={user.id} className={`bg-linear-to-br from-white/5 to-white/2 border-white/6 hover:border-white/12 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${selected.has(user.id) ? 'border-indigo-500/40 ring-1 ring-indigo-500/20' : ''}`} style={{ animationDelay: `${idx * 40}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <input type="checkbox" checked={selected.has(user.id)} onChange={() => toggleSelect(user.id)} className="rounded border-white/20 bg-white/5 accent-indigo-500" />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setModalUser(user)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-blue-400 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteConfirm(user.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center mb-4">
                  <UserAvatar user={user} size="lg" />
                  <h3 className="mt-3 text-sm font-semibold text-white/85">{user.firstName} {user.lastName}</h3>
                  <p className="text-xs text-white/40 mt-0.5 truncate max-w-full">{user.email}</p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <RoleBadge role={user.role} />
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-center text-xs text-white/30">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/40">Showing {((meta.page - 1) * meta.pageSize) + 1}--{Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total.toLocaleString()}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.page <= 1} className="p-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            {pageNumbers.map(n => (
              <button key={n} onClick={() => setPage(n)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${n === meta.page ? 'bg-indigo-500/30 text-indigo-300 shadow-lg shadow-indigo-500/10' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}>{n}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.page >= meta.totalPages} className="p-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modalUser !== undefined && (
        <UserModal user={modalUser} onClose={() => setModalUser(undefined)} onSaved={refetch} />
      )}
      {bulkRoleOpen && selected.size > 0 && (
        <BulkRoleModal ids={Array.from(selected)} onClose={() => setBulkRoleOpen(false)} onDone={() => { setSelected(new Set()); refetch(); }} />
      )}
      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
        title="Delete User?"
        description="This action cannot be undone. The user and their data will be permanently removed."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={() => { if (deleteConfirm) handleDelete(deleteConfirm); }}
      />
    </div>
  );
}
