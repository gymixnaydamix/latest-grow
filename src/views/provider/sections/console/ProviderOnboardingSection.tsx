/* ─── ProviderOnboardingSection ─── Pipeline · Wizard · Blockers ─── */
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Loader2,
  Rocket,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderModuleData,
  useUpdateOnboardingTask,
  useProviderOnboarding,
  useLaunchOnboarding,
} from '@/hooks/api/use-provider-console';
import {
  EmptyState,
  Panel,
  SectionPageHeader,
  SectionShell,
  StatCard,
  StatusBadge,
  getAccent,
  reasonPrompt,
} from './shared';
import {
  type WizardFormData,
  INITIAL_WIZARD_DATA,
  TenantInfoStep,
  PlanSelectionStep,
  ModuleConfigStep,
  DataMigrationStep,
  ReviewLaunchStep,
  validateStep,
} from './onboarding-wizard-steps';

type OnboardingTask = Record<string, unknown>;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Main export                                                    */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderOnboardingSection() {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'onboarding_wizard':
      return <WizardView />;
    case 'onboarding_pipeline':
      return <PipelineView />;
    case 'onboarding_blockers':
      return <BlockersView />;
    default:
      return <PipelineView />;
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Pipeline (Kanban)                                    */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function PipelineView() {
  const moduleQuery = useProviderModuleData();
  const updateTask = useUpdateOnboardingTask();

  const onboardingTasks = (moduleQuery.data?.onboardingTasks ?? []) as OnboardingTask[];
  const accent = getAccent('provider_onboarding');

  const stageGroups = useMemo(() => {
    const stages = ['PROVISIONING', 'DATA_IMPORT', 'TRAINING', 'LIVE', 'BLOCKED'];
    const map = new Map<string, OnboardingTask[]>();
    for (const s of stages) map.set(s, []);
    for (const t of onboardingTasks) {
      const s = String(t.stage ?? 'PROVISIONING');
      if (!map.has(s)) map.set(s, []);
      map.get(s)!.push(t);
    }
    return map;
  }, [onboardingTasks]);

  const stageColors: Record<string, string> = {
    PROVISIONING: 'border-teal-500/30 bg-teal-500/5',
    DATA_IMPORT: 'border-blue-500/30 bg-blue-500/5',
    TRAINING: 'border-violet-500/30 bg-violet-500/5',
    LIVE: 'border-emerald-500/30 bg-emerald-500/5',
    BLOCKED: 'border-red-500/30 bg-red-500/5',
  };
  const stageTextColors: Record<string, string> = {
    PROVISIONING: 'text-teal-300',
    DATA_IMPORT: 'text-blue-300',
    TRAINING: 'text-violet-300',
    LIVE: 'text-emerald-300',
    BLOCKED: 'text-red-300',
  };

  return (
    <SectionShell>
      <SectionPageHeader
        icon={Handshake}
        title="Onboarding Pipeline"
        description="Pipeline stages — lead → provisioning → import → training → go-live"
        accent={accent}
        actions={
          <Button size="sm" className="h-7 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30" onClick={() => useNavigationStore.getState().setHeader('onboarding_wizard')}>
            <Sparkles className="mr-1 size-3" />New Onboarding
          </Button>
        }
      />

      {/* KPI strip */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
        {Array.from(stageGroups.entries()).map(([stage, tasks]) => (
          <StatCard
            key={stage}
            label={stage.replace('_', ' ')}
            value={String(tasks.length)}
            sub={`${tasks.filter((t) => String(t.status) === 'DONE').length} completed`}
            gradient={
              stage === 'BLOCKED'
                ? 'from-red-500/10 to-red-500/5'
                : stage === 'LIVE'
                  ? 'from-emerald-500/10 to-emerald-500/5'
                  : 'from-teal-500/10 to-teal-500/5'
            }
          />
        ))}
      </div>

      {/* Kanban columns */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from(stageGroups.entries()).map(([stage, tasks]) => (
          <div key={stage} className={`rounded-2xl border ${stageColors[stage] ?? 'border-slate-500/20 bg-slate-900/70'} p-3`}>
            <h4 className={`mb-2 text-xs font-bold uppercase tracking-widest ${stageTextColors[stage] ?? 'text-slate-300'}`}>
              {stage.replace('_', ' ')} <span className="ml-1 text-slate-400">({tasks.length})</span>
            </h4>
            <div className="space-y-2">
              {tasks.slice(0, 10).map((task) => (
                <div key={String(task.id)} className="rounded-lg border border-slate-500/20 bg-slate-800/70 p-2 text-xs">
                  <p className="font-semibold text-slate-100">{String(task.title)}</p>
                  <p className="text-slate-400">{String(task.tenantId)}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <StatusBadge status={String(task.status ?? 'PENDING')} />
                    {String(task.status) !== 'DONE' && (
                      <Button
                        size="sm"
                        className="h-6 bg-teal-500/20 text-[10px] text-teal-100 hover:bg-teal-500/30"
                        onClick={() => {
                          const reason = reasonPrompt(`Complete task ${String(task.id)}`);
                          if (!reason) return;
                          updateTask.mutate({ taskId: String(task.id), status: 'DONE', reason });
                        }}
                      >
                        <CheckCircle2 className="mr-1 size-3" />Done
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-[10px] text-slate-400">Empty</p>}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Wizard (New tenant onboarding)                       */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function WizardView() {
  const accent = getAccent('provider_onboarding');
  const { data: onboarding, isLoading } = useProviderOnboarding();
  const launchMutation = useLaunchOnboarding();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_WIZARD_DATA);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  const steps = [
    { label: 'Tenant Info', description: 'School name, domain, country, admin contact' },
    { label: 'Plan Selection', description: 'Choose pricing plan and billing cycle' },
    { label: 'Module Config', description: 'Enable/disable platform modules' },
    { label: 'Data Migration', description: 'Import students, teachers, courses' },
    { label: 'Review & Launch', description: 'Confirm settings and go live' },
  ];
  const wizardHeaderTitleClassName = 'text-sm text-slate-900';
  const wizardHeaderDescriptionClassName = 'text-[11px] text-slate-500';

  /* Pre-populate form from the first in-progress pipeline card if available */
  const pipelineCards = onboarding?.pipeline ?? [];
  const activePipeline = pipelineCards.find((c) => (c as any).status === 'IN_PROGRESS') as Record<string, unknown> | undefined;
  const activeTenantName = activePipeline?.tenantName as string | undefined;
  useEffect(() => {
    if (activeTenantName && !formData.schoolName) {
      setFormData((prev) => ({
        ...prev,
        schoolName: activeTenantName ?? prev.schoolName,
        country: (activePipeline?.country as string) ?? prev.country,
      }));
    }
  }, [activeTenantName]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepperActions = (
    <div className="flex w-full min-w-0 gap-1 overflow-x-auto pb-1 xl:justify-end">
      {steps.map((s, i) => (
        <button
          key={s.label}
          onClick={() => { setValidationError(null); setStep(i); }}
          className={`min-w-[148px] shrink-0 rounded-lg border px-2 py-1.5 text-left transition-all xl:min-w-[156px] ${
            i === step
              ? 'border-teal-300 bg-teal-50 ring-1 ring-teal-100'
              : i < step
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold xl:size-6 xl:text-[10px] ${
              i === step ? 'bg-teal-500 text-white' : i < step ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {i < step ? '✓' : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold leading-none text-slate-900 xl:text-[11px]">{s.label}</p>
              <p className="mt-0.5 truncate text-[9px] leading-tight text-slate-500 xl:text-[10px]">{s.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  const goNext = useCallback(() => {
    const err = validateStep(step, formData);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }, [step, formData, steps.length]);

  const goPrev = useCallback(() => {
    setValidationError(null);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleLaunch = useCallback(() => {
    const err = validateStep(step, formData);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    launchMutation.mutate(
      {
        schoolName: formData.schoolName,
        domain: formData.domain,
        country: formData.country,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        planCode: formData.planCode,
        billingCycle: formData.billingCycle,
        enabledModules: formData.enabledModules,
        skipMigration: formData.skipMigration,
        agreedToTerms: formData.agreedToTerms,
      },
      {
        onSuccess: () => {
          setLaunchSuccess(true);
        },
      },
    );
  }, [step, formData, launchMutation]);

  if (isLoading) {
    return (
      <SectionShell>
        <SectionPageHeader
          icon={Sparkles}
          title="Onboarding Wizard"
          description="Step-by-step new tenant provisioning"
          accent={accent}
          className="border-slate-200 bg-white ring-slate-200/80 shadow-sm"
          titleClassName={wizardHeaderTitleClassName}
          descriptionClassName={wizardHeaderDescriptionClassName}
        />
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-amber-400" /></div>
      </SectionShell>
    );
  }

  if (launchSuccess) {
    return (
      <SectionShell>
        <SectionPageHeader
          icon={Sparkles}
          title="Onboarding Wizard"
          description="Step-by-step new tenant provisioning"
          accent={accent}
          className="border-slate-200 bg-white ring-slate-200/80 shadow-sm"
          titleClassName={wizardHeaderTitleClassName}
          descriptionClassName={wizardHeaderDescriptionClassName}
        />
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 py-16">
          <CheckCircle2 className="size-16 text-emerald-500" />
          <h3 className="text-lg font-bold text-emerald-800">Tenant Launched Successfully!</h3>
          <p className="max-w-md text-center text-sm text-emerald-600">
            <strong>{formData.schoolName}</strong> has been provisioned at{' '}
            <span className="font-mono">{formData.domain}.growyourneed.com</span>.
            The admin ({formData.adminEmail}) will receive setup instructions shortly.
          </p>
          <Button
            size="sm"
            className="mt-2 h-8 bg-teal-600 text-white hover:bg-teal-700"
            onClick={() => { setFormData(INITIAL_WIZARD_DATA); setStep(0); setLaunchSuccess(false); }}
          >
            <Sparkles className="mr-1 size-3" />Onboard Another Tenant
          </Button>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell>
      <SectionPageHeader
        icon={Sparkles}
        title="Onboarding Wizard"
        description="Step-by-step new tenant provisioning"
        accent={accent}
        className="border-slate-200 bg-white ring-slate-200/80 shadow-sm"
        contentClassName="flex-col gap-3 xl:flex-row xl:items-center"
        actionsClassName="w-full min-w-0 justify-start xl:flex-1 xl:justify-end"
        actions={stepperActions}
        titleClassName={wizardHeaderTitleClassName}
        descriptionClassName={wizardHeaderDescriptionClassName}
      />

      {/* Stepper */}
      <div className="hidden flex-wrap gap-1.5 sm:gap-2">
        {steps.map((s, i) => (
          <button
            key={s.label}
            onClick={() => { setValidationError(null); setStep(i); }}
            className={`flex-[1_1_220px] rounded-lg border px-2.5 py-2 text-left transition-all sm:flex-[1_1_240px] sm:px-3 ${
              i === step
                ? 'border-teal-400/50 bg-teal-500/10 ring-1 ring-teal-500/20'
                : i < step
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-slate-500/20 bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold sm:size-6 sm:text-[10px] ${
                i === step ? 'bg-teal-500 text-white' : i < step ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <p className="text-[11px] font-semibold leading-none text-slate-100 sm:text-xs">{s.label}</p>
                  <p className="text-[10px] leading-tight text-slate-400">{s.description}</p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Step content — real form components */}
      <Panel
        title={steps[step].label}
        subtitle={steps[step].description}
        accentBorder="border-teal-500/20"
        className="bg-white shadow-sm"
        headerClassName="border-slate-200"
        titleClassName="text-slate-900"
        subtitleClassName="text-slate-500"
      >
        {/* Step body */}
        {step === 0 && <TenantInfoStep data={formData} setData={setFormData} />}
        {step === 1 && <PlanSelectionStep data={formData} setData={setFormData} />}
        {step === 2 && <ModuleConfigStep data={formData} setData={setFormData} />}
        {step === 3 && <DataMigrationStep data={formData} setData={setFormData} />}
        {step === 4 && <ReviewLaunchStep data={formData} setData={setFormData} isLaunching={launchMutation.isPending} />}

        {/* Validation error */}
        {validationError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {validationError}
          </div>
        )}

        {/* Launch error */}
        {launchMutation.isError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            Launch failed: {(launchMutation.error as Error)?.message ?? 'Unknown error'}. Please try again.
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            {step > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={goPrev}
              >
                <ChevronLeft className="mr-1 size-3" />Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step < steps.length - 1 ? (
              <Button size="sm" className="h-8 bg-teal-600 text-white hover:bg-teal-700" onClick={goNext}>
                Next Step<ChevronRight className="ml-1 size-3" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-8 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={handleLaunch}
                disabled={launchMutation.isPending || !formData.agreedToTerms}
              >
                {launchMutation.isPending ? (
                  <><Loader2 className="mr-1 size-3 animate-spin" />Launching…</>
                ) : (
                  <><Rocket className="mr-1 size-3" />Launch Tenant</>
                )}
              </Button>
            )}
          </div>
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Blockers                                              */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function BlockersView() {
  const moduleQuery = useProviderModuleData();
  const updateTask = useUpdateOnboardingTask();
  const accent = getAccent('provider_onboarding');

  const onboardingTasks = (moduleQuery.data?.onboardingTasks ?? []) as OnboardingTask[];
  const blockedTasks = onboardingTasks.filter((t) => String(t.stage) === 'BLOCKED' || String(t.status) === 'BLOCKED');
  const pendingTasks = onboardingTasks.filter((t) => String(t.status) === 'PENDING' || String(t.status) === 'IN_PROGRESS');

  return (
    <SectionShell>
      <SectionPageHeader
        icon={AlertTriangle}
        title="Onboarding Blockers"
        description="Tasks stuck or requiring intervention"
        accent={accent}
      />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Blocked" value={String(blockedTasks.length)} sub="Requires attention" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="In Progress" value={String(pendingTasks.length)} sub="Currently working" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Total Tasks" value={String(onboardingTasks.length)} sub="All onboarding items" gradient="from-teal-500/10 to-teal-500/5" />
      </div>

      <Panel title="Blocked Tasks" subtitle={`${blockedTasks.length} tasks blocked`} accentBorder="border-red-500/20">
        <div className="space-y-2">
          {blockedTasks.map((task) => (
            <div key={String(task.id)} className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-red-100">{String(task.title)}</p>
                  <p className="text-red-300/70">Tenant: {String(task.tenantId)} · Blocker: {String(task.blockerCode ?? 'Unknown')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status="BLOCKED" />
                  <Button
                    size="sm"
                    className="h-6 bg-emerald-500/20 text-[10px] text-emerald-100 hover:bg-emerald-500/30"
                    onClick={() => {
                      const reason = reasonPrompt(`Unblock task ${String(task.id)}`);
                      if (!reason) return;
                      updateTask.mutate({ taskId: String(task.id), status: 'PENDING', blockerCode: null, reason });
                    }}
                  >
                    Unblock
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {blockedTasks.length === 0 && <EmptyState icon={CheckCircle2} title="No Blockers" description="All onboarding tasks are progressing normally." />}
        </div>
      </Panel>
    </SectionShell>
  );
}
