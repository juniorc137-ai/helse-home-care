import type {
  AspirationRiskLevel,
  BradenScores,
  DeviceInjuryChecklist,
  MorseScores,
} from "../constants/clinicalScales";

// ---------------------------------------------------------------------------
// RBAC (ver src/constants/permissions.ts para a matriz completa)
// ---------------------------------------------------------------------------

export type Role =
  | "ADMIN"
  | "NURSE"
  | "NURSING_TECH"
  | "PHYSICIAN"
  | "PHYSIO"
  | "CAREGIVER";

export interface User {
  id: string;
  name: string;
  role: Role;
}

// ---------------------------------------------------------------------------
// Paciente
// ---------------------------------------------------------------------------

export type Sex = "feminino" | "masculino" | "outro";

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Caregiver {
  name: string;
  relationship: string;
  availability: string;
}

export interface ConsentInfo {
  consentGiven: boolean;
  consentTimestamp: string; // ISO 8601
  consentVersion: string;
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string; // ISO 8601 date
  sex: Sex;
  mainDiagnosis: string;
  cid10?: string;
  comorbidities: string[];
  allergies: string[];
  activeMedications: string[];
  primaryEmergencyContact: EmergencyContact;
  secondaryEmergencyContact?: EmergencyContact;
  responsibleCaregiver: Caregiver;
  consent: ConsentInfo;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null; // soft delete
}

// ---------------------------------------------------------------------------
// Plano de Cuidados
// ---------------------------------------------------------------------------

export type CarePlanTaskType =
  | "medicacao"
  | "curativo"
  | "mobilizacao"
  | "monitoramento"
  | "outro";

export type CarePlanTaskStatus = "pendente" | "concluida" | "adiada";

export interface CarePlanTask {
  id: string;
  patientId: string;
  descricao: string;
  tipo: CarePlanTaskType;
  horarioAgendado: string; // ISO 8601
  profissionalResponsavel: string; // userId
  status: CarePlanTaskStatus;
  timestampConclusao: string | null;
  notasDoProfissional: string | null;
  /** Ordem de prioridade dentro da coluna do Kanban (drag-and-drop reordena, nunca muda status). */
  priorityOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ---------------------------------------------------------------------------
// Indicadores de assistência
// ---------------------------------------------------------------------------

export type IndicatorType =
  | "braden"
  | "tec"
  | "morse"
  | "aspiracao"
  | "dispositivos"
  | "custom";

export interface BradenAssessment {
  type: "braden";
  scores: BradenScores;
}

export interface TecAssessment {
  type: "tec";
  seconds: number;
  hasContextualFactor: boolean;
  contextualFactorNote?: string;
}

export interface MorseAssessment {
  type: "morse";
  scores: MorseScores;
}

export interface AspirationAssessment {
  type: "aspiracao";
  level: AspirationRiskLevel;
  justification: string;
}

export interface DeviceInjuryAssessment {
  type: "dispositivos";
  checklist: DeviceInjuryChecklist;
}

export interface CustomIndicatorAssessment {
  type: "custom";
  customIndicatorId: string;
  value: number | string;
}

export type IndicatorAssessmentPayload =
  | BradenAssessment
  | TecAssessment
  | MorseAssessment
  | AspirationAssessment
  | DeviceInjuryAssessment
  | CustomIndicatorAssessment;

export interface IndicatorAssessment {
  id: string;
  patientId: string;
  assessedBy: string; // userId
  assessedAt: string; // ISO 8601
  payload: IndicatorAssessmentPayload;
  createdAt: string;
}

/** SHOULD (2.4.6): estrutura genérica para indicadores customizados, sem UI de admin no MVP. */
export interface CustomIndicatorRange {
  min: number;
  max: number;
  label: string;
  color: "verde" | "amarelo" | "vermelho";
}

export interface CustomIndicator {
  id: string;
  name: string;
  scaleType: "numeric" | "categorical";
  ranges: CustomIndicatorRange[];
  createdBy: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Evolução / Prontuário Clínico
// ---------------------------------------------------------------------------

export interface VitalSigns {
  systolicBP?: number; // mmHg
  diastolicBP?: number; // mmHg
  heartRate?: number; // bpm
  respiratoryRate?: number; // irpm
  temperature?: number; // °C
  spo2?: number; // %
  capillaryGlucose?: number; // mg/dL
}

export type ClinicalNoteStatus = "rascunho" | "finalizada";

export interface ClinicalNote {
  id: string;
  patientId: string;
  dataHora: string; // ISO 8601
  profissionalId: string;
  conteudoTexto: string;
  sinaisVitais: VitalSigns | null;
  fotoAnexada: string | null; // local URI, criptografada em repouso
  status: ClinicalNoteStatus;
  /** Nota de adendo: referencia a nota original imutável, nunca a edita. */
  addendumToNoteId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Auditoria (append-only, retenção mínima 20 anos para dados assistenciais)
// ---------------------------------------------------------------------------

export type AuditAction =
  | "patient.create"
  | "task.create"
  | "task.update"
  | "task.complete"
  | "task.remove"
  | "indicator.assess"
  | "note.create"
  | "note.finalize"
  | "note.addendum"
  | "profile.edit"
  | "access.denied"
  | "auth.login"
  | "auth.logout";

export type AuditEntityType =
  | "patient"
  | "carePlanTask"
  | "indicatorAssessment"
  | "clinicalNote"
  | "user";

export interface AuditLogEntry {
  eventId: string;
  timestamp: string; // ISO 8601 UTC
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before: unknown | null;
  after: unknown | null;
  ipAddress: string | null;
  userAgent: string | null;
}
