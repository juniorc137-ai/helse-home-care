import {
  bradenScoresSchema,
  carePlanTaskInputSchema,
  clinicalNoteDraftSchema,
  morseScoresSchema,
  patientConsentSchema,
  tecAssessmentSchema,
  vitalSignsSchema,
} from "../../src/types/zodSchemas";
import { BRADEN_FIXTURE_HIGH_RISK, MORSE_FIXTURE_HIGH_RISK } from "../fixtures/clinicalFixtures";

describe("Zod schemas (validação de payloads do Sync Contract)", () => {
  it("valida a fixture de Braden", () => {
    expect(bradenScoresSchema.safeParse(BRADEN_FIXTURE_HIGH_RISK).success).toBe(true);
  });

  it("rejeita nível inválido de Braden", () => {
    expect(bradenScoresSchema.safeParse({ ...BRADEN_FIXTURE_HIGH_RISK, umidade: 9 }).success).toBe(false);
  });

  it("valida avaliação de TEC dentro da faixa 0-10s", () => {
    expect(tecAssessmentSchema.safeParse({ type: "tec", seconds: 3.5, hasContextualFactor: false }).success).toBe(true);
    expect(tecAssessmentSchema.safeParse({ type: "tec", seconds: 15, hasContextualFactor: false }).success).toBe(false);
  });

  it("valida a fixture de Morse", () => {
    expect(morseScoresSchema.safeParse(MORSE_FIXTURE_HIGH_RISK).success).toBe(true);
  });

  it("valida sinais vitais dentro de faixas fisiológicas plausíveis", () => {
    expect(vitalSignsSchema.safeParse({ heartRate: 80, spo2: 97 }).success).toBe(true);
    expect(vitalSignsSchema.safeParse({ heartRate: 999 }).success).toBe(false);
  });

  it("valida entrada de tarefa do Care Plan", () => {
    expect(
      carePlanTaskInputSchema.safeParse({
        descricao: "Administrar medicação",
        tipo: "medicacao",
        horarioAgendado: "2026-07-21T14:00:00.000Z",
        profissionalResponsavel: "user-nurse-01",
      }).success,
    ).toBe(true);
    expect(carePlanTaskInputSchema.safeParse({ descricao: "", tipo: "medicacao" }).success).toBe(false);
  });

  it("valida rascunho de nota de evolução", () => {
    expect(clinicalNoteDraftSchema.safeParse({ conteudoTexto: "S: ..." }).success).toBe(true);
    expect(clinicalNoteDraftSchema.safeParse({ conteudoTexto: "" }).success).toBe(false);
  });

  it("valida consentimento LGPD do paciente", () => {
    expect(
      patientConsentSchema.safeParse({
        consentGiven: true,
        consentTimestamp: "2026-01-01T00:00:00.000Z",
        consentVersion: "1.0.0",
      }).success,
    ).toBe(true);
  });
});
