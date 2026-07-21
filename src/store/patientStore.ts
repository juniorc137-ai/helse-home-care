import * as ExpoCrypto from "expo-crypto";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { recordAuditEvent } from "../services/auditLog";
import type { Patient, Sex } from "../types/entities";
import { generateMockPatients } from "../utils/mockData";

/**
 * Campos coletados pelo formulário "Novo Paciente" (seção 2.1/2.2). Contato
 * de emergência, cuidador responsável e consentimento LGPD não são
 * coletados neste formulário e ficam pendentes de complementação via
 * "Editar perfil" (ver ADR-005 em docs/DECISIONS.md).
 */
export interface NewPatientInput {
  name: string;
  cpf: string;
  birthDate: string;
  sex: Sex;
  mainDiagnosis: string;
  comorbidities: string[];
  allergies: string[];
  activeMedications: string[];
}

interface PatientState {
  patients: Patient[];
  hydrated: boolean;
  hydrateMock: () => void;
  getById: (id: string) => Patient | undefined;
  createPatient: (userId: string, input: NewPatientInput) => Patient;
  updatePatient: (id: string, changes: Partial<Patient>) => void;
  softDeletePatient: (id: string) => void;
}

export const usePatientStore = create<PatientState>()(
  immer((set, get) => ({
    patients: [],
    hydrated: false,
    hydrateMock: () =>
      set((state) => {
        if (state.hydrated) return;
        state.patients = generateMockPatients();
        state.hydrated = true;
      }),
    getById: (id) => get().patients.find((p) => p.id === id),
    createPatient: (userId, input) => {
      const now = new Date().toISOString();
      const patient: Patient = {
        id: ExpoCrypto.randomUUID(),
        name: input.name,
        cpf: input.cpf,
        birthDate: input.birthDate,
        sex: input.sex,
        mainDiagnosis: input.mainDiagnosis,
        comorbidities: input.comorbidities,
        allergies: input.allergies,
        activeMedications: input.activeMedications,
        primaryEmergencyContact: { name: "", relationship: "", phone: "" },
        responsibleCaregiver: { name: "", relationship: "", availability: "" },
        consent: { consentGiven: false, consentTimestamp: now, consentVersion: "" },
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      set((state) => {
        state.patients.push(patient);
      });
      recordAuditEvent({ userId, action: "patient.create", entityType: "patient", entityId: patient.id, after: patient });
      return patient;
    },
    updatePatient: (id, changes) =>
      set((state) => {
        const patient = state.patients.find((p) => p.id === id);
        if (!patient) return;
        Object.assign(patient, changes, { updatedAt: new Date().toISOString() });
      }),
    softDeletePatient: (id) =>
      set((state) => {
        const patient = state.patients.find((p) => p.id === id);
        if (!patient) return;
        patient.deletedAt = new Date().toISOString();
      }),
  })),
);
