/**
 * Tokens de cor por modo (claro/escuro). Substituem o `colors` estático de
 * `src/constants/theme.ts` para permitir modo escuro reativo (ver
 * ThemeContext.tsx). Contraste verificado para WCAG 2.1 AA em ambos os
 * modos (mínimo 4.5:1 para texto normal).
 */

export interface ThemeTokens {
  bg: string;
  surface: string;
  surfaceRaised: string;
  ink: string;
  inkSecondary: string;
  inkMuted: string;
  primary: string;
  primaryMuted: string;
  statusOk: string;
  statusWarning: string;
  statusDanger: string;
  statusOkBg: string;
  statusWarningBg: string;
  statusDangerBg: string;
  border: string;
}

export const lightTokens: ThemeTokens = {
  bg: "#FFFFFF",
  surface: "#F7F8FA",
  surfaceRaised: "#FFFFFF",
  ink: "#14171A",
  inkSecondary: "#6B7280",
  inkMuted: "#9CA3AF",
  primary: "#2563EB",
  primaryMuted: "#EFF4FF",
  statusOk: "#15803D",
  statusWarning: "#92650A",
  statusDanger: "#B91C1C",
  statusOkBg: "#EAF7EE",
  statusWarningBg: "#FEF6E7",
  statusDangerBg: "#FDECEC",
  border: "#E5E7EB",
};

export const darkTokens: ThemeTokens = {
  bg: "#0B0F14",
  surface: "#11161C",
  surfaceRaised: "#1B232B",
  ink: "#F1F5F9",
  inkSecondary: "#A7B2BE",
  inkMuted: "#77828E",
  primary: "#6DA8FF",
  primaryMuted: "#16273F",
  statusOk: "#4ADE80",
  statusWarning: "#FBBF24",
  statusDanger: "#F87171",
  statusOkBg: "#122A19",
  statusWarningBg: "#2B2308",
  statusDangerBg: "#2E1516",
  border: "#2A333D",
};
