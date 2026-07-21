import * as ExpoCrypto from "expo-crypto";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { recordAuditEvent } from "../services/auditLog";
import type { ClinicalNote, VitalSigns } from "../types/entities";

/** Faixas fisiológicas plausíveis para validação de sinais vitais (seção 2.5). */
export const VITAL_SIGNS_RANGES = {
  systolicBP: { min: 60, max: 260 },
  diastolicBP: { min: 30, max: 150 },
  heartRate: { min: 20, max: 250 },
  respiratoryRate: { min: 4, max: 60 },
  temperature: { min: 25, max: 43 },
  spo2: { min: 50, max: 100 },
  capillaryGlucose: { min: 20, max: 700 },
} as const;

export function validateVitalSigns(vitals: VitalSigns): string[] {
  const errors: string[] = [];
  (Object.keys(VITAL_SIGNS_RANGES) as Array<keyof typeof VITAL_SIGNS_RANGES>).forEach((key) => {
    const value = vitals[key];
    if (value === undefined) return;
    const { min, max } = VITAL_SIGNS_RANGES[key];
    if (value < min || value > max) {
      errors.push(`${key} fora da faixa fisiológica plausível (${min}-${max}): ${value}`);
    }
  });
  return errors;
}

interface NotesState {
  notesByPatient: Record<string, ClinicalNote[]>;
  createDraft: (
    userId: string,
    patientId: string,
    input: { conteudoTexto: string; sinaisVitais?: VitalSigns | null; fotoAnexada?: string | null },
  ) => ClinicalNote;
  finalizeNote: (userId: string, patientId: string, noteId: string) => void;
  createAddendum: (userId: string, patientId: string, originalNoteId: string, conteudoTexto: string) => ClinicalNote;
}

export const useNotesStore = create<NotesState>()(
  immer((set, get) => ({
    notesByPatient: {},
    createDraft: (userId, patientId, input) => {
      if (input.sinaisVitais) {
        const errors = validateVitalSigns(input.sinaisVitais);
        if (errors.length) throw new Error(`Sinais vitais inválidos: ${errors.join("; ")}`);
      }
      const now = new Date().toISOString();
      const note: ClinicalNote = {
        id: ExpoCrypto.randomUUID(),
        patientId,
        dataHora: now,
        profissionalId: userId,
        conteudoTexto: input.conteudoTexto,
        sinaisVitais: input.sinaisVitais ?? null,
        fotoAnexada: input.fotoAnexada ?? null,
        status: "rascunho",
        addendumToNoteId: null,
        createdAt: now,
        updatedAt: now,
      };
      set((state) => {
        if (!state.notesByPatient[patientId]) state.notesByPatient[patientId] = [];
        state.notesByPatient[patientId].push(note);
      });
      recordAuditEvent({ userId, action: "note.create", entityType: "clinicalNote", entityId: note.id, after: note });
      return note;
    },
    finalizeNote: (userId, patientId, noteId) => {
      const note = get().notesByPatient[patientId]?.find((n) => n.id === noteId);
      if (!note) return;
      if (note.status === "finalizada") return; // já imutável
      const before = { ...note };
      set((state) => {
        const n = state.notesByPatient[patientId]?.find((x) => x.id === noteId);
        if (!n) return;
        n.status = "finalizada";
        n.updatedAt = new Date().toISOString();
      });
      const after = get().notesByPatient[patientId]?.find((n) => n.id === noteId);
      recordAuditEvent({ userId, action: "note.finalize", entityType: "clinicalNote", entityId: noteId, before, after });
    },
    /** Nota finalizada é imutável: correções apenas por nota de adendo referenciando a original. */
    createAddendum: (userId, patientId, originalNoteId, conteudoTexto) => {
      const original = get().notesByPatient[patientId]?.find((n) => n.id === originalNoteId);
      if (!original) throw new Error("Nota original não encontrada.");
      if (original.status !== "finalizada") {
        throw new Error("Adendo só é permitido para notas finalizadas.");
      }
      const now = new Date().toISOString();
      const addendum: ClinicalNote = {
        id: ExpoCrypto.randomUUID(),
        patientId,
        dataHora: now,
        profissionalId: userId,
        conteudoTexto,
        sinaisVitais: null,
        fotoAnexada: null,
        status: "rascunho",
        addendumToNoteId: originalNoteId,
        createdAt: now,
        updatedAt: now,
      };
      set((state) => {
        state.notesByPatient[patientId].push(addendum);
      });
      recordAuditEvent({
        userId,
        action: "note.addendum",
        entityType: "clinicalNote",
        entityId: addendum.id,
        after: addendum,
      });
      return addendum;
    },
  })),
);
