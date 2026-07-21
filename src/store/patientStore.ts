import * as ExpoCrypto from "expo-crypto";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { recordAuditEvent } from "../services/auditLog";
import { assertPermission } from "../services/permissionGuard";
import type { Caregiver, ConsentInfo, EmergencyContact, Patient, Role, Sex } from "../types/entities";
import { mockPatients } from "../data/mockPatients";

/** Campos coletados pelo formulário "Novo Paciente" (seção 2.1/2.2, ADR-005 revisado). */
export interface NewPatientInput {
  name: string;
  cpf: string;
  birthDate: string;
  sex: Sex;
  mainDiagnosis: string;
  comorbidities: string[];
  allergies: string[];
  activeMedications: string[];
  primaryEmergencyContact: EmergencyContact;
  responsibleCaregiver: Caregiver;
  consentGiven: boolean;
}

interface PatientState {
  patients: Patient[];
  hydrated: boolean;
  hydrateMock: () => void;
  getById: (id: string) => Patient | undefined;
  addPatient: (userId: string, input: NewPatientInput) => Patient;
  updatePatient: (id: string, changes: Partial<Patient>) => void;
  /** Remoção auditada, restrita a ADMIN via matriz RBAC (patient.editProfile). */
  removePatient: (userId: string, role: Role, patientId: string) => void;
}

export const usePatientStore = create<PatientState>()(
  immer((set, get) => ({
    patients: [],
    hydrated: false,
    hydrateMock: () =>
      set((state) => {
        if (state.hydrated) return;
        state.patients = mockPatients;
        state.hydrated = true;
      }),
    getById: (id) => get().patients.find((p) => p.id === id),
    addPatient: (userId, input) => {
      const now = new Date().toISOString();
      const consent: ConsentInfo = {
        consentGiven: input.consentGiven,
        consentTimestamp: now,
        consentVersion: input.consentGiven ? "1.0.0" : "",
      };
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
        primaryEmergencyContact: input.primaryEmergencyContact,
        responsibleCaregiver: input.responsibleCaregiver,
        consent,
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
    removePatient: (userId, role, patientId) => {
      assertPermission(userId, role, "patient.editProfile", { entityType: "patient", entityId: patientId });
      const before = get().patients.find((p) => p.id === patientId);
      if (!before) return;
      const beforeSnapshot = { ...before };
      set((state) => {
        const patient = state.patients.find((p) => p.id === patientId);
        if (!patient) return;
        patient.deletedAt = new Date().toISOString();
        patient.updatedAt = patient.deletedAt;
      });
      const after = get().patients.find((p) => p.id === patientId);
      recordAuditEvent({ userId, action: "patient.remove", entityType: "patient", entityId: patientId, before: beforeSnapshot, after });
    },
  })),
);
