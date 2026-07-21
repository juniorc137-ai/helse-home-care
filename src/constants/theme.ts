/**
 * Paleta WCAG 2.1 AA (contraste mínimo 4.5:1 para texto normal, 3:1 para
 * texto grande/ícones) para uso em ambientes de iluminação variável no
 * ponto de cuidado (seção 4.1 do prompt).
 */

export const colors = {
  background: "#FFFFFF",
  surface: "#F4F6F8",
  textPrimary: "#1A1D21",
  textSecondary: "#4A4F57",
  primary: "#0B5FA5", // azul institucional, contraste 4.5:1+ sobre branco
  primaryDark: "#083F70",
  border: "#D0D5DB",

  // Semáforo de status (Care Plan, seção 2.3) e classificação clínica
  statusOk: "#1E7E34", // verde — em dia / normal
  statusWarning: "#8A6D00", // amarelo escurecido p/ contraste AA sobre branco
  statusDanger: "#B3261E", // vermelho — atrasado / alterado

  // Fundos suaves para cards de alerta (uso com texto escuro)
  statusOkBg: "#E6F4EA",
  statusWarningBg: "#FFF6DC",
  statusDangerBg: "#FCE8E6",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Zonas de toque mínimas para ações críticas (seção 4.1): 44x44pt iOS / 48x48dp Android. */
export const minTouchTarget = {
  ios: 44,
  android: 48,
} as const;

export const typography = {
  minMobileFontSize: 14,
} as const;
