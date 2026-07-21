import { z } from "zod";
import { isValidCPF } from "../utils/cpf";

/** Schemas Zod usados para validar payloads do Sync Contract (seção 4.5) antes de persistir/enfileirar. */

/** Ano mínimo aceito para data de nascimento (limite de sanidade do formulário, não uma norma clínica). */
export const MIN_BIRTH_YEAR = 1900;

function isValidBirthDate(value: string): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  if (date.getTime() > Date.now()) return false;
  return date.getFullYear() >= MIN_BIRTH_YEAR;
}

/** Formulário "Novo Paciente" (seção 2.1/2.2, ADR-005 revisado): campos coletados na criação. */
export const newPatientFormSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  cpf: z.string().refine(isValidCPF, { message: "CPF inválido" }),
  birthDate: z.string().refine(isValidBirthDate, { message: "Data de nascimento inválida" }),
  sex: z.enum(["feminino", "masculino", "outro"], {
    errorMap: () => ({ message: "Selecione o sexo" }),
  }),
  mainDiagnosis: z.string().trim().min(1, "Diagnóstico principal é obrigatório"),
  comorbidities: z.string(),
  allergies: z.string(),
  activeMedications: z.string(),
  emergencyContactName: z.string().trim().min(1, "Nome do contato de emergência é obrigatório"),
  emergencyContactRelationship: z.string().trim().min(1, "Relação com o paciente é obrigatória"),
  emergencyContactPhone: z.string().trim().min(8, "Telefone inválido"),
  caregiverName: z.string().trim().min(1, "Nome do cuidador é obrigatório"),
  caregiverRelationship: z.string().trim().min(1, "Relação do cuidador é obrigatória"),
  caregiverAvailability: z.string().trim().min(1, "Disponibilidade do cuidador é obrigatória"),
  consentGiven: z.boolean(),
});

export type NewPatientFormValues = z.infer<typeof newPatientFormSchema>;

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
