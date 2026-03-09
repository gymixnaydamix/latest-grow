import { useId, type ReactNode } from 'react';

export interface ProviderSidebarIconProps {
  className?: string;
}

type Palette = {
  topStart: string;
  topEnd: string;
  sideStart: string;
  sideEnd: string;
  rim: string;
  glow: string;
  shadow: string;
  glyph: string;
  accent: string;
  highlight: string;
};

function ProviderIconTile({
  className,
  palette,
  children,
}: ProviderSidebarIconProps & {
  palette: Palette;
  children: ReactNode;
}) {
  const uid = useId().replace(/:/g, '');
  const topId = `${uid}-top`;
  const leftId = `${uid}-left`;
  const rightId = `${uid}-right`;
  const glowId = `${uid}-glow`;

  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={topId} x1="8" y1="7" x2="24" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.topStart} />
          <stop offset="100%" stopColor={palette.topEnd} />
        </linearGradient>
        <linearGradient id={leftId} x1="6.5" y1="9.5" x2="16" y2="24.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.sideStart} />
          <stop offset="100%" stopColor={palette.sideEnd} />
        </linearGradient>
        <linearGradient id={rightId} x1="16" y1="14.25" x2="26" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.topEnd} />
          <stop offset="100%" stopColor={palette.sideEnd} />
        </linearGradient>
        <radialGradient id={glowId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(16 16) rotate(90) scale(8 10.5)">
          <stop offset="0%" stopColor={palette.glow} stopOpacity="0.65" />
          <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="16" cy="26.8" rx="10" ry="2.6" fill={palette.shadow} opacity="0.42" />
      <ellipse cx="16" cy="16.2" rx="7.4" ry="4.9" fill={`url(#${glowId})`} />

      <path d="M16 4.8L25.5 9.5L16 14.25L6.5 9.5L16 4.8Z" fill={`url(#${topId})`} />
      <path d="M6.5 9.5L16 14.25V24.5L6.5 19.75V9.5Z" fill={`url(#${leftId})`} />
      <path d="M25.5 9.5L16 14.25V24.5L25.5 19.75V9.5Z" fill={`url(#${rightId})`} />

      <path d="M16 4.8L25.5 9.5L16 14.25L6.5 9.5L16 4.8Z" stroke={palette.rim} strokeWidth="0.9" />
      <path d="M6.5 9.5L16 14.25V24.5L6.5 19.75V9.5Z" stroke="rgba(255,255,255,0.16)" strokeWidth="0.75" />
      <path d="M25.5 9.5L16 14.25V24.5L25.5 19.75V9.5Z" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />

      <path d="M10 11.15L16 8.2L22 11.15L16 14.15L10 11.15Z" fill="rgba(255,255,255,0.12)" />
      <path d="M10 11.15L16 8.2L22 11.15" stroke="rgba(255,255,255,0.45)" strokeWidth="0.7" strokeLinecap="round" />
      <path d="M10.6 10.9H21.4" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" strokeLinecap="round" />

      {children}
    </svg>
  );
}

function makeProviderIcon(palette: Palette, glyph: (palette: Palette) => ReactNode) {
  return function ProviderSidebarIcon({ className }: ProviderSidebarIconProps) {
    return (
      <ProviderIconTile className={className} palette={palette}>
        {glyph(palette)}
      </ProviderIconTile>
    );
  };
}

const homePalette: Palette = {
  topStart: '#60a5fa',
  topEnd: '#2563eb',
  sideStart: '#1d4ed8',
  sideEnd: '#1e3a8a',
  rim: '#bfdbfe',
  glow: '#93c5fd',
  shadow: '#1e40af',
  glyph: '#eff6ff',
  accent: '#7dd3fc',
  highlight: '#ffffff',
};

const tenantPalette: Palette = {
  topStart: '#6ee7b7',
  topEnd: '#10b981',
  sideStart: '#059669',
  sideEnd: '#065f46',
  rim: '#d1fae5',
  glow: '#6ee7b7',
  shadow: '#065f46',
  glyph: '#f0fdf4',
  accent: '#a7f3d0',
  highlight: '#ffffff',
};

const onboardingPalette: Palette = {
  topStart: '#5eead4',
  topEnd: '#14b8a6',
  sideStart: '#0f766e',
  sideEnd: '#134e4a',
  rim: '#ccfbf1',
  glow: '#5eead4',
  shadow: '#115e59',
  glyph: '#f0fdfa',
  accent: '#99f6e4',
  highlight: '#ffffff',
};

const billingPalette: Palette = {
  topStart: '#fcd34d',
  topEnd: '#f59e0b',
  sideStart: '#d97706',
  sideEnd: '#92400e',
  rim: '#fef3c7',
  glow: '#fde68a',
  shadow: '#92400e',
  glyph: '#fffbeb',
  accent: '#fde68a',
  highlight: '#ffffff',
};

const supportPalette: Palette = {
  topStart: '#c4b5fd',
  topEnd: '#8b5cf6',
  sideStart: '#7c3aed',
  sideEnd: '#4c1d95',
  rim: '#ede9fe',
  glow: '#c4b5fd',
  shadow: '#5b21b6',
  glyph: '#faf5ff',
  accent: '#ddd6fe',
  highlight: '#ffffff',
};

const incidentPalette: Palette = {
  topStart: '#fda4af',
  topEnd: '#ef4444',
  sideStart: '#dc2626',
  sideEnd: '#7f1d1d',
  rim: '#ffe4e6',
  glow: '#fda4af',
  shadow: '#991b1b',
  glyph: '#fff1f2',
  accent: '#fecdd3',
  highlight: '#ffffff',
};

const releasePalette: Palette = {
  topStart: '#f0abfc',
  topEnd: '#d946ef',
  sideStart: '#a21caf',
  sideEnd: '#701a75',
  rim: '#fae8ff',
  glow: '#f5d0fe',
  shadow: '#86198f',
  glyph: '#fdf4ff',
  accent: '#f5d0fe',
  highlight: '#ffffff',
};

const integrationPalette: Palette = {
  topStart: '#67e8f9',
  topEnd: '#06b6d4',
  sideStart: '#0891b2',
  sideEnd: '#164e63',
  rim: '#cffafe',
  glow: '#67e8f9',
  shadow: '#155e75',
  glyph: '#ecfeff',
  accent: '#a5f3fc',
  highlight: '#ffffff',
};

const securityPalette: Palette = {
  topStart: '#93c5fd',
  topEnd: '#6366f1',
  sideStart: '#4f46e5',
  sideEnd: '#312e81',
  rim: '#dbeafe',
  glow: '#a5b4fc',
  shadow: '#3730a3',
  glyph: '#eef2ff',
  accent: '#c7d2fe',
  highlight: '#ffffff',
};

const dataOpsPalette: Palette = {
  topStart: '#fdba74',
  topEnd: '#f97316',
  sideStart: '#ea580c',
  sideEnd: '#7c2d12',
  rim: '#ffedd5',
  glow: '#fdba74',
  shadow: '#9a3412',
  glyph: '#fff7ed',
  accent: '#fed7aa',
  highlight: '#ffffff',
};

const teamPalette: Palette = {
  topStart: '#a5b4fc',
  topEnd: '#6366f1',
  sideStart: '#4f46e5',
  sideEnd: '#312e81',
  rim: '#e0e7ff',
  glow: '#c7d2fe',
  shadow: '#3730a3',
  glyph: '#eef2ff',
  accent: '#c7d2fe',
  highlight: '#ffffff',
};

const settingsPalette: Palette = {
  topStart: '#cbd5e1',
  topEnd: '#64748b',
  sideStart: '#475569',
  sideEnd: '#1e293b',
  rim: '#e2e8f0',
  glow: '#cbd5e1',
  shadow: '#334155',
  glyph: '#f8fafc',
  accent: '#e2e8f0',
  highlight: '#ffffff',
};

const auditPalette: Palette = {
  topStart: '#fde68a',
  topEnd: '#eab308',
  sideStart: '#ca8a04',
  sideEnd: '#713f12',
  rim: '#fef9c3',
  glow: '#fde68a',
  shadow: '#854d0e',
  glyph: '#fefce8',
  accent: '#fef08a',
  highlight: '#ffffff',
};

const analyticsPalette: Palette = {
  topStart: '#93c5fd',
  topEnd: '#3b82f6',
  sideStart: '#2563eb',
  sideEnd: '#1e3a8a',
  rim: '#dbeafe',
  glow: '#93c5fd',
  shadow: '#1d4ed8',
  glyph: '#eff6ff',
  accent: '#bfdbfe',
  highlight: '#ffffff',
};

const commsPalette: Palette = {
  topStart: '#5eead4',
  topEnd: '#0d9488',
  sideStart: '#0f766e',
  sideEnd: '#134e4a',
  rim: '#ccfbf1',
  glow: '#5eead4',
  shadow: '#115e59',
  glyph: '#f0fdfa',
  accent: '#99f6e4',
  highlight: '#ffffff',
};

const notificationPalette: Palette = {
  topStart: '#fde68a',
  topEnd: '#f59e0b',
  sideStart: '#d97706',
  sideEnd: '#78350f',
  rim: '#fef3c7',
  glow: '#fcd34d',
  shadow: '#92400e',
  glyph: '#fffbeb',
  accent: '#fde68a',
  highlight: '#ffffff',
};

const brandingPalette: Palette = {
  topStart: '#f9a8d4',
  topEnd: '#ec4899',
  sideStart: '#db2777',
  sideEnd: '#831843',
  rim: '#fce7f3',
  glow: '#f9a8d4',
  shadow: '#9d174d',
  glyph: '#fdf2f8',
  accent: '#fbcfe8',
  highlight: '#ffffff',
};

const apiPalette: Palette = {
  topStart: '#7dd3fc',
  topEnd: '#0ea5e9',
  sideStart: '#0284c7',
  sideEnd: '#0c4a6e',
  rim: '#e0f2fe',
  glow: '#7dd3fc',
  shadow: '#0369a1',
  glyph: '#f0f9ff',
  accent: '#bae6fd',
  highlight: '#ffffff',
};

const backupPalette: Palette = {
  topStart: '#86efac',
  topEnd: '#22c55e',
  sideStart: '#16a34a',
  sideEnd: '#14532d',
  rim: '#dcfce7',
  glow: '#86efac',
  shadow: '#166534',
  glyph: '#f0fdf4',
  accent: '#bbf7d0',
  highlight: '#ffffff',
};

const aiPalette: Palette = {
  topStart: '#c084fc',
  topEnd: '#7c3aed',
  sideStart: '#6d28d9',
  sideEnd: '#3b0764',
  rim: '#f3e8ff',
  glow: '#d8b4fe',
  shadow: '#581c87',
  glyph: '#faf5ff',
  accent: '#e9d5ff',
  highlight: '#ffffff',
};

export const IconProviderHome3D = makeProviderIcon(homePalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 16.3L16 12.8L20.5 16.3" stroke={p.accent} strokeWidth="3.8" opacity="0.22" />
    <path d="M11.5 16.3L16 12.8L20.5 16.3" stroke={p.glyph} strokeWidth="1.8" />
    <path d="M13 15.9V20H19V15.9" fill={p.accent} fillOpacity="0.16" stroke={p.glyph} strokeWidth="1.4" />
    <path d="M15.2 20V17.4H16.8V20" fill={p.highlight} fillOpacity="0.92" />
  </g>
));

export const IconProviderTenants3D = makeProviderIcon(tenantPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.8 19.6H20.2" stroke={p.accent} strokeWidth="3.6" opacity="0.2" />
    <path d="M12.4 19.6V13.2H19.6V19.6" fill={p.accent} fillOpacity="0.16" stroke={p.glyph} strokeWidth="1.4" />
    <path d="M14.2 13.2V11.4H17.8V13.2" stroke={p.glyph} strokeWidth="1.3" />
    <path d="M14.6 15.8H15.4M16.6 15.8H17.4M14.6 17.7H15.4M16.6 17.7H17.4" stroke={p.highlight} strokeWidth="1.05" />
  </g>
));

export const IconProviderOnboarding3D = makeProviderIcon(onboardingPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 11.3C18.4 12.1 19.5 14.3 19.1 16.4L16 18.3L12.9 16.4C12.5 14.3 13.6 12.1 16 11.3Z" fill={p.accent} fillOpacity="0.2" stroke={p.glyph} strokeWidth="1.4" />
    <path d="M13.2 18.2L11.6 20.4M18.8 18.2L20.4 20.4" stroke={p.glyph} strokeWidth="1.4" />
    <circle cx="16" cy="14.5" r="1.05" fill={p.highlight} />
    <path d="M16 18.3V20.2" stroke={p.accent} strokeWidth="1.4" />
  </g>
));

export const IconProviderBilling3D = makeProviderIcon(billingPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <rect x="11.4" y="12.8" width="9.2" height="6.6" rx="2" fill={p.accent} fillOpacity="0.18" stroke={p.glyph} strokeWidth="1.35" />
    <path d="M12.3 15.2H19.7" stroke={p.highlight} strokeWidth="1.05" />
    <circle cx="18.2" cy="17.4" r="1.25" fill={p.highlight} fillOpacity="0.92" />
    <path d="M14.1 17.4H16.2" stroke={p.glyph} strokeWidth="1.2" />
  </g>
));

export const IconProviderSupport3D = makeProviderIcon(supportPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.5 16V15A3.5 3.5 0 0 1 19.5 15V16" stroke={p.glyph} strokeWidth="1.6" />
    <rect x="11.4" y="15.8" width="2.1" height="3.6" rx="1" fill={p.accent} fillOpacity="0.22" stroke={p.glyph} strokeWidth="1.2" />
    <rect x="18.5" y="15.8" width="2.1" height="3.6" rx="1" fill={p.accent} fillOpacity="0.22" stroke={p.glyph} strokeWidth="1.2" />
    <path d="M20.2 19.1C19.8 20.2 18.8 21 17.5 21H15.8" stroke={p.highlight} strokeWidth="1.2" />
  </g>
));

export const IconProviderIncidents3D = makeProviderIcon(incidentPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 11.6L20.6 20H11.4L16 11.6Z" fill={p.accent} fillOpacity="0.18" stroke={p.glyph} strokeWidth="1.4" />
    <path d="M16 14.3V17" stroke={p.highlight} strokeWidth="1.3" />
    <circle cx="16" cy="18.6" r="0.9" fill={p.highlight} />
  </g>
));

export const IconProviderReleases3D = makeProviderIcon(releasePalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.1 11.5V20.4" stroke={p.glyph} strokeWidth="1.6" />
    <path d="M13.3 12H19.7L18 14.1L19.7 16.2H13.3Z" fill={p.accent} fillOpacity="0.2" stroke={p.glyph} strokeWidth="1.25" />
    <path d="M13.1 20.4H18.9" stroke={p.highlight} strokeWidth="1.15" />
  </g>
));

export const IconProviderIntegrations3D = makeProviderIcon(integrationPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.2 12.7V14.4M18.8 12.7V14.4" stroke={p.highlight} strokeWidth="1.2" />
    <rect x="12" y="14.4" width="8" height="4.2" rx="1.7" fill={p.accent} fillOpacity="0.18" stroke={p.glyph} strokeWidth="1.35" />
    <path d="M16 18.6V20.7M14 20.7H18" stroke={p.glyph} strokeWidth="1.2" />
  </g>
));

export const IconProviderSecurity3D = makeProviderIcon(securityPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 11.5L20 13V16.6C20 18.8 18.5 20.6 16 21.5C13.5 20.6 12 18.8 12 16.6V13L16 11.5Z" fill={p.accent} fillOpacity="0.18" stroke={p.glyph} strokeWidth="1.35" />
    <rect x="14.2" y="15.7" width="3.6" height="2.9" rx="0.9" fill={p.highlight} fillOpacity="0.18" stroke={p.highlight} strokeWidth="0.9" />
    <path d="M14.9 15.7V15.1A1.1 1.1 0 0 1 17.1 15.1V15.7" stroke={p.highlight} strokeWidth="0.95" />
  </g>
));

export const IconProviderDataOps3D = makeProviderIcon(dataOpsPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="16" cy="13.1" rx="4.6" ry="1.7" fill={p.accent} fillOpacity="0.2" stroke={p.glyph} strokeWidth="1.2" />
    <path d="M11.4 13.1V18.4C11.4 19.3 13.5 20 16 20C18.5 20 20.6 19.3 20.6 18.4V13.1" fill={p.accent} fillOpacity="0.14" stroke={p.glyph} strokeWidth="1.2" />
    <path d="M11.4 15.7C11.4 16.6 13.5 17.3 16 17.3C18.5 17.3 20.6 16.6 20.6 15.7" stroke={p.highlight} strokeWidth="0.95" />
  </g>
));

export const IconProviderTeam3D = makeProviderIcon(teamPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <circle cx="14.1" cy="14.4" r="1.7" fill={p.highlight} fillOpacity="0.9" />
    <circle cx="18.5" cy="15" r="1.35" fill={p.accent} fillOpacity="0.85" />
    <path d="M11.9 19C12.3 17.4 13.4 16.4 15 16.4C16.7 16.4 17.7 17.4 18.1 19" stroke={p.glyph} strokeWidth="1.3" />
    <path d="M17.4 18.9C17.7 17.9 18.5 17.2 19.8 17.2C20.7 17.2 21.4 17.6 21.8 18.4" stroke={p.highlight} strokeWidth="1.05" />
  </g>
));

export const IconProviderSettings3D = makeProviderIcon(settingsPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.2 13.2H20.8M11.2 18.8H20.8" stroke={p.glyph} strokeWidth="1.4" />
    <circle cx="14" cy="13.2" r="1.35" fill={p.highlight} />
    <circle cx="18" cy="18.8" r="1.35" fill={p.accent} />
  </g>
));

export const IconProviderAudit3D = makeProviderIcon(auditPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 11.9H18L20 13.9V20.1H13V11.9Z" fill={p.accent} fillOpacity="0.15" stroke={p.glyph} strokeWidth="1.25" />
    <path d="M18 11.9V13.9H20" stroke={p.highlight} strokeWidth="1" />
    <path d="M14.4 16H18.4M14.4 18H17.4" stroke={p.highlight} strokeWidth="1" />
  </g>
));

export const IconProviderAnalytics3D = makeProviderIcon(analyticsPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.2 18.9V15.8M16 18.9V13.4M19.8 18.9V11.3" stroke={p.glyph} strokeWidth="1.7" />
    <path d="M12.2 15.5L16 13L19.8 11" stroke={p.highlight} strokeWidth="1.15" />
    <circle cx="12.2" cy="15.5" r="0.85" fill={p.highlight} />
    <circle cx="16" cy="13" r="0.85" fill={p.highlight} />
    <circle cx="19.8" cy="11" r="0.85" fill={p.highlight} />
  </g>
));

export const IconProviderComms3D = makeProviderIcon(commsPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.3 16.2L18.1 13.7V19L12.3 16.7V16.2Z" fill={p.accent} fillOpacity="0.18" stroke={p.glyph} strokeWidth="1.3" />
    <path d="M18.1 14.2C19.1 14.2 19.9 13.6 20.5 12.9V19.7C19.9 19 19.1 18.4 18.1 18.4" stroke={p.glyph} strokeWidth="1.2" />
    <path d="M20.9 14.2C21.8 15 21.8 17.6 20.9 18.4" stroke={p.highlight} strokeWidth="1" />
  </g>
));

export const IconProviderNotifications3D = makeProviderIcon(notificationPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 12.1C14.1 12.1 13 13.7 13 15.8V17.2L12 18.8H20L19 17.2V15.8C19 13.7 17.9 12.1 16 12.1Z" fill={p.accent} fillOpacity="0.18" stroke={p.glyph} strokeWidth="1.3" />
    <path d="M14.7 20C15 20.7 15.4 21 16 21C16.6 21 17 20.7 17.3 20" stroke={p.highlight} strokeWidth="1.05" />
  </g>
));

export const IconProviderBranding3D = makeProviderIcon(brandingPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.9 12.3L14.4 17.8" stroke={p.glyph} strokeWidth="1.8" />
    <path d="M18.5 10.9L21.1 13.5" stroke={p.highlight} strokeWidth="1.4" />
    <path d="M12.5 18.4C11.6 18.6 10.8 19.3 10.5 20.2C11.4 20.5 12.3 20.3 13 19.7C13.6 19.2 14 18.3 14 17.6C13.4 17.7 12.9 18 12.5 18.4Z" fill={p.accent} fillOpacity="0.2" stroke={p.glyph} strokeWidth="1.15" />
  </g>
));

export const IconProviderApi3D = makeProviderIcon(apiPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 13.4L11.4 16L14 18.6M18 13.4L20.6 16L18 18.6M16.9 12L15.1 20" stroke={p.glyph} strokeWidth="1.45" />
    <path d="M15.1 20L16.9 12" stroke={p.highlight} strokeWidth="0.9" opacity="0.75" />
  </g>
));

export const IconProviderBackup3D = makeProviderIcon(backupPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.5 19.8H19.2C20.8 19.8 22 18.7 22 17.2C22 15.7 20.8 14.6 19.4 14.6C19 12.8 17.7 11.8 16 11.8C14 11.8 12.4 13.2 12.2 15C10.9 15.2 10 16.1 10 17.3C10 18.7 11.1 19.8 12.5 19.8Z" fill={p.accent} fillOpacity="0.16" stroke={p.glyph} strokeWidth="1.2" />
    <path d="M16 14.3V18" stroke={p.highlight} strokeWidth="1.1" />
    <path d="M14.5 16.7L16 18.2L17.5 16.7" stroke={p.highlight} strokeWidth="1.1" />
  </g>
));

export const IconProviderAI3D = makeProviderIcon(aiPalette, (p) => (
  <g strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 11.2C17.3 13.8 19.8 15 19.8 15C19.8 15 17.3 16.2 16 18.8C14.7 16.2 12.2 15 12.2 15C12.2 15 14.7 13.8 16 11.2Z" fill={p.accent} fillOpacity="0.22" stroke={p.glyph} strokeWidth="1.2" />
    <circle cx="16" cy="15" r="1.2" fill={p.highlight} />
    <circle cx="20.3" cy="11.8" r="0.95" fill={p.accent} />
    <circle cx="11.9" cy="19.3" r="0.85" fill={p.highlight} fillOpacity="0.85" />
  </g>
));
