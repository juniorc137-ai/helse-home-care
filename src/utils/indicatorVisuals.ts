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
import { colors } from "../constants/theme";
import type { BradenAssessment, MorseAssessment, TecAssessment } from "../types/entities";

export interface IndicatorVisual {
  label: string;
  value: string;
  sublabel: string;
  /** 0-100: sempre "quanto de risco" está preenchido, independente da polaridade da escala. */
  percent: number;
  color: string;
}

const TONE_COLOR = { verde: colors.statusOk, amarelo: colors.statusWarning, vermelho: colors.statusDanger } as const;

/** Braden: menor escore = maior risco; o anel preenche com a severidade (invertido em relação ao escore bruto). */
export function bradenToVisual(assessment: BradenAssessment): IndicatorVisual {
  const score = calculateBradenScore(assessment.scores);
  const label = classifyBradenScore(score);
  const severity = 1 - (score - BRADEN_SCORE_MIN) / (BRADEN_SCORE_MAX - BRADEN_SCORE_MIN);
  const isHighRisk = label === "Risco alto" || label === "Risco muito alto";
  const isModerate = label === "Risco moderado";
  const color = isHighRisk ? colors.statusDanger : isModerate ? colors.statusWarning : colors.statusOk;
  return { label: "Braden", value: String(score), sublabel: label, percent: Math.round(severity * 100), color };
}

/** Morse: maior escore = maior risco; o anel preenche diretamente com o escore normalizado. */
export function morseToVisual(assessment: MorseAssessment): IndicatorVisual {
  const score = calculateMorseScore(assessment.scores);
  const label = classifyMorseScore(score);
  const maxScore = MORSE_CLASSIFICATION[MORSE_CLASSIFICATION.length - 1].min + 40; // referência visual (125 é o máximo teórico)
  const severity = Math.min(score / maxScore, 1);
  const color = label === "Risco elevado" ? colors.statusDanger : label === "Risco moderado" ? colors.statusWarning : colors.statusOk;
  return { label: "Morse", value: String(score), sublabel: label, percent: Math.round(severity * 100), color };
}

/** TEC: quanto maior o tempo, maior a severidade (limite visual em 2x o teto normal, seção 2.4.2). */
export function tecToVisual(assessment: TecAssessment): IndicatorVisual {
  const classification = classifyTec(assessment.seconds);
  const severity = Math.min(assessment.seconds / (TEC_MAX_SECONDS / 1.6), 1);
  const color = TONE_COLOR[classification.color];
  return { label: "TEC", value: `${assessment.seconds}s`, sublabel: classification.label, percent: Math.round(severity * 100), color };
}
