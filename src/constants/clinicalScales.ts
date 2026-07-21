/**
 * Fonte única de verdade para as escalas clínicas do MVP.
 * Nenhum ponto de corte aqui pode ser alterado sem aprovação humana
 * (ver seção 7 do PROMPT DE EXECUÇÃO v3.0 e docs/CLINICAL_SPECS.md).
 *
 * Referências (seção 9 do prompt):
 * - Braden, B.; Bergstrom, N. (1987); adaptação/validação brasileira:
 *   Paranhos, W. Y.; Santos, V. L. C. G. (1999); EPUAP/NPIAP/PPPIA (2019).
 * - Morse Fall Scale: Morse, J. M. (1989); versão brasileira validada:
 *   Urbanetto, J. S. et al. (2013).
 * - TEC: normalidade usual ≤ 2 s em adultos, sujeito a variação por idade,
 *   sexo e temperatura; usar como triagem, não diagnóstico isolado.
 */

// ---------------------------------------------------------------------------
// 1. Escala de Braden (risco de lesão por pressão)
// ---------------------------------------------------------------------------

export type BradenSubscaleKey =
  | "percepcaoSensorial"
  | "umidade"
  | "atividade"
  | "mobilidade"
  | "nutricao"
  | "friccaoCisalhamento";

export interface BradenLevel {
  score: number;
  label: string;
  orientacaoClinica: string;
}

export interface BradenSubscale {
  key: BradenSubscaleKey;
  title: string;
  levels: BradenLevel[];
}

export const BRADEN_SUBSCALES: readonly BradenSubscale[] = [
  {
    key: "percepcaoSensorial",
    title: "Percepção sensorial",
    levels: [
      {
        score: 1,
        label: "Totalmente limitada",
        orientacaoClinica:
          "Paciente não reage a estímulos dolorosos; reposicionar em intervalos curtos e inspecionar a pele a cada mudança de decúbito.",
      },
      {
        score: 2,
        label: "Muito limitada",
        orientacaoClinica:
          "Reage apenas a estímulos dolorosos ou geme; monitorar desconforto que o paciente não consegue verbalizar claramente.",
      },
      {
        score: 3,
        label: "Levemente limitada",
        orientacaoClinica:
          "Responde a comandos verbais, mas nem sempre comunica desconforto; reforçar orientação para comunicar dor ou pressão.",
      },
      {
        score: 4,
        label: "Nenhuma limitação",
        orientacaoClinica:
          "Responde a comandos verbais e comunica desconforto normalmente; manter vigilância padrão.",
      },
    ],
  },
  {
    key: "umidade",
    title: "Umidade",
    levels: [
      {
        score: 1,
        label: "Constantemente úmida",
        orientacaoClinica:
          "Pele quase sempre úmida (suor, urina); trocar fraldas/roupas de cama a cada mudança de decúbito e usar barreira de proteção cutânea.",
      },
      {
        score: 2,
        label: "Muito úmida",
        orientacaoClinica:
          "Pele frequentemente úmida; trocar roupas de cama pelo menos uma vez por turno.",
      },
      {
        score: 3,
        label: "Ocasionalmente úmida",
        orientacaoClinica:
          "Necessita troca adicional de roupas de cama aproximadamente uma vez ao dia; monitorar continência.",
      },
      {
        score: 4,
        label: "Raramente úmida",
        orientacaoClinica: "Pele geralmente seca; manter rotina padrão de higiene.",
      },
    ],
  },
  {
    key: "atividade",
    title: "Atividade",
    levels: [
      {
        score: 1,
        label: "Acamado",
        orientacaoClinica:
          "Restrito ao leito; programar mudança de decúbito a cada 2 horas conforme protocolo institucional.",
      },
      {
        score: 2,
        label: "Confinado à cadeira",
        orientacaoClinica:
          "Capacidade de andar gravemente limitada; reposicionar na cadeira a cada 1 hora e avaliar superfície de assento.",
      },
      {
        score: 3,
        label: "Anda ocasionalmente",
        orientacaoClinica:
          "Anda ocasionalmente durante o dia, distâncias curtas; incentivar deambulação assistida quando seguro.",
      },
      {
        score: 4,
        label: "Anda frequentemente",
        orientacaoClinica: "Anda fora do quarto/ambiente pelo menos duas vezes ao dia; manter estímulo à mobilidade.",
      },
    ],
  },
  {
    key: "mobilidade",
    title: "Mobilidade",
    levels: [
      {
        score: 1,
        label: "Totalmente imóvel",
        orientacaoClinica:
          "Não faz mudanças de posição sem assistência; reposicionamento passivo obrigatório e uso de superfícies de redistribuição de pressão.",
      },
      {
        score: 2,
        label: "Bastante limitada",
        orientacaoClinica:
          "Faz pequenas mudanças ocasionais; auxiliar ativamente no reposicionamento e avaliar dispositivos de alívio de pressão.",
      },
      {
        score: 3,
        label: "Levemente limitada",
        orientacaoClinica: "Faz mudanças frequentes, ainda que pequenas, sem assistência; monitorar autonomia.",
      },
      {
        score: 4,
        label: "Sem limitações",
        orientacaoClinica: "Faz mudanças de posição importantes e frequentes sem auxílio; manter vigilância padrão.",
      },
    ],
  },
  {
    key: "nutricao",
    title: "Nutrição",
    levels: [
      {
        score: 1,
        label: "Muito pobre",
        orientacaoClinica:
          "Ingestão nutricional claramente insuficiente; sinalizar avaliação nutricional e/ou médica prioritária.",
      },
      {
        score: 2,
        label: "Provavelmente inadequada",
        orientacaoClinica: "Raramente completa a refeição; monitorar ingestão e considerar suplementação conforme prescrição.",
      },
      {
        score: 3,
        label: "Adequada",
        orientacaoClinica: "Ingestão adequada na maioria das refeições; manter acompanhamento de rotina.",
      },
      {
        score: 4,
        label: "Excelente",
        orientacaoClinica: "Ingestão completa da maioria das refeições; sem intervenção nutricional adicional indicada.",
      },
    ],
  },
  {
    key: "friccaoCisalhamento",
    title: "Fricção e cisalhamento",
    levels: [
      {
        score: 1,
        label: "Problema",
        orientacaoClinica:
          "Necessita de assistência moderada a máxima para se mover; deslizamento frequente no leito/cadeira. Ajustar técnica de transferência e cabeceira.",
      },
      {
        score: 2,
        label: "Problema potencial",
        orientacaoClinica: "Move-se com alguma assistência; pele possivelmente desliza contra o lençol em algum grau.",
      },
      {
        score: 3,
        label: "Nenhum problema aparente",
        orientacaoClinica: "Move-se no leito/cadeira com independência e sustenta boa posição; manter vigilância padrão.",
      },
    ],
  },
];

export const BRADEN_SCORE_MIN = 6;
export const BRADEN_SCORE_MAX = 23;

export interface BradenClassificationRange {
  min: number;
  max: number;
  label: string;
}

/** Validação brasileira (Paranhos e Santos, 1999). */
export const BRADEN_CLASSIFICATION: readonly BradenClassificationRange[] = [
  { min: 19, max: 23, label: "Sem risco" },
  { min: 15, max: 18, label: "Risco baixo" },
  { min: 13, max: 14, label: "Risco moderado" },
  { min: 10, max: 12, label: "Risco alto" },
  { min: 6, max: 9, label: "Risco muito alto" },
];

export type BradenScores = Record<BradenSubscaleKey, number>;

export function calculateBradenScore(scores: BradenScores): number {
  return (
    scores.percepcaoSensorial +
    scores.umidade +
    scores.atividade +
    scores.mobilidade +
    scores.nutricao +
    scores.friccaoCisalhamento
  );
}

export function classifyBradenScore(total: number): string {
  const range = BRADEN_CLASSIFICATION.find((r) => total >= r.min && total <= r.max);
  if (!range) {
    throw new Error(`Escore de Braden fora do intervalo válido (${BRADEN_SCORE_MIN}-${BRADEN_SCORE_MAX}): ${total}`);
  }
  return range.label;
}

export function getBradenSubscaleLevel(key: BradenSubscaleKey, score: number): BradenLevel {
  const subscale = BRADEN_SUBSCALES.find((s) => s.key === key);
  if (!subscale) throw new Error(`Subescala de Braden desconhecida: ${key}`);
  const level = subscale.levels.find((l) => l.score === score);
  if (!level) throw new Error(`Nível inválido (${score}) para a subescala ${key}`);
  return level;
}

// ---------------------------------------------------------------------------
// 2. Tempo de Enchimento Capilar (TEC)
// ---------------------------------------------------------------------------

export type TecClassificationLabel = "Normal" | "Limítrofe (atenção)" | "Alterado";

export interface TecClassificationRange {
  label: TecClassificationLabel;
  color: "verde" | "amarelo" | "vermelho";
  /** Limite inclusivo superior em segundos; null = sem limite superior. */
  maxSeconds: number | null;
}

/** Parametrizável; defaults conforme seção 2.4.2 do prompt. */
export const TEC_CLASSIFICATION: readonly TecClassificationRange[] = [
  { label: "Normal", color: "verde", maxSeconds: 2 },
  { label: "Limítrofe (atenção)", color: "amarelo", maxSeconds: 3 },
  { label: "Alterado", color: "vermelho", maxSeconds: null },
];

export const TEC_MIN_SECONDS = 0;
export const TEC_MAX_SECONDS = 10;
export const TEC_STEP_SECONDS = 0.5;
export const TEC_ALERT_THRESHOLD_SECONDS = 3;

export function classifyTec(seconds: number): TecClassificationRange {
  if (seconds < TEC_MIN_SECONDS || seconds > TEC_MAX_SECONDS) {
    throw new Error(`TEC fora da faixa válida (${TEC_MIN_SECONDS}-${TEC_MAX_SECONDS}s): ${seconds}`);
  }
  const range = TEC_CLASSIFICATION.find((r) => r.maxSeconds === null || seconds <= r.maxSeconds);
  if (!range) throw new Error(`Não foi possível classificar TEC: ${seconds}`);
  return range;
}

/** TEC > 3s sem fator contextual registrado (hipotermia, vasoconstritores) gera alerta ao coordenador. */
export function requiresTecCoordinatorAlert(seconds: number, hasContextualFactor: boolean): boolean {
  return seconds > TEC_ALERT_THRESHOLD_SECONDS && !hasContextualFactor;
}

// ---------------------------------------------------------------------------
// 3. Escala de Morse (risco de queda, versão brasileira Urbanetto et al., 2013)
// ---------------------------------------------------------------------------

export interface MorseScores {
  historicoQuedas: 0 | 25;
  diagnosticoSecundario: 0 | 15;
  auxilioDeambulacao: 0 | 15 | 30;
  terapiaEndovenosa: 0 | 20;
  marcha: 0 | 10 | 20;
  estadoMental: 0 | 15;
}

export type MorseClassificationLabel = "Risco baixo" | "Risco moderado" | "Risco elevado";

export interface MorseClassificationRange {
  min: number;
  max: number;
  label: MorseClassificationLabel;
}

export const MORSE_CLASSIFICATION: readonly MorseClassificationRange[] = [
  { min: 0, max: 24, label: "Risco baixo" },
  { min: 25, max: 44, label: "Risco moderado" },
  { min: 45, max: Infinity, label: "Risco elevado" },
];

export function calculateMorseScore(scores: MorseScores): number {
  return (
    scores.historicoQuedas +
    scores.diagnosticoSecundario +
    scores.auxilioDeambulacao +
    scores.terapiaEndovenosa +
    scores.marcha +
    scores.estadoMental
  );
}

export function classifyMorseScore(total: number): MorseClassificationLabel {
  const range = MORSE_CLASSIFICATION.find((r) => total >= r.min && total <= r.max);
  if (!range) throw new Error(`Não foi possível classificar escore de Morse: ${total}`);
  return range.label;
}

// ---------------------------------------------------------------------------
// 4. Risco de Aspiração (MVP simplificado)
// ---------------------------------------------------------------------------

export const ASPIRATION_RISK_LEVELS = ["baixo", "moderado", "alto"] as const;
export type AspirationRiskLevel = (typeof ASPIRATION_RISK_LEVELS)[number];

// ---------------------------------------------------------------------------
// 5. Risco de Lesão por Dispositivos Médicos
// ---------------------------------------------------------------------------

export const DEVICE_INJURY_CHECKLIST_ITEMS = [
  { key: "sonda", label: "Posicionamento de sonda" },
  { key: "cateter", label: "Cateter" },
  { key: "talaImobilizador", label: "Tala/imobilizador" },
  { key: "ortese", label: "Órtese" },
  { key: "tuboDreno", label: "Tubo/dreno" },
] as const;

export type DeviceInjuryChecklistKey = (typeof DEVICE_INJURY_CHECKLIST_ITEMS)[number]["key"];

export type DeviceInjuryChecklist = Record<DeviceInjuryChecklistKey, "adequado" | "inadequado">;

export function hasDeviceInjuryAlert(checklist: DeviceInjuryChecklist): boolean {
  return Object.values(checklist).some((v) => v === "inadequado");
}
