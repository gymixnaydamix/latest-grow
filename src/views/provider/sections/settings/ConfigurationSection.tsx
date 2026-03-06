/* ─── ConfigurationSection ─── General, Branding, Notifications ─ */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Settings, PaintBucket, Bell, ToggleRight, ToggleLeft,
  Save, Globe, Clock, Languages, Wrench,
  Palette, Image, Type, Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  usePlatformConfigs, useUpsertConfig,
  useNotificationRules, useUpsertNotificationRule,
  type PlatformConfigItem, type NotificationRule,
} from '@/hooks/api/use-settings';

/* ── 3D Icon Components ─────────────────────────────────────────── */
function Icon3D_Config() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(99,102,241,.35))' }}>
      <defs>
        <linearGradient id="cfg3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <radialGradient id="cfgShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#cfg3d)" />
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#cfgShine)" />
      <g transform="translate(12,12)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="8" cy="8" r="3" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.9 2.9l1.4 1.4M11.7 11.7l1.4 1.4M2.9 13.1l1.4-1.4M11.7 4.3l1.4-1.4" />
      </g>
    </svg>
  );
}

function Icon3D_Brand() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(236,72,153,.35))' }}>
      <defs>
        <linearGradient id="brand3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <radialGradient id="brandShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#brand3d)" />
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#brandShine)" />
      <g transform="translate(11,11)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 0A9 9 0 0 0 0 9h4.5a4.5 4.5 0 0 1 4.5-4.5V0z" /><circle cx="9" cy="9" r="2.5" fill="white" />
      </g>
    </svg>
  );
}

function Icon3D_Bell() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(245,158,11,.35))' }}>
      <defs>
        <linearGradient id="bell3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <radialGradient id="bellShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#bell3d)" />
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#bellShine)" />
      <g transform="translate(12,10)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
        <path d="M8 2a5 5 0 0 0-5 5v3l-1.5 2h13L13 10V7a5 5 0 0 0-5-5z" /><path d="M6 17a2.5 2.5 0 0 0 4 0" />
      </g>
    </svg>
  );
}

/* ── Main Export ───────────────────────────────────────────────── */
export function ConfigurationSection() {
  const { activeSubNav } = useNavigationStore();
  const ref = useStaggerAnimate<HTMLDivElement>([activeSubNav]);

  const view = (() => {
    switch (activeSubNav) {
      case 'branding': return <BrandingView />;
      case 'notifications': return <NotificationsView />;
      default: return <GeneralView />;
    }
  })();

  return <div ref={ref} className="space-y-3 h-full overflow-y-auto pr-1">{view}</div>;
}

/* ════════════════════════════════════════════════════════════════
 * GENERAL VIEW
 * ════════════════════════════════════════════════════════════════ */

interface EditableConfig {
  key: string;
  label: string;
  value: string;
  type: 'input' | 'select' | 'toggle';
  icon: typeof Settings;
  desc: string;
}

const defaultGeneralConfigs: EditableConfig[] = [
  { key: 'platform_name', label: 'Platform Name', value: 'GROW YouR NEED', type: 'input', icon: Type, desc: 'Public-facing name' },
  { key: 'support_email', label: 'Support Email', value: 'support@growyourneed.com', type: 'input', icon: Globe, desc: 'Contact email for support' },
  { key: 'default_timezone', label: 'Default Timezone', value: 'America/New_York', type: 'select', icon: Clock, desc: 'System-wide timezone' },
  { key: 'default_language', label: 'Default Language', value: 'English (US)', type: 'select', icon: Languages, desc: 'Primary UI language' },
  { key: 'maintenance_mode', label: 'Maintenance Mode', value: 'false', type: 'toggle', icon: Wrench, desc: 'Temporarily disable access' },
];

function GeneralView() {
  const { data: serverConfigs, loading, refetch } = usePlatformConfigs('general');
  const { mutate: upsertConfig, loading: saving } = useUpsertConfig();

  // Merge server data with defaults
  const configs = defaultGeneralConfigs.map((def) => {
    const found = serverConfigs.find((c) => c.key === def.key);
    return { ...def, value: found?.value ?? def.value, id: found?.id };
  });

  const [edits, setEdits] = useState<Record<string, string>>({});
  const hasChanges = Object.keys(edits).length > 0;

  const handleEdit = (key: string, value: string) => {
    setEdits((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = async (key: string, current: string) => {
    const newVal = current === 'true' ? 'false' : 'true';
    await upsertConfig({ key, value: newVal, type: 'boolean', group: 'general' });
    refetch();
  };

  const handleSave = async () => {
    for (const [key, value] of Object.entries(edits)) {
      await upsertConfig({ key, value, type: 'string', group: 'general' });
    }
    setEdits({});
    refetch();
  };

  return (
    <>
      {/* Header card */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/8 to-violet-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-indigo-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Config />
          <div>
            <h2 className="text-base font-bold tracking-tight">General Settings</h2>
            <p className="text-xs text-muted-foreground">Platform-wide configuration options</p>
          </div>
          {hasChanges && (
            <Button size="sm" className="ml-auto gap-1.5" onClick={handleSave} disabled={saving}>
              <Save className="size-3" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>

      {/* Settings grid */}
      <div className="grid gap-2 sm:grid-cols-2" data-animate>
        {configs.map((cfg) => {
          const Icon = cfg.icon;
          const editValue = edits[cfg.key] ?? cfg.value;
          const isToggle = cfg.type === 'toggle';
          const isOn = editValue === 'true';

          return (
            <Card
              key={cfg.key}
              className="group relative overflow-hidden border-border/60 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="pointer-events-none absolute -top-6 -right-6 h-14 w-14 rounded-full bg-indigo-400/5 blur-xl transition-transform duration-500 group-hover:scale-150" />
              <CardContent className="flex items-center gap-3 py-3 px-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/15 to-violet-500/10 text-indigo-500 shadow-sm shadow-indigo-500/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{cfg.label}</p>
                  <p className="text-[10px] text-muted-foreground">{cfg.desc}</p>
                  {!isToggle && !loading && (
                    <Input
                      className="mt-1 h-7 text-xs bg-muted/30 border-border/40"
                      value={editValue}
                      onChange={(e) => handleEdit(cfg.key, e.target.value)}
                    />
                  )}
                </div>
                {isToggle && (
                  <button
                    onClick={() => handleToggle(cfg.key, editValue)}
                    className="shrink-0 transition-transform duration-200 hover:scale-110"
                  >
                    {isOn ? (
                      <ToggleRight className="size-6 text-indigo-500" />
                    ) : (
                      <ToggleLeft className="size-6 text-muted-foreground" />
                    )}
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
 * BRANDING VIEW
 * ════════════════════════════════════════════════════════════════ */

interface BrandItem {
  key: string;
  label: string;
  value: string;
  icon: typeof PaintBucket;
  desc: string;
  type: 'color' | 'upload' | 'text';
}

const defaultBrandConfigs: BrandItem[] = [
  { key: 'brand_logo', label: 'Platform Logo', value: '', icon: Image, desc: 'SVG or PNG, max 2MB', type: 'upload' },
  { key: 'brand_favicon', label: 'Favicon', value: '', icon: Sparkles, desc: '32×32 icon for browser tabs', type: 'upload' },
  { key: 'brand_primary', label: 'Primary Color', value: '#7C3AED', icon: Palette, desc: 'Main brand color', type: 'color' },
  { key: 'brand_secondary', label: 'Secondary Color', value: '#4F46E5', icon: Palette, desc: 'Supporting brand color', type: 'color' },
  { key: 'brand_accent', label: 'Accent Color', value: '#10B981', icon: Palette, desc: 'Highlights and CTAs', type: 'color' },
  { key: 'brand_font', label: 'Typography', value: 'Inter', icon: Type, desc: 'Primary font family', type: 'text' },
];

function BrandingView() {
  const { data: serverConfigs, loading, refetch } = usePlatformConfigs('branding');
  const { mutate: upsertConfig, loading: saving } = useUpsertConfig();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const configs = defaultBrandConfigs.map((def) => {
    const found = serverConfigs.find((c: PlatformConfigItem) => c.key === def.key);
    return { ...def, value: found?.value ?? def.value };
  });

  const handleEdit = (key: string, value: string) => setEdits((p) => ({ ...p, [key]: value }));
  const hasChanges = Object.keys(edits).length > 0;

  const handleSave = async () => {
    for (const [key, value] of Object.entries(edits)) {
      await upsertConfig({ key, value, type: 'string', group: 'branding' });
    }
    setEdits({});
    refetch();
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-pink-500/20 bg-linear-to-br from-pink-500/8 to-rose-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-pink-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Brand />
          <div>
            <h2 className="text-base font-bold tracking-tight">Branding</h2>
            <p className="text-xs text-muted-foreground">Logo, colors, and visual identity</p>
          </div>
          {hasChanges && (
            <Button size="sm" className="ml-auto gap-1.5 bg-pink-500 hover:bg-pink-600" onClick={handleSave} disabled={saving}>
              <Save className="size-3" /> {saving ? 'Saving...' : 'Save Branding'}
            </Button>
          )}
        </div>
      </div>

      {/* Brand cards */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" data-animate>
        {configs.map((item) => {
          const Icon = item.icon;
          const editVal = edits[item.key] ?? item.value;
          return (
            <Card
              key={item.key}
              className="group relative overflow-hidden border-border/60 transition-all duration-300 hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/5"
            >
              <div className="pointer-events-none absolute -top-6 -right-6 h-14 w-14 rounded-full bg-pink-400/5 blur-xl transition-transform duration-500 group-hover:scale-150" />
              <CardContent className="py-3 px-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500 transition-transform group-hover:scale-110">
                    <Icon className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                {item.type === 'color' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editVal || '#000000'}
                      onChange={(e) => handleEdit(item.key, e.target.value)}
                      className="h-8 w-10 rounded border border-border/60 cursor-pointer"
                    />
                    <Input
                      className="h-7 text-xs bg-muted/30 border-border/40 font-mono flex-1"
                      value={editVal}
                      onChange={(e) => handleEdit(item.key, e.target.value)}
                    />
                  </div>
                ) : item.type === 'upload' ? (
                  <Button size="sm" variant="outline" className="w-full text-xs h-8">
                    <Image className="size-3 mr-1" /> Upload File
                  </Button>
                ) : (
                  <Input
                    className="h-7 text-xs bg-muted/30 border-border/40"
                    value={editVal}
                    onChange={(e) => handleEdit(item.key, e.target.value)}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live Preview */}
      <Card data-animate className="border-border/60">
        <CardContent className="py-3 px-3">
          <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <Sparkles className="size-3 text-pink-500" /> Live Preview
          </p>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-3 flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl shadow-sm"
              style={{ background: edits.brand_primary ?? configs.find((c) => c.key === 'brand_primary')?.value ?? '#7C3AED' }}
            />
            <div
              className="h-10 w-10 rounded-xl shadow-sm"
              style={{ background: edits.brand_secondary ?? configs.find((c) => c.key === 'brand_secondary')?.value ?? '#4F46E5' }}
            />
            <div
              className="h-10 w-10 rounded-xl shadow-sm"
              style={{ background: edits.brand_accent ?? configs.find((c) => c.key === 'brand_accent')?.value ?? '#10B981' }}
            />
            <div className="flex-1 text-xs text-muted-foreground">
              Your brand palette preview
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
 * NOTIFICATIONS VIEW
 * ════════════════════════════════════════════════════════════════ */

const defaultNotifRules = [
  { event: 'tenant_signup', label: 'New Tenant Sign-up', email: true, push: true, inApp: true },
  { event: 'payment_received', label: 'Payment Received', email: true, push: false, inApp: true },
  { event: 'high_severity_alert', label: 'High-Severity Alert', email: true, push: true, inApp: true },
  { event: 'weekly_digest', label: 'Weekly Digest', email: true, push: false, inApp: false },
  { event: 'flag_changed', label: 'Feature Flag Changed', email: false, push: false, inApp: true },
  { event: 'api_key_created', label: 'API Key Created', email: true, push: false, inApp: true },
  { event: 'security_breach', label: 'Security Breach Detected', email: true, push: true, inApp: true },
];

function NotificationsView() {
  const { data: serverRules, loading, refetch } = useNotificationRules();
  const { mutate: upsertRule, loading: saving } = useUpsertNotificationRule();

  const rules = defaultNotifRules.map((def) => {
    const found = serverRules.find((r: NotificationRule) => r.event === def.event);
    return {
      ...def,
      email: found?.email ?? def.email,
      push: found?.push ?? def.push,
      inApp: found?.inApp ?? def.inApp,
    };
  });

  const handleToggle = async (event: string, channel: 'email' | 'push' | 'inApp', current: boolean) => {
    const rule = rules.find((r) => r.event === event)!;
    await upsertRule({
      event,
      label: rule.label,
      email: channel === 'email' ? !current : rule.email,
      push: channel === 'push' ? !current : rule.push,
      inApp: channel === 'inApp' ? !current : rule.inApp,
    });
    refetch();
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-linear-to-br from-amber-500/8 to-orange-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Bell />
          <div>
            <h2 className="text-base font-bold tracking-tight">Notification Settings</h2>
            <p className="text-xs text-muted-foreground">Configure email, push, and in-app alerts</p>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px]">{rules.length} rules</Badge>
        </div>
      </div>

      {/* Channel legend */}
      <div className="flex items-center gap-3" data-animate>
        {[
          { label: 'Email', color: 'bg-blue-500' },
          { label: 'Push', color: 'bg-violet-500' },
          { label: 'In-App', color: 'bg-emerald-500' },
        ].map((ch) => (
          <div key={ch.label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${ch.color}`} />
            <span className="text-[10px] font-medium text-muted-foreground">{ch.label}</span>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div className="space-y-1.5" data-animate>
        {rules.map((rule) => (
          <Card key={rule.event} className="group border-border/60 transition-all duration-300 hover:border-amber-500/30 hover:shadow-sm">
            <CardContent className="flex items-center justify-between py-2.5 px-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Bell className="size-3" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{rule.label}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">{rule.event}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {(['email', 'push', 'inApp'] as const).map((ch) => {
                  const on = rule[ch];
                  const colors = { email: 'text-blue-500', push: 'text-violet-500', inApp: 'text-emerald-500' };
                  return (
                    <button
                      key={ch}
                      onClick={() => handleToggle(rule.event, ch, on)}
                      disabled={saving}
                      className="flex items-center gap-1 transition-opacity hover:opacity-80"
                    >
                      <span className="text-[9px] text-muted-foreground capitalize w-8">{ch === 'inApp' ? 'App' : ch}</span>
                      {on ? (
                        <ToggleRight className={`size-5 ${colors[ch]} transition-transform hover:scale-110`} />
                      ) : (
                        <ToggleLeft className="size-5 text-muted-foreground/40" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      )}
    </>
  );
}
