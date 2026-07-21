/**
 * Sistema de design minimalista (redesign v2): branco/cinza claro como
 * base, no máximo 2-3 cores de ação, sombras suaves em vez de bordas
 * duras, espaçamento generoso. Mantém contraste WCAG 2.1 AA (seção 4.1)
 * e o semáforo clínico de status (verde/amarelo/vermelho) inalterado.
 */

export const colors = {
  background: "#FFFFFF",
  surface: "#F7F8FA", // cinza claro de fundo
  surfaceRaised: "#FFFFFF",
  textPrimary: "#14171A",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  // Única cor de ação primária
  primary: "#2563EB",
  primaryMuted: "#EFF4FF",

  // Semáforo clínico — as únicas outras cores no sistema
  statusOk: "#15803D",
  statusWarning: "#92650A",
  statusDanger: "#B91C1C",
  statusOkBg: "#EAF7EE",
  statusWarningBg: "#FEF6E7",
  statusDangerBg: "#FDECEC",

  border: "#E5E7EB", // usado apenas onde sombra não é suficiente
} as const;

/** Sombras suaves (elevação) substituindo bordas duras entre cards. */
export const shadows = {
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 24,
  full: 999,
} as const;

/** Espaçamento generoso (base 4, escala ampliada em relação à v1). */
export const spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 40,
} as const;

/** Tipografia sans-serif grande e clara: 16-20pt em títulos (redesign v2). */
export const typography = {
  minMobileFontSize: 15,
  body: 15,
  bodyLarge: 16,
  title: 18,
  titleLarge: 20,
  display: 28,
} as const;

/** Zonas de toque mínimas para ações críticas (seção 4.1): 44x44pt iOS / 48x48dp Android. */
export const minTouchTarget = {
  ios: 44,
  android: 48,
} as const;

/** Duração máxima de qualquer animação decorativa (nunca bloqueia a próxima ação do usuário). */
export const ANIMATION_MS = {
  feedback: 220, // resposta visual imediata a uma ação (seção 4.1: ≤300ms)
  celebration: 700, // flourish decorativo (confete etc.), sempre não-bloqueante
} as const;
