import type { Patient } from "../types/entities";

/**
 * Paciente mock único (substitui o conjunto de 20 pacientes gerados
 * aleatoriamente na Fase 1 — decisão registrada em ADR-009,
 * docs/DECISIONS.md). Dados fixos e plausíveis para demonstração.
 */
export const MOCK_PATIENT_ID = "patient-valdir";

const SEED_TIMESTAMP = "2026-06-01T09:00:00.000Z";

export const mockPatients: Patient[] = [
  {
    id: MOCK_PATIENT_ID,
    name: "Valdir da Silva",
    cpf: "12345678909",
    birthDate: "1964-03-15", // 62 anos em julho de 2026
    sex: "masculino",
    mainDiagnosis: "Insuficiência cardíaca (CID I50.0)",
    cid10: "I50.0",
    comorbidities: ["Hipertensão", "Diabetes tipo 2"],
    allergies: ["Dipirona"],
    activeMedications: ["Losartana 50mg 12/12h", "Metformina 850mg 12/12h", "AAS 100mg 1x/dia"],
    primaryEmergencyContact: { name: "Marlene da Silva", relationship: "Esposa", phone: "(11) 98765-4321" },
    secondaryEmergencyContact: { name: "Roberto da Silva", relationship: "Filho", phone: "(11) 97654-3210" },
    responsibleCaregiver: { name: "Marlene da Silva", relationship: "Esposa (cuidadora familiar integral)", availability: "Integral (24h)" },
    consent: { consentGiven: true, consentTimestamp: SEED_TIMESTAMP, consentVersion: "1.0.0" },
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
    deletedAt: null,
  },
];
