import * as ExpoCrypto from "expo-crypto";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { requiresTecCoordinatorAlert } from "../constants/clinicalScales";
import { recordAuditEvent } from "../services/auditLog";
import type { IndicatorAssessment, IndicatorAssessmentPayload, TecAssessment } from "../types/entities";

interface IndicatorState {
  assessmentsByPatient: Record<string, IndicatorAssessment[]>;
  pendingCoordinatorAlerts: string[]; // assessment ids
  addAssessment: (userId: string, patientId: string, payload: IndicatorAssessmentPayload) => IndicatorAssessment;
  getLatest: (patientId: string, type: IndicatorAssessmentPayload["type"]) => IndicatorAssessment | undefined;
  getHistory: (patientId: string, type: IndicatorAssessmentPayload["type"]) => IndicatorAssessment[];
}

export const useIndicatorStore = create<IndicatorState>()(
  immer((set, get) => ({
    assessmentsByPatient: {},
    pendingCoordinatorAlerts: [],
    addAssessment: (userId, patientId, payload) => {
      const now = new Date().toISOString();
      const assessment: IndicatorAssessment = {
        id: ExpoCrypto.randomUUID(),
        patientId,
        assessedBy: userId,
        assessedAt: now,
        payload,
        createdAt: now,
      };
      set((state) => {
        if (!state.assessmentsByPatient[patientId]) state.assessmentsByPatient[patientId] = [];
        state.assessmentsByPatient[patientId].push(assessment);

        if (payload.type === "tec") {
          const tec = payload as TecAssessment;
          if (requiresTecCoordinatorAlert(tec.seconds, tec.hasContextualFactor)) {
            state.pendingCoordinatorAlerts.push(assessment.id);
          }
        }
      });
      recordAuditEvent({
        userId,
        action: "indicator.assess",
        entityType: "indicatorAssessment",
        entityId: assessment.id,
        after: assessment,
      });
      return assessment;
    },
    getLatest: (patientId, type) => {
      const history = get().assessmentsByPatient[patientId] ?? [];
      const filtered = history.filter((a) => a.payload.type === type);
      return filtered.length ? filtered[filtered.length - 1] : undefined;
    },
    getHistory: (patientId, type) => {
      return (get().assessmentsByPatient[patientId] ?? []).filter((a) => a.payload.type === type);
    },
  })),
);
