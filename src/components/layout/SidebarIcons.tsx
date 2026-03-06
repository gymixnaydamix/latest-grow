/* ─── 2049 Spatial HUD Icons ─── Holographic, Glassmorphic, & Volumetric ───── */
import React from 'react';

interface IconProps {
  className?: string;
}

/** 
 * Shared SVG Filter for Optical Bloom (Neon Glow)
 * We embed this directly via overlapping paths to ensure 60fps rendering 
 * without heavy SVG filter calculations blocking the main thread.
 */

/** Dashboard — Cyan Holographic Data Grid */
export function IconDashboard({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dash-glass" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="dash-border" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Physical Glass Base */}
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#dash-glass)" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#dash-border)" strokeWidth="1" />
      
      {/* Micro-registration marks */}
      <circle cx="6" cy="6" r="0.5" fill="#38bdf8" opacity="0.5" />
      <circle cx="26" cy="6" r="0.5" fill="#38bdf8" opacity="0.5" />
      
      {/* Background Grid */}
      <path d="M6 16h20M16 6v20" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 2" />
      
      {/* Holographic Projection (Multi-layered for glow) */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Glow Layer */}
        <path d="M10 20v-5m6 5v-9m6 9v-3" stroke="#38bdf8" strokeWidth="4" opacity="0.2" />
        <path d="M10 20v-5m6 5v-9m6 9v-3" stroke="#7dd3fc" strokeWidth="2" opacity="0.5" />
        {/* Core Layer */}
        <path d="M10 20v-5m6 5v-9m6 9v-3" stroke="#ffffff" strokeWidth="1" opacity="0.9" />
        
        {/* Data points */}
        <circle cx="10" cy="15" r="1.5" fill="#ffffff" />
        <circle cx="16" cy="11" r="1.5" fill="#ffffff" />
        <circle cx="22" cy="17" r="1.5" fill="#ffffff" />
      </g>
    </svg>
  );
}

/** School / Tenant Mgt — Emerald Geometric Structure */
export function IconSchool({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sch-glass" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="sch-border" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#065f46" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#sch-glass)" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#sch-border)" strokeWidth="1" />
      
      <circle cx="6" cy="6" r="0.5" fill="#34d399" opacity="0.5" />
      <circle cx="26" cy="6" r="0.5" fill="#34d399" opacity="0.5" />

      {/* Holographic Architecture */}
      <g strokeLinejoin="round">
        {/* Glow */}
        <path d="M16 8l-8 5 8 5 8-5-8-5z" stroke="#34d399" strokeWidth="3" opacity="0.2" />
        <path d="M8 13v6l8 5 8-5v-6" stroke="#34d399" strokeWidth="3" opacity="0.2" />
        {/* Core */}
        <path d="M16 8l-8 5 8 5 8-5-8-5z" stroke="#6ee7b7" strokeWidth="1.5" opacity="0.8" />
        <path d="M8 13v6l8 5 8-5v-6" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        <path d="M16 8l-8 5 8 5 8-5-8-5z" stroke="#ffffff" strokeWidth="0.5" />
      </g>
      <circle cx="16" cy="8" r="1.5" fill="#ffffff" />
      <circle cx="16" cy="18" r="1.5" fill="#a7f3d0" />
    </svg>
  );
}

/** CRM — Amber Neural Network */
export function IconCRM({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crm-glass" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="crm-border" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#78350f" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#crm-glass)" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#crm-border)" strokeWidth="1" />
      
      <circle cx="6" cy="6" r="0.5" fill="#fbbf24" opacity="0.5" />
      <circle cx="26" cy="6" r="0.5" fill="#fbbf24" opacity="0.5" />

      {/* Constellation Network */}
      <g strokeLinecap="round">
        {/* Glow */}
        <path d="M10 12l5 6 7-4" stroke="#fbbf24" strokeWidth="4" opacity="0.2" />
        <path d="M10 12l5 6 7-4" stroke="#fcd34d" strokeWidth="1.5" opacity="0.7" />
        <path d="M10 12l5 6 7-4" stroke="#ffffff" strokeWidth="0.5" />
        
        {/* Nodes */}
        <circle cx="10" cy="12" r="3" fill="#f59e0b" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="1" />
        <circle cx="15" cy="18" r="3" fill="#f59e0b" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="1" />
        <circle cx="22" cy="14" r="3" fill="#f59e0b" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="1" />
        
        <circle cx="10" cy="12" r="1" fill="#ffffff" />
        <circle cx="15" cy="18" r="1" fill="#ffffff" />
        <circle cx="22" cy="14" r="1" fill="#ffffff" />
      </g>
    </svg>
  );
}

/** Tool-Platform — Violet Floating Core */
export function IconToolPlatform({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tp-glass" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="tp-border" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#tp-glass)" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#tp-border)" strokeWidth="1" />

      <circle cx="6" cy="6" r="0.5" fill="#a78bfa" opacity="0.5" />
      <circle cx="26" cy="6" r="0.5" fill="#a78bfa" opacity="0.5" />

      {/* Isometric Platforms */}
      <g strokeLinejoin="round">
        <path d="M16 12l8 4-8 4-8-4 8-4z" fill="#8b5cf6" fillOpacity="0.2" stroke="#a78bfa" strokeWidth="1" />
        <path d="M16 16l8 4-8 4-8-4 8-4z" fill="#8b5cf6" fillOpacity="0.1" stroke="#a78bfa" strokeWidth="0.5" strokeDasharray="2 2" />
        <path d="M16 8l5 2.5-5 2.5-5-2.5L16 8z" fill="#ffffff" fillOpacity="0.1" stroke="#ffffff" strokeWidth="1" />
        
        {/* Core Vertical Data Beam */}
        <path d="M16 8v12" stroke="#ffffff" strokeWidth="2" opacity="0.8" strokeLinecap="round" />
        <path d="M16 8v12" stroke="#c4b5fd" strokeWidth="6" opacity="0.3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Communication — Teal Digital Radar/Wave */
export function IconComm({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="com-glass" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0f766e" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="com-border" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#115e59" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#com-glass)" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#com-border)" strokeWidth="1" />

      <circle cx="6" cy="6" r="0.5" fill="#2dd4bf" opacity="0.5" />
      <circle cx="26" cy="6" r="0.5" fill="#2dd4bf" opacity="0.5" />

      {/* Holographic Container */}
      <path d="M8 12a4 4 0 014-4h8a4 4 0 014 4v5a4 4 0 01-4 4h-3l-4 3v-3H12a4 4 0 01-4-4v-5z" stroke="#2dd4bf" strokeWidth="1" opacity="0.4" strokeDasharray="4 2" />
      
      {/* Audio Waveform */}
      <g strokeLinecap="round">
        <path d="M12 14v2m2-4v6m2-8v10m2-6v4m2-3v2" stroke="#14b8a6" strokeWidth="4" opacity="0.2" />
        <path d="M12 14v2m2-4v6m2-8v10m2-6v4m2-3v2" stroke="#5eead4" strokeWidth="1.5" opacity="0.8" />
        <path d="M12 14v2m2-4v6m2-8v10m2-6v4m2-3v2" stroke="#ffffff" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

/** Concierge AI — Fuchsia Synthetic Core */
export function IconAI({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-glass" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#d946ef" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#a21caf" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="ai-border" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#e879f9" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#701a75" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#ai-glass)" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#ai-border)" strokeWidth="1" />

      <circle cx="6" cy="6" r="0.5" fill="#e879f9" opacity="0.5" />
      <circle cx="26" cy="6" r="0.5" fill="#e879f9" opacity="0.5" />

      {/* AI Star Core */}
      <g>
        {/* Extreme Glow */}
        <path d="M16 6C16 14 24 16 24 16C24 16 16 18 16 26C16 18 8 16 8 16C8 16 16 14 16 6Z" fill="#d946ef" opacity="0.3" filter="blur(2px)" />
        {/* Inner Star */}
        <path d="M16 6C16 14 24 16 24 16C24 16 16 18 16 26C16 18 8 16 8 16C8 16 16 14 16 6Z" fill="#f0abfc" opacity="0.8" />
        <path d="M16 6C16 14 24 16 24 16C24 16 16 18 16 26C16 18 8 16 8 16C8 16 16 14 16 6Z" stroke="#ffffff" strokeWidth="0.5" />
        
        {/* Orbital particles */}
        <circle cx="22" cy="10" r="1" fill="#ffffff" />
        <circle cx="10" cy="22" r="1.5" fill="#e879f9" />
        <path d="M10 22L14 18" stroke="#e879f9" strokeWidth="0.5" opacity="0.5" strokeDasharray="1 1" />
      </g>
    </svg>
  );
}

/** Wellness — Rose Wireframe Heart/Pulse */
export function IconWellness({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="well-glass" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#be123c" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="well-border" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#fb7185" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#881337" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#well-glass)" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#well-border)" strokeWidth="1" />

      <circle cx="6" cy="6" r="0.5" fill="#fb7185" opacity="0.5" />
      <circle cx="26" cy="6" r="0.5" fill="#fb7185" opacity="0.5" />

      {/* Holographic Heart Shape */}
      <path d="M16 23.5l-1.4-1.3C10.5 18.5 8 16.2 8 13c0-2.6 2-4.6 4.7-4.6 1.5 0 2.9.7 3.8 1.8.9-1.1 2.3-1.8 3.8-1.8 2.6 0 4.7 2 4.7 4.6 0 3.2-2.5 5.5-6.6 9.2L16 23.5z" stroke="#fb7185" strokeWidth="1" opacity="0.3" strokeDasharray="3 2" />
      
      {/* EKG Pulse intersecting */}
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 15h3l2-4 3 8 2-4h4" stroke="#f43f5e" strokeWidth="4" opacity="0.2" />
        <path d="M7 15h3l2-4 3 8 2-4h4" stroke="#fda4af" strokeWidth="1.5" opacity="0.9" />
        <path d="M7 15h3l2-4 3 8 2-4h4" stroke="#ffffff" strokeWidth="0.5" />
        <circle cx="21" cy="15" r="1.5" fill="#ffffff" />
      </g>
    </svg>
  );
}

/** Tools — Gold Caliper/Calibration */
export function IconTools({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tool-glass" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#eab308" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#a16207" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="tool-border" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#713f12" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#tool-glass)" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#tool-border)" strokeWidth="1" />

      <circle cx="6" cy="6" r="0.5" fill="#facc15" opacity="0.5" />
      <circle cx="26" cy="6" r="0.5" fill="#facc15" opacity="0.5" />

      {/* Precision Calipers / Hardware */}
      <g strokeLinecap="round" strokeLinejoin="round">
        {/* Main shafts */}
        <path d="M10 22L20 10m-2 12l2-2" stroke="#eab308" strokeWidth="3" opacity="0.2" />
        <path d="M10 22L20 10m-2 12l2-2" stroke="#fde047" strokeWidth="1.5" opacity="0.8" />
        <path d="M10 22L20 10m-2 12l2-2" stroke="#ffffff" strokeWidth="0.5" />
        
        {/* Core locking ring */}
        <circle cx="16" cy="16" r="3" fill="#000000" fillOpacity="0.5" stroke="#facc15" strokeWidth="1" />
        <circle cx="16" cy="16" r="1" fill="#ffffff" />
        
        {/* Laser tip glow */}
        <circle cx="21" cy="9" r="2" fill="#facc15" opacity="0.6" filter="blur(1px)" />
        <circle cx="21" cy="9" r="1" fill="#ffffff" />
      </g>
    </svg>
  );
}

/** Overlay-Setting — Sky HUD Planes */
export function IconOverlay({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ov-glass" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="ov-border" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#ov-glass)" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#ov-border)" strokeWidth="1" />

      <circle cx="6" cy="6" r="0.5" fill="#38bdf8" opacity="0.5" />
      <circle cx="26" cy="6" r="0.5" fill="#38bdf8" opacity="0.5" />

      {/* Shifted Spatial Planes */}
      <rect x="8" y="8" width="12" height="10" rx="1" stroke="#0284c7" strokeWidth="1" opacity="0.4" strokeDasharray="2 2" />
      <rect x="10" y="11" width="12" height="10" rx="1" fill="#000000" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" opacity="0.7" />
      
      {/* Front Glowing Plane */}
      <rect x="12" y="14" width="12" height="10" rx="1" fill="#0ea5e9" fillOpacity="0.1" stroke="#7dd3fc" strokeWidth="1.5" />
      <rect x="12" y="14" width="12" height="10" rx="1" stroke="#ffffff" strokeWidth="0.5" />
      
      {/* Reticles on front plane */}
      <path d="M14 16v1m0-1h1M22 16v1m0-1h-1M14 22v-1m0 1h1M22 22v-1m0 1h-1" stroke="#ffffff" strokeWidth="0.5" opacity="0.8" />
    </svg>
  );
}

/** Settings — Silver Mechanical Iris/Core */
export function IconSettings({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="set-glass" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#475569" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="set-border" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#set-glass)" />
      <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#set-border)" strokeWidth="1" />

      <circle cx="6" cy="6" r="0.5" fill="#cbd5e1" opacity="0.5" />
      <circle cx="26" cy="6" r="0.5" fill="#cbd5e1" opacity="0.5" />

      {/* Hardware Iris */}
      <g strokeLinecap="round">
        {/* Outer Orbit */}
        <path d="M16 6A10 10 0 1 1 6 16" stroke="#64748b" strokeWidth="1" opacity="0.5" strokeDasharray="3 4" />
        
        {/* Inner Mechanical Ring */}
        <circle cx="16" cy="16" r="6" stroke="#cbd5e1" strokeWidth="1.5" opacity="0.8" />
        <circle cx="16" cy="16" r="6" stroke="#ffffff" strokeWidth="0.5" />
        
        {/* Core Engine */}
        <circle cx="16" cy="16" r="2.5" fill="#f8fafc" opacity="0.9" />
        <circle cx="16" cy="16" r="4" stroke="#94a3b8" strokeWidth="4" opacity="0.2" />

        {/* Sync nodes */}
        <path d="M16 8v2m0 12v2m-8-8h2m12 0h2" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
      </g>
    </svg>
  );
}

/* ─── Map section IDs → custom icons ─── */
export const sidebarIconMap: Record<string, React.FC<IconProps>> = {
  dashboard: IconDashboard,
  school: IconSchool,
  crm: IconCRM,
  tool_platform: IconToolPlatform,
  communication: IconComm,
  concierge_ai: IconAI,
  wellness: IconWellness,
  tools: IconTools,
  overlay_setting: IconOverlay,
  setting: IconSettings,
};