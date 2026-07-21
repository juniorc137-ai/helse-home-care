import {
  BRADEN_SCORE_MAX,
  BRADEN_SCORE_MIN,
  calculateBradenScore,
  calculateMorseScore,
  classifyBradenScore,
  classifyMorseScore,
  classifyTec,
  MORSE_CLASSIFICATION,
  TEC_MAX_SECONDS,
} from "../constants/clinicalScales";
import type { ThemeTokens } from "../theme/tokens";
import type { BradenAssessment, MorseAssessment, TecAssessment } from "../types/entities";

export interface IndicatorVisual {
  label: string;
  value: string;
  sublabel: string;
  /** 0-100: sempre "quanto de risco" está preenchido, independente da polaridade da escala. */
  percent: number;
  color: string;
}

function toneColor(tokens: ThemeTokens) {
  return { verde: tokens.statusOk, amarelo: tokens.statusWarning, vermelho: tokens.statusDanger } as const;
}

/** Braden: menor escore = maior risco; o anel preenche com a severidade (invertido em relação ao escore bruto). */
export function bradenToVisual(assessment: BradenAssessment, tokens: ThemeTokens): IndicatorVisual {
  const score = calculateBradenScore(assessment.scores);
  const label = classifyBradenScore(score);
  const severity = 1 - (score - BRADEN_SCORE_MIN) / (BRADEN_SCORE_MAX - BRADEN_SCORE_MIN);
  const isHighRisk = label === "Risco alto" || label === "Risco muito alto";
  const isModerate = label === "Risco moderado";
  const color = isHighRisk ? tokens.statusDanger : isModerate ? tokens.statusWarning : tokens.statusOk;
  return { label: "Braden", value: String(score), sublabel: label, percent: Math.round(severity * 100), color };
}

/** Morse: maior escore = maior risco; o anel preenche diretamente com o escore normalizado. */
export function morseToVisual(assessment: MorseAssessment, tokens: ThemeTokens): IndicatorVisual {
  const score = calculateMorseScore(assessment.scores);
  const label = classifyMorseScore(score);
  const maxScore = MORSE_CLASSIFICATION[MORSE_CLASSIFICATION.length - 1].min + 40; // referência visual (125 é o máximo teórico)
  const severity = Math.min(score / maxScore, 1);
  const color = label === "Risco elevado" ? tokens.statusDanger : label === "Risco moderado" ? tokens.statusWarning : tokens.statusOk;
  return { label: "Morse", value: String(score), sublabel: label, percent: Math.round(severity * 100), color };
}

/** TEC: quanto maior o tempo, maior a severidade (limite visual em 2x o teto normal, seção 2.4.2). */
export function tecToVisual(assessment: TecAssessment, tokens: ThemeTokens): IndicatorVisual {
  const classification = classifyTec(assessment.seconds);
  const severity = Math.min(assessment.seconds / (TEC_MAX_SECONDS / 1.6), 1);
  const color = toneColor(tokens)[classification.color];
  return { label: "TEC", value: `${assessment.seconds}s`, sublabel: classification.label, percent: Math.round(severity * 100), color };
}
