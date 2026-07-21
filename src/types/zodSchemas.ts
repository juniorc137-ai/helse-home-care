import { z } from "zod";

/** Schemas Zod usados para validar payloads do Sync Contract (seção 4.5) antes de persistir/enfileirar. */

export const bradenScoresSchema = z.object({
  percepcaoSensorial: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  umidade: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  atividade: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  mobilidade: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  nutricao: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  friccaoCisalhamento: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export const tecAssessmentSchema = z.object({
  type: z.literal("tec"),
  seconds: z.number().min(0).max(10),
  hasContextualFactor: z.boolean(),
  contextualFactorNote: z.string().optional(),
});

export const morseScoresSchema = z.object({
  historicoQuedas: z.union([z.literal(0), z.literal(25)]),
  diagnosticoSecundario: z.union([z.literal(0), z.literal(15)]),
  auxilioDeambulacao: z.union([z.literal(0), z.literal(15), z.literal(30)]),
  terapiaEndovenosa: z.union([z.literal(0), z.literal(20)]),
  marcha: z.union([z.literal(0), z.literal(10), z.literal(20)]),
  estadoMental: z.union([z.literal(0), z.literal(15)]),
});

export const vitalSignsSchema = z.object({
  systolicBP: z.number().min(60).max(260).optional(),
  diastolicBP: z.number().min(30).max(150).optional(),
  heartRate: z.number().min(20).max(250).optional(),
  respiratoryRate: z.number().min(4).max(60).optional(),
  temperature: z.number().min(25).max(43).optional(),
  spo2: z.number().min(50).max(100).optional(),
  capillaryGlucose: z.number().min(20).max(700).optional(),
});

export const carePlanTaskInputSchema = z.object({
  descricao: z.string().min(1, "Descrição obrigatória"),
  tipo: z.enum(["medicacao", "curativo", "mobilizacao", "monitoramento", "outro"]),
  horarioAgendado: z.string().datetime({ offset: true }).or(z.string().min(1)),
  profissionalResponsavel: z.string().min(1),
});

export const clinicalNoteDraftSchema = z.object({
  conteudoTexto: z.string().min(1, "Conteúdo da nota é obrigatório"),
  sinaisVitais: vitalSignsSchema.nullable().optional(),
  fotoAnexada: z.string().nullable().optional(),
});

export const patientConsentSchema = z.object({
  consentGiven: z.boolean(),
  consentTimestamp: z.string().datetime({ offset: true }).or(z.string().min(1)),
  consentVersion: z.string().min(1),
});
