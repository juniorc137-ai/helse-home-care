import type { BradenScores, MorseScores } from "../../src/constants/clinicalScales";

/**
 * Fixtures clínicas de referência obrigatórias (seção 2.4 / Definição de
 * Pronto, seção 8 do PROMPT DE EXECUÇÃO v3.0). Qualquer alteração destes
 * valores exige aprovação humana explícita.
 */

/** Braden: Percepção=3, Umidade=2, Atividade=1, Mobilidade=1, Nutrição=2, Fricção=1 → escore 10 → "Risco alto". */
export const BRADEN_FIXTURE_HIGH_RISK: BradenScores = {
  percepcaoSensorial: 3,
  umidade: 2,
  atividade: 1,
  mobilidade: 1,
  nutricao: 2,
  friccaoCisalhamento: 1,
};
export const BRADEN_FIXTURE_HIGH_RISK_EXPECTED_SCORE = 10;
export const BRADEN_FIXTURE_HIGH_RISK_EXPECTED_LABEL = "Risco alto";

/** TEC = 3,5s → "Alterado". */
export const TEC_FIXTURE_ALTERED_SECONDS = 3.5;
export const TEC_FIXTURE_ALTERED_EXPECTED_LABEL = "Alterado";

/** Morse: soma = 50 → "Risco elevado". */
export const MORSE_FIXTURE_HIGH_RISK: MorseScores = {
  historicoQuedas: 25,
  diagnosticoSecundario: 15,
  auxilioDeambulacao: 0,
  terapiaEndovenosa: 0,
  marcha: 10,
  estadoMental: 0,
};
export const MORSE_FIXTURE_HIGH_RISK_EXPECTED_SCORE = 50;
export const MORSE_FIXTURE_HIGH_RISK_EXPECTED_LABEL = "Risco elevado";
