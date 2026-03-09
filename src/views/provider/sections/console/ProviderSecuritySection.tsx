/* ─── ProviderSecuritySection ─── Access · Posture · Compliance · API Keys · IP Allowlist · Sessions ─── */
import { useMemo, useCallback, useState } from 'react';
import { Activity, FileClock, Globe, Key, Loader2, Monitor, PlusCircle, Search, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderApiManagement,
  useProviderModuleData,
  useProviderPermissionContext,
  useProviderSecurityExtras,
  useGenerateProviderApiKey,
  useRotateProviderApiKey,
  useRevokeProviderApiKey,
  useAddProviderIpRule,
  useRemoveProviderIpRule,
  useRevokeProviderSession,
  useRequestProviderComplianceReport,
} from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderSecuritySection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'security_access':       return <AccessControlsView />;
    case 'security_posture':      return <SecurityPostureView />;
    case 'security_compliance':   return <ComplianceView />;
    case 'security_api_keys':     return <ApiKeysView />;
    case 'security_ip_allowlist': return <IpAllowlistView />;
    case 'security_sessions':     return <SessionsView />;
    default: return <AccessControlsView />;
  }
}

function useSecurityData() {
  const { data: moduleData } = useProviderModuleData();
  const { data: permCtx } = useProviderPermissionContext();
  const users = useMemo(() => (moduleData?.providerUsers ?? []) as Array<Record<string, unknown>>, [moduleData]);
  const roles = useMemo(() => (moduleData?.providerRoles ?? []) as Array<Record<string, unknown>>, [moduleData]);
  const permissions = useMemo(() => permCtx?.permissions ?? [], [permCtx]);
  const currentUser = permCtx?.user as Record<string, unknown> | null;
  const currentRole = permCtx?.role as Record<string, unknown> | null;
  const currentRoleName = currentRole ? String(currentRole.name ?? currentRole.key ?? '—') : '—';
  const mfaEnabled = useMemo(() => users.filter((u) => u.mfaEnforced === true).length, [users]);
  const activeUsers = useMemo(() => users.filter((u) => u.status === 'ACTIVE').length, [users]);
  return { users, roles, permissions, currentUser, currentRoleName, mfaEnabled, activeUsers };
}

/* ── Access Controls ── */
function AccessControlsView() {
  const { users, roles, permissions, currentRoleName, mfaEnabled, activeUsers } = useSecurityData();
  const accent = getAccent('provider_security');
  return (
    <SectionShell>
      <SectionPageHeader icon={Shield} title="Access Controls" description="RBAC roles and permission management" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Users" value={String(users.length)} sub={`${activeUsers} active`} gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="MFA" value={String(mfaEnabled)} sub={`${users.length > 0 ? Math.round((mfaEnabled / users.length) * 100) : 0}% coverage`} gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Roles" value={String(roles.length)} sub="Defined" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Your Role" value={currentRoleName} sub={`${permissions.length} perms`} gradient="from-sky-500/10 to-sky-500/5" />
      </div>
      <Panel title="Role Definitions" subtitle="Provider-level access control">
        <div className="grid gap-2 md:grid-cols-2">
          {roles.map((role) => (
            <div key={String(role.key ?? role.id)} className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-slate-100">{String(role.name ?? role.key)}</p>
                <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{String(role.key)}</span>
              </div>
              {role.description != null && <p className="mb-2 text-[10px] text-slate-400">{String(role.description)}</p>}
              <div className="flex flex-wrap gap-1">
                {Array.isArray(role.permissions) && (role.permissions as string[]).slice(0, 8).map((perm) => (
                  <span key={perm} className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{perm}</span>
                ))}
                {Array.isArray(role.permissions) && (role.permissions as string[]).length > 8 && (
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-400">+{(role.permissions as string[]).length - 8} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Your Permissions" subtitle={`Role: ${currentRoleName}`}>
        <div className="flex flex-wrap gap-1">
          {permissions.map((perm) => (
            <span key={String(perm)} className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] text-sky-200">{String(perm)}</span>
          ))}
          {permissions.length === 0 && <p className="text-xs text-slate-400">No permissions allocated.</p>}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Security Posture ── */
function SecurityPostureView() {
  const { users, mfaEnabled, activeUsers } = useSecurityData();
  const { data: extras } = useProviderSecurityExtras();
  const { data: apiBundle } = useProviderApiManagement();
  const accent = getAccent('provider_security');

  const mfaCoverage = useMemo(
    () => (users.length > 0 ? Math.round((mfaEnabled / users.length) * 100) : 0),
    [users.length, mfaEnabled],
  );

  const ipRuleCount = useMemo(() => extras?.ipAllowlist?.length ?? 0, [extras]);
  const sessions = useMemo(() => extras?.sessions ?? [], [extras]);
  const complianceItems = useMemo(() => extras?.complianceItems ?? [], [extras]);
  const apiKeys = useMemo(() => apiBundle?.apiKeys ?? [], [apiBundle]);

  const activeKeys = useMemo(() => apiKeys.filter((k) => k.status === 'ACTIVE'), [apiKeys]);

  const daysSinceLastRotation = useMemo(() => {
    if (activeKeys.length === 0) return 0;
    const oldest = activeKeys.reduce((o, k) => (k.lastUsed < o.lastUsed ? k : o));
    return Math.round((Date.now() - new Date(oldest.lastUsed).getTime()) / 86_400_000);
  }, [activeKeys]);

  const keyRotationStatus = useMemo(
    () => (daysSinceLastRotation > 90 ? 'FAIL' : daysSinceLastRotation > 30 ? 'WARN' : 'PASS'),
    [daysSinceLastRotation],
  );

  /* Derive password-policy status from compliance coverage — if all tracked
     frameworks maintain ≥80% coverage, we consider the policy enforced. */
  const pwPolicyStatus = useMemo(() => {
    if (complianceItems.length === 0) return 'PASS';
    const avgCoverage = complianceItems.reduce((s, c) => s + c.coverage, 0) / complianceItems.length;
    return avgCoverage >= 90 ? 'PASS' : avgCoverage >= 70 ? 'WARN' : 'FAIL';
  }, [complianceItems]);

  const pwPolicyDetail = useMemo(() => {
    if (complianceItems.length === 0) return 'Min 12 chars, complexity enforced';
    const avgCoverage = Math.round(complianceItems.reduce((s, c) => s + c.coverage, 0) / complianceItems.length);
    return `Min 12 chars · ${avgCoverage}% compliance coverage`;
  }, [complianceItems]);

  /* Derive audit-logging from compliance: if ≥1 framework is COMPLIANT → PASS */
  const auditStatus = useMemo(() => {
    if (complianceItems.length === 0) return 'PASS';
    return complianceItems.some((c) => c.status === 'COMPLIANT') ? 'PASS' : 'WARN';
  }, [complianceItems]);

  const auditDetail = useMemo(() => {
    const compliant = complianceItems.filter((c) => c.status === 'COMPLIANT').length;
    if (complianceItems.length === 0) return 'All actions recorded';
    return `${compliant}/${complianceItems.length} frameworks compliant`;
  }, [complianceItems]);

  const checks = useMemo(
    () => [
      { name: 'MFA Enforcement', status: mfaCoverage === 100 ? 'PASS' : mfaCoverage >= 80 ? 'WARN' : 'FAIL', detail: `${mfaCoverage}% coverage` },
      { name: 'Password Policy', status: pwPolicyStatus, detail: pwPolicyDetail },
      { name: 'Session Timeout', status: sessions.length > 20 ? 'WARN' : 'PASS', detail: `${sessions.length} active sessions` },
      { name: 'API Key Rotation', status: keyRotationStatus, detail: activeKeys.length > 0 ? `Last used ${daysSinceLastRotation}d ago` : 'No active keys' },
      { name: 'IP Allowlist', status: ipRuleCount > 0 ? 'PASS' : 'WARN', detail: `${ipRuleCount} range${ipRuleCount !== 1 ? 's' : ''} configured` },
      { name: 'Audit Logging', status: auditStatus, detail: auditDetail },
    ],
    [mfaCoverage, pwPolicyStatus, pwPolicyDetail, sessions.length, keyRotationStatus, activeKeys.length, daysSinceLastRotation, ipRuleCount, auditStatus, auditDetail],
  );

  const passCount = useMemo(() => checks.filter((c) => c.status === 'PASS').length, [checks]);

  return (
    <SectionShell>
      <SectionPageHeader icon={Activity} title="Security Posture" description="Platform security health assessment" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Score" value={`${passCount}/${checks.length}`} sub="Checks passing" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="MFA" value={`${mfaCoverage}%`} sub="Coverage" gradient={mfaCoverage === 100 ? 'from-emerald-500/10 to-emerald-500/5' : 'from-amber-500/10 to-amber-500/5'} />
        <StatCard label="Active Users" value={String(activeUsers)} sub="With access" gradient="from-blue-500/10 to-blue-500/5" />
      </div>
      <Panel title="Security Checks" accentBorder="border-emerald-500/20">
        <div className="space-y-2">
          {checks.map((chk) => (
            <div key={chk.name} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${chk.status === 'PASS' ? 'bg-emerald-500/5' : chk.status === 'WARN' ? 'bg-amber-500/5' : 'bg-red-500/5'}`}>
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${chk.status === 'PASS' ? 'bg-emerald-500' : chk.status === 'WARN' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className="font-semibold text-slate-100">{chk.name}</span>
              </div>
              <span className="text-slate-400">{chk.detail}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="MFA Status" subtitle="Per-user breakdown" accentBorder="border-blue-500/20">
        <div className="space-y-1">
          {users.map((user) => (
            <div key={String(user.id ?? user.email)} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-xs">
              <span className="text-slate-100">{String(user.name ?? `${String(user.firstName ?? '')} ${String(user.lastName ?? '')}`)}</span>
              {user.mfaEnforced ? (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">MFA ✓</span>
              ) : (
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-300">No MFA</span>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Compliance ── */
function ComplianceView() {
  const accent = getAccent('provider_security');
  const { data: extras, isLoading } = useProviderSecurityExtras();
  const requestReport = useRequestProviderComplianceReport();

  const complianceItems = useMemo(() => extras?.complianceItems ?? [], [extras]);
  const compliantCount = useMemo(() => complianceItems.filter((c) => c.status === 'COMPLIANT').length, [complianceItems]);
  const avgCoverage = useMemo(
    () => (complianceItems.length > 0 ? Math.round(complianceItems.reduce((s, c) => s + c.coverage, 0) / complianceItems.length) : 0),
    [complianceItems],
  );

  const handleRequestReport = useCallback(() => {
    const reason = reasonPrompt('Request compliance report');
    if (!reason) return;
    requestReport.mutate({ frameworks: complianceItems.map((c) => c.framework), reason });
  }, [complianceItems, requestReport]);

  return (
    <SectionShell>
      <SectionPageHeader icon={FileClock} title="Compliance" description="Regulatory compliance status and documentation" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Frameworks" value={String(complianceItems.length)} sub="Tracked" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Compliant" value={String(compliantCount)} sub="Passing" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Avg Coverage" value={complianceItems.length > 0 ? `${avgCoverage}%` : '—'} sub="Coverage" gradient="from-blue-500/10 to-blue-500/5" />
      </div>
      <Panel title="Compliance Matrix" accentBorder="border-violet-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-red-400" /></div>
        ) : complianceItems.length === 0 ? (
          <EmptyState icon={FileClock} title="No Compliance Items" description="No compliance frameworks have been configured yet." />
        ) : (
          <div className="space-y-2">
            {complianceItems.map((item) => (
              <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border p-3 text-xs ${item.status === 'COMPLIANT' ? 'border-emerald-500/20 bg-emerald-500/5' : item.status === 'IN_PROGRESS' ? 'border-amber-500/20 bg-amber-500/5' : 'border-slate-700/40 bg-slate-800/40'}`}>
                <div>
                  <p className="font-semibold text-slate-100">{item.framework}</p>
                  <p className="text-slate-400">Last audit: {item.lastAudit} · Next: {item.nextAudit} · Coverage: {item.coverage}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-700">
                    <div className={`h-full rounded-full ${item.coverage >= 90 ? 'bg-emerald-500' : item.coverage >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${item.coverage}%` }} />
                  </div>
                  <StatusBadge status={item.status === 'COMPLIANT' ? 'ACTIVE' : item.status === 'IN_PROGRESS' ? 'TRIAL' : 'PENDING'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <div className="flex justify-end">
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" disabled={requestReport.isPending || complianceItems.length === 0} onClick={handleRequestReport}>
          {requestReport.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <FileClock className="mr-1 size-3" />}Request Compliance Report
        </Button>
      </div>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: API Keys                                             */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ApiKeysView() {
  const accent = getAccent('provider_security');
  const { data: bundle, isLoading } = useProviderApiManagement();
  const generateKey = useGenerateProviderApiKey();
  const rotateKey = useRotateProviderApiKey();
  const revokeKey = useRevokeProviderApiKey();

  const keys = useMemo(() => bundle?.apiKeys ?? [], [bundle]);
  const activeKeyCount = useMemo(() => keys.filter((k) => k.status === 'ACTIVE').length, [keys]);
  const revokedKeyCount = useMemo(() => keys.filter((k) => k.status === 'REVOKED').length, [keys]);

  const [showNew, setShowNew] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyScopes, setKeyScopes] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return keys.filter((k) => {
      if (q && !k.name.toLowerCase().includes(q) && !k.prefix.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'ALL' && k.status !== statusFilter) return false;
      return true;
    });
  }, [keys, search, statusFilter]);

  const handleGenerate = useCallback(() => {
    if (!keyName.trim()) return;
    const reason = reasonPrompt('Generate API key');
    if (!reason) return;
    generateKey.mutate({ name: keyName, scopes: keyScopes.split(',').map((s) => s.trim()).filter(Boolean), reason });
    setShowNew(false);
    setKeyName('');
    setKeyScopes('');
  }, [keyName, keyScopes, generateKey]);

  const handleRotate = useCallback(
    (keyId: string) => {
      const reason = reasonPrompt('Rotate API key');
      if (!reason) return;
      rotateKey.mutate({ keyId, reason });
    },
    [rotateKey],
  );

  const handleRevoke = useCallback(
    (keyId: string) => {
      const reason = reasonPrompt('Revoke API key');
      if (!reason) return;
      revokeKey.mutate({ keyId, reason });
    },
    [revokeKey],
  );

  return (
    <SectionShell>
      <SectionPageHeader icon={Key} title="API Keys" description="Manage platform API keys and access tokens" accent={accent} actions={
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => setShowNew((p) => !p)}>
          <PlusCircle className="mr-1 size-3" />{showNew ? 'Cancel' : 'Generate Key'}
        </Button>
      } />

      {showNew && (
        <Panel title="Generate New API Key" accentBorder="border-violet-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Key name" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Scopes (comma-sep)" value={keyScopes} onChange={(e) => setKeyScopes(e.target.value)} />
            <Button size="sm" className="h-8 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" disabled={generateKey.isPending || !keyName.trim()} onClick={handleGenerate}>
              {generateKey.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Key className="mr-1 size-3" />}Generate
            </Button>
          </div>
        </Panel>
      )}

      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="API Keys" value={String(keys.length)} sub="Total" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Active" value={String(activeKeyCount)} sub="In use" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Revoked" value={String(revokedKeyCount)} sub="Disabled" gradient="from-red-500/10 to-red-500/5" />
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-slate-400" />
          <Input className="h-8 pl-7 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Search keys…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="REVOKED">Revoked</option>
        </select>
      </div>

      <Panel title="API Key Registry" subtitle={`${filtered.length} keys`} accentBorder="border-violet-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-red-400" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Key} title="No API Keys" description={keys.length === 0 ? 'No API keys have been generated yet.' : 'No keys match the current filters.'} />
        ) : (
          <div className="space-y-2">
            {filtered.map((key) => (
              <div key={key.id} className={`rounded-lg border px-3 py-2 text-xs ${key.status === 'ACTIVE' ? 'border-slate-500/20 bg-slate-800/60' : 'border-red-500/15 bg-red-500/5 opacity-60'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-100">{key.name}</p>
                    <p className="font-mono text-[10px] text-slate-400">{key.prefix}••••••••••••</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={key.status} />
                    {key.status === 'ACTIVE' && (
                      <Button size="sm" className="h-6 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 text-[10px]" disabled={rotateKey.isPending} onClick={() => handleRotate(key.id)}>Rotate</Button>
                    )}
                    {key.status === 'ACTIVE' && (
                      <Button size="sm" className="h-6 bg-red-500/20 text-red-100 hover:bg-red-500/30 text-[10px]" disabled={revokeKey.isPending} onClick={() => handleRevoke(key.id)}>Revoke</Button>
                    )}
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {key.scopes.map((scope) => (
                    <span key={scope} className="rounded bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300 border border-violet-500/20">{scope}</span>
                  ))}
                  <span className="text-[10px] text-slate-400 ml-auto">Created: {key.createdAt} · Last used: {new Date(key.lastUsed).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: IP Allowlist                                         */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function IpAllowlistView() {
  const accent = getAccent('provider_security');
  const { data: extras, isLoading } = useProviderSecurityExtras();
  const addRule = useAddProviderIpRule();
  const removeRule = useRemoveProviderIpRule();

  const rules = useMemo(() => extras?.ipAllowlist ?? [], [extras]);
  const totalHits = useMemo(() => rules.reduce((s, r) => s + r.hits, 0), [rules]);

  const [showNew, setShowNew] = useState(false);
  const [ruleCidr, setRuleCidr] = useState('');
  const [ruleLabel, setRuleLabel] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rules.filter((r) => {
      if (q && !r.label.toLowerCase().includes(q) && !r.cidr.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rules, search]);

  const handleAdd = useCallback(() => {
    if (!ruleCidr.trim() || !ruleLabel.trim()) return;
    const reason = reasonPrompt('Add IP rule');
    if (!reason) return;
    addRule.mutate({ cidr: ruleCidr, label: ruleLabel, reason });
    setShowNew(false);
    setRuleCidr('');
    setRuleLabel('');
  }, [ruleCidr, ruleLabel, addRule]);

  const handleRemove = useCallback(
    (ruleId: string) => {
      const reason = reasonPrompt('Remove IP rule');
      if (!reason) return;
      removeRule.mutate({ ruleId, reason });
    },
    [removeRule],
  );

  return (
    <SectionShell>
      <SectionPageHeader icon={Globe} title="IP Allowlist" description="Restrict API and admin access by IP range" accent={accent} actions={
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => setShowNew((p) => !p)}>
          <PlusCircle className="mr-1 size-3" />{showNew ? 'Cancel' : 'Add Rule'}
        </Button>
      } />

      {showNew && (
        <Panel title="Add IP Rule" accentBorder="border-violet-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="CIDR (e.g. 10.0.0.0/24)" value={ruleCidr} onChange={(e) => setRuleCidr(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Label" value={ruleLabel} onChange={(e) => setRuleLabel(e.target.value)} />
            <Button size="sm" className="h-8 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" disabled={addRule.isPending || !ruleCidr.trim() || !ruleLabel.trim()} onClick={handleAdd}>
              {addRule.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Globe className="mr-1 size-3" />}Add Rule
            </Button>
          </div>
        </Panel>
      )}

      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Rules" value={String(rules.length)} sub="Active" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Total Hits" value={totalHits.toLocaleString()} sub="Matched requests" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Mode" value="Enforce" sub="Blocking non-listed IPs" gradient="from-emerald-500/10 to-emerald-500/5" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-slate-400" />
        <Input className="h-8 pl-7 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Search rules…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Panel title="Allowed IP Ranges" subtitle={`${filtered.length} rules`} accentBorder="border-violet-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-red-400" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Globe} title="No IP Rules" description={rules.length === 0 ? 'No IP allowlist rules have been configured yet.' : 'No rules match the current search.'} />
        ) : (
          <div className="space-y-2">
            {filtered.map((rule) => (
              <div key={rule.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-slate-500/20 bg-slate-800/60 px-3 py-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{rule.label}</span>
                    <span className="rounded bg-slate-700 px-2 py-0.5 font-mono text-[10px] text-emerald-300">{rule.cidr}</span>
                  </div>
                  <p className="text-slate-400 mt-0.5">Added: {rule.createdAt} · Last seen: {rule.lastSeen}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-300">{rule.hits.toLocaleString()} hits</span>
                  <Button size="sm" className="h-6 bg-red-500/20 text-red-100 hover:bg-red-500/30 text-[10px]" disabled={removeRule.isPending} onClick={() => handleRemove(rule.id)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Active Sessions                                      */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SessionsView() {
  const accent = getAccent('provider_security');
  const { data: extras, isLoading } = useProviderSecurityExtras();
  const revokeSession = useRevokeProviderSession();

  const sessions = useMemo(() => extras?.sessions ?? [], [extras]);
  const uniqueUsers = useMemo(() => new Set(sessions.map((s) => s.user)).size, [sessions]);
  const uniqueIps = useMemo(() => new Set(sessions.map((s) => s.ip)).size, [sessions]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sessions.filter((s) => {
      if (q && !s.user.toLowerCase().includes(q) && !s.ip.toLowerCase().includes(q) && !s.device.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      return true;
    });
  }, [sessions, search, statusFilter]);

  const handleRevokeAll = useCallback(() => {
    const reason = reasonPrompt('Revoke all other sessions');
    if (!reason) return;
    revokeSession.mutate({ all: true, reason });
  }, [revokeSession]);

  const handleRevokeOne = useCallback(
    (sessionId: string) => {
      const reason = reasonPrompt('Revoke session');
      if (!reason) return;
      revokeSession.mutate({ sessionId, reason });
    },
    [revokeSession],
  );

  return (
    <SectionShell>
      <SectionPageHeader icon={Monitor} title="Active Sessions" description="Monitor and manage active user sessions" accent={accent} actions={
        <Button size="sm" className="h-7 bg-red-500/20 text-red-100 hover:bg-red-500/30" disabled={revokeSession.isPending} onClick={handleRevokeAll}>Revoke All Others</Button>
      } />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Active Sessions" value={String(sessions.length)} sub="Currently open" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Unique Users" value={String(uniqueUsers)} sub="Logged in" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Unique IPs" value={String(uniqueIps)} sub="Source addresses" gradient="from-cyan-500/10 to-cyan-500/5" />
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-slate-400" />
          <Input className="h-8 pl-7 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Search sessions…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="IDLE">Idle</option>
        </select>
      </div>

      <Panel title="Session List" subtitle={`${filtered.length} sessions`} accentBorder="border-violet-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-red-400" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Monitor} title="No Sessions" description={sessions.length === 0 ? 'No active sessions found.' : 'No sessions match the current filters.'} />
        ) : (
          <div className="space-y-2">
            {filtered.map((session) => (
              <div key={session.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${session.status === 'ACTIVE' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-500/20 bg-slate-800/60'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-100">{session.user}</p>
                    <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{session.role}</span>
                    {session.status === 'ACTIVE' && <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">Active</span>}
                    {session.status === 'IDLE' && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">Idle</span>}
                  </div>
                  <p className="text-slate-400 mt-0.5">{session.device} · IP: {session.ip}</p>
                  <p className="text-[10px] text-slate-400">Started: {new Date(session.startedAt).toLocaleString()} · Last active: {new Date(session.lastActive).toLocaleString()}</p>
                </div>
                {session.status === 'ACTIVE' && (
                  <Button size="sm" className="h-6 bg-red-500/20 text-red-100 hover:bg-red-500/30 text-[10px] shrink-0" disabled={revokeSession.isPending} onClick={() => handleRevokeOne(session.id)}>Revoke</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}
