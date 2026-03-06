function parseEnabledFlag(raw: string | undefined): boolean {
  if (!raw) return true;
  return !['0', 'false', 'off', 'no'].includes(raw.toLowerCase());
}

function readParentPortalFlagFromEnv(): string | undefined {
  try {
    const viteEnv = (0, eval)('import.meta.env') as Record<string, unknown> | undefined;
    const viteRaw = viteEnv?.VITE_PARENT_PORTAL_V2;
    if (typeof viteRaw === 'string') return viteRaw;
    if (typeof viteRaw === 'number' || typeof viteRaw === 'boolean') return String(viteRaw);
  } catch {
    // no-op for non-vite runtimes
  }

  const maybeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  if (maybeProcess?.env) return maybeProcess.env.VITE_PARENT_PORTAL_V2;

  return undefined;
}

export function isParentPortalV2EnabledByDefault(): boolean {
  return parseEnabledFlag(readParentPortalFlagFromEnv());
}
