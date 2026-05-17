export const ADMIN_TOKENS = {
  color: {
    appBg: '#f6f8fb',
    surface: '#ffffff',
    surfaceMuted: '#f8fafc',
    border: '#e2e8f0',
    borderStrong: '#cbd5e1',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    accent: '#4f46e5',
    accentSoft: '#eef2ff',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
  },
  radius: {
    sm: '10px',
    md: '12px',
    lg: '14px',
    xl: '18px',
  },
  size: {
    headerDesktop: '64px',
    headerMobile: '56px',
    sidebarExpanded: '272px',
    sidebarCollapsed: '72px',
    touchTarget: '44px',
  },
  shadow: {
    panel: '0 1px 2px rgba(15, 23, 42, 0.04)',
    overlay: '0 16px 40px rgba(15, 23, 42, 0.16)',
  },
  zIndex: {
    header: 30,
    drawer: 50,
    overlay: 60,
  },
} as const;

export type AdminTokens = typeof ADMIN_TOKENS;
