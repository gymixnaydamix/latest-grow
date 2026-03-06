function parseEnabledFlag(raw: string | undefined): boolean {
  if (!raw) return true;
  return !['0', 'false', 'off', 'no'].includes(raw.toLowerCase());
}

function readOverlayFlagFromEnv(): string | undefined {
  try {
    const viteEnv = (0, eval)('import.meta.env') as Record<string, unknown> | undefined;
    const viteRaw = viteEnv?.VITE_OVERLAY_V2;
    if (typeof viteRaw === 'string') return viteRaw;
    if (typeof viteRaw === 'number' || typeof viteRaw === 'boolean') return String(viteRaw);
  } catch {
    // no-op: runtime may not support import.meta (e.g., Jest CJS)
  }

  const maybeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  if (maybeProcess?.env) return maybeProcess.env.VITE_OVERLAY_V2;

  return undefined;
}

export function isOverlayV2EnabledByDefault(): boolean {
  return parseEnabledFlag(readOverlayFlagFromEnv());
}
