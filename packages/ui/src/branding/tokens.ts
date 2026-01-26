export const BRAND_COLORS = {
    primary: '#3b82f6',
    secondary: '#6366f1',
    background: '#0f172a',
    text: '#ffffff',
    accent: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    muted: '#94a3b8',
    border: '#475569',
} as const;

export const UI_COLORS = {
    score: '#ffffff',
    combo: '#fbbf24',
    health: '#ef4444',
    distance: '#3b82f6',
    menu: {
        background: BRAND_COLORS.background,
        text: BRAND_COLORS.text,
        accent: BRAND_COLORS.accent,
    },
} as const;
