/* ─── WhiteLabelingSection ─── White-label / branding customization ──── */
import { useState, useEffect, useCallback } from 'react';
import { Palette, Upload, Globe, Type, Eye, RotateCcw, Save, Sun, Moon, Image, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useSchool, useUpdateBranding } from '@/hooks/api';
import { notifySuccess, notifyError } from '@/lib/notify';

const DEFAULT_BRAND = {
  primaryColor: '#818cf8',
  secondaryColor: '#34d399',
  accentColor: '#fbbf24',
  logoUrl: '',
  faviconUrl: '',
  appName: 'GROW YouR NEED',
  customDomain: '',
  tagline: 'Empowering Education Through Innovation',
  fontFamily: 'Inter',
  darkMode: true,
  showPoweredBy: true,
  customCSS: '',
};

const COLOR_PRESETS = [
  { name: 'Default Indigo', primary: '#818cf8', secondary: '#34d399' },
  { name: 'Ocean Blue', primary: '#60a5fa', secondary: '#22d3ee' },
  { name: 'Royal Purple', primary: '#a78bfa', secondary: '#f472b6' },
  { name: 'Emerald', primary: '#34d399', secondary: '#818cf8' },
  { name: 'Sunset', primary: '#fb923c', secondary: '#f87171' },
  { name: 'Rose', primary: '#fb7185', secondary: '#c084fc' },
];

const FONT_OPTIONS = ['Inter', 'Poppins', 'Roboto', 'Nunito', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro'];

export default function WhiteLabelingSection() {
  const { activeSubNav } = useNavigationStore();
  const { schoolId } = useAuthStore();
  const containerRef = useStaggerAnimate([activeSubNav]);

  /* ── API hooks ── */
  const { data: schoolData } = useSchool(schoolId);
  const brandingMutation = useUpdateBranding(schoolId ?? '');

  const [brand, setBrand] = useState({ ...DEFAULT_BRAND });
  const [dirty, setDirty] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Hydrate from API when school data loads
  useEffect(() => {
    if (schoolData && !initialized) {
      const s = schoolData as unknown as Record<string, unknown>;
      const branding = (s.branding ?? s) as Record<string, unknown>;
      setBrand(prev => ({
        ...prev,
        ...(branding.primaryColor ? { primaryColor: String(branding.primaryColor) } : {}),
        ...(branding.secondaryColor ? { secondaryColor: String(branding.secondaryColor) } : {}),
        ...(branding.logo ? { logoUrl: String(branding.logo) } : {}),
        ...(branding.name ? { appName: String(branding.name) } : {}),
      }));
      setInitialized(true);
    }
  }, [schoolData, initialized]);

  // Map nav subnav ids to tab values
  const tabValue = activeSubNav === 'login_page' ? 'domain' : 'branding';

  const update = (field: string, value: unknown) => { setBrand(p => ({ ...p, [field]: value })); setDirty(true); };

  const handleSave = useCallback(async () => {
    try {
      await brandingMutation.mutateAsync({
        logo: brand.logoUrl || undefined,
        primaryColor: brand.primaryColor,
        secondaryColor: brand.secondaryColor,
      });
      setDirty(false);
      notifySuccess('Branding saved successfully');
    } catch {
      notifyError('Failed to save branding');
    }
  }, [brand, brandingMutation]);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div data-animate className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="size-5 text-violet-400" />
          <h2 className="text-lg font-bold text-white/90">White-Labeling</h2>
          {dirty && <Badge className="border-0 bg-amber-400/10 text-amber-400 text-[10px] ml-2">Unsaved</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/70 gap-1.5" onClick={() => { setBrand({ ...DEFAULT_BRAND }); setDirty(false); }}>
            <RotateCcw className="size-3" /> Reset
          </Button>
          <Button size="sm" className="bg-indigo-500/80 hover:bg-indigo-500 text-white text-xs gap-1.5" disabled={!dirty || brandingMutation.isPending} onClick={handleSave}>
            {brandingMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />} {brandingMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={tabValue} defaultValue="branding" className="w-full">
        <TabsList data-animate className="bg-white/3 border border-white/6 p-0.5">
          <TabsTrigger value="branding" className="data-[state=active]:bg-white/8 text-xs gap-1.5"><Palette className="size-3" />Branding</TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-white/8 text-xs gap-1.5"><Image className="size-3" />Assets</TabsTrigger>
          <TabsTrigger value="domain" className="data-[state=active]:bg-white/8 text-xs gap-1.5"><Globe className="size-3" />Domain</TabsTrigger>
          <TabsTrigger value="typography" className="data-[state=active]:bg-white/8 text-xs gap-1.5"><Type className="size-3" />Typography</TabsTrigger>
        </TabsList>

        {/* BRANDING TAB */}
        <TabsContent value="branding" className="mt-4 flex flex-col gap-4">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-sm">Color Scheme</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map(key => (
                  <div key={key}>
                    <Label className="text-white/50 text-xs mb-1.5 block capitalize">{key.replace('Color', ' Color')}</Label>
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-md border border-white/10" style={{ backgroundColor: brand[key] }} />
                      <Input value={brand[key]} onChange={e => update(key, e.target.value)} className="bg-white/3 border-white/6 text-white/70 text-xs h-8 font-mono" />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <Label className="text-white/50 text-xs mb-2 block">Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map(p => (
                    <button key={p.name} onClick={() => { update('primaryColor', p.primary); update('secondaryColor', p.secondary); }} className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] transition-colors', brand.primaryColor === p.primary ? 'border-white/20 bg-white/5 text-white/70' : 'border-white/6 text-white/30 hover:border-white/10')}>
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: p.secondary }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-sm">App Identity</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/50 text-xs mb-1.5 block">App Name</Label>
                <Input value={brand.appName} onChange={e => update('appName', e.target.value)} className="bg-white/3 border-white/6 text-white/70 text-xs h-8" />
              </div>
              <div>
                <Label className="text-white/50 text-xs mb-1.5 block">Tagline</Label>
                <Input value={brand.tagline} onChange={e => update('tagline', e.target.value)} className="bg-white/3 border-white/6 text-white/70 text-xs h-8" />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><Eye className="size-4 text-indigo-400" />Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border border-white/6 bg-black/30 p-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: brand.primaryColor }}>{brand.appName[0]}</div>
                  <span className="font-bold text-white/80 text-sm" style={{ fontFamily: brand.fontFamily }}>{brand.appName}</span>
                </div>
                <span className="text-[10px] text-white/30">{brand.tagline}</span>
                <div className="flex gap-2 mt-2">
                  <div className="h-6 rounded-md px-3 flex items-center text-[10px] text-white" style={{ backgroundColor: brand.primaryColor }}>Primary</div>
                  <div className="h-6 rounded-md px-3 flex items-center text-[10px] text-white" style={{ backgroundColor: brand.secondaryColor }}>Secondary</div>
                  <div className="h-6 rounded-md px-3 flex items-center text-[10px] text-black/70" style={{ backgroundColor: brand.accentColor }}>Accent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASSETS TAB */}
        <TabsContent value="assets" className="mt-4 flex flex-col gap-4">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-sm">Logo & Favicon</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{ label: 'Logo', key: 'logoUrl', hint: 'Recommended: 200×50 SVG or PNG' }, { label: 'Favicon', key: 'faviconUrl', hint: '32×32 ICO or PNG' }].map(a => (
                <div key={a.key}>
                  <Label className="text-white/50 text-xs mb-1.5 block">{a.label}</Label>
                  <div className="rounded-lg border-2 border-dashed border-white/6 bg-white/2 p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-white/10 transition-colors">
                    <Upload className="size-5 text-white/20" />
                    <span className="text-[10px] text-white/30">Drop file or click to upload</span>
                    <span className="text-[9px] text-white/15">{a.hint}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DOMAIN TAB */}
        <TabsContent value="domain" className="mt-4 flex flex-col gap-4">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-sm">Custom Domain</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label className="text-white/50 text-xs mb-1.5 block">Domain Name</Label>
                <Input value={brand.customDomain} onChange={e => update('customDomain', e.target.value)} placeholder="school.yourdomain.com" className="bg-white/3 border-white/6 text-white/70 text-xs h-8" />
              </div>
              <div className="rounded-lg border border-white/6 bg-white/2 p-3 text-[10px] text-white/30 space-y-1.5">
                <p className="font-medium text-white/40">Setup Instructions</p>
                <p>1. Add a CNAME record pointing to <code className="bg-white/5 rounded px-1 text-indigo-400">app.growyourneed.com</code></p>
                <p>2. SSL certificate will be auto-provisioned once DNS propagates.</p>
                <p>3. Allow up to 24 hours for full propagation.</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={brand.showPoweredBy} onCheckedChange={v => update('showPoweredBy', v)} />
                <span className="text-xs text-white/50">Show &quot;Powered by GROW YouR NEED&quot; badge</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TYPOGRAPHY TAB */}
        <TabsContent value="typography" className="mt-4 flex flex-col gap-4">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-sm">Font Settings</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label className="text-white/50 text-xs mb-2 block">Font Family</Label>
                <div className="flex flex-wrap gap-2">
                  {FONT_OPTIONS.map(f => (
                    <button key={f} onClick={() => update('fontFamily', f)} className={cn('rounded-md border px-3 py-1.5 text-xs transition-colors', brand.fontFamily === f ? 'border-indigo-400/30 bg-indigo-400/10 text-indigo-400' : 'border-white/6 text-white/30 hover:border-white/10')} style={{ fontFamily: f }}>{f}</button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-white/50 text-xs mb-2 block">Theme Mode</Label>
                <div className="flex gap-2">
                  {[{ v: true, icon: <Moon className="size-3" />, label: 'Dark' }, { v: false, icon: <Sun className="size-3" />, label: 'Light' }].map(m => (
                    <button key={String(m.v)} onClick={() => update('darkMode', m.v)} className={cn('flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors', brand.darkMode === m.v ? 'border-indigo-400/30 bg-indigo-400/10 text-indigo-400' : 'border-white/6 text-white/30 hover:border-white/10')}>
                      {m.icon}{m.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
