import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Patient } from "../types/entities";
import { generateMockPatients } from "../utils/mockData";

interface PatientState {
  patients: Patient[];
  hydrated: boolean;
  hydrateMock: () => void;
  getById: (id: string) => Patient | undefined;
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
