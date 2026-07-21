import { getPatientAlerts } from "../../src/utils/patientAlerts";
import type { CarePlanTask, IndicatorAssessment } from "../../src/types/entities";
import { BRADEN_FIXTURE_HIGH_RISK } from "../fixtures/clinicalFixtures";

function bradenAssessment(): IndicatorAssessment {
  return {
    id: "a1",
    patientId: "p1",
    assessedBy: "u1",
    assessedAt: "2026-07-21T08:00:00.000Z",
    payload: { type: "braden", scores: BRADEN_FIXTURE_HIGH_RISK },
    createdAt: "2026-07-21T08:00:00.000Z",
  };
}

function tecAssessment(seconds: number): IndicatorAssessment {
  return {
    id: "a2",
    patientId: "p1",
    assessedBy: "u1",
    assessedAt: "2026-07-21T08:00:00.000Z",
    payload: { type: "tec", seconds, hasContextualFactor: false },
    createdAt: "2026-07-21T08:00:00.000Z",
  };
}

function pendingMedicationTask(): CarePlanTask {
  return {
    id: "t1",
    patientId: "p1",
    descricao: "Administrar medicação",
    tipo: "medicacao",
    horarioAgendado: "2026-07-21T14:00:00.000Z",
    profissionalResponsavel: "u1",
    status: "pendente",
    timestampConclusao: null,
    notasDoProfissional: null,
    priorityOrder: 0,
    createdAt: "2026-07-21T08:00:00.000Z",
    updatedAt: "2026-07-21T08:00:00.000Z",
    deletedAt: null,
  };
}

describe("getPatientAlerts (dashboard, seção 2.1)", () => {
  it("alerta para Braden em risco alto", () => {
    const alerts = getPatientAlerts([bradenAssessment()], []);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].label).toContain("Risco alto");
    expect(alerts[0].tone).toBe("danger");
  });

  it("alerta para TEC alterado", () => {
    const alerts = getPatientAlerts([tecAssessment(3.5)], []);
    expect(alerts[0].label).toContain("TEC alterado");
  });

  it("não alerta para TEC normal", () => {
    expect(getPatientAlerts([tecAssessment(1.5)], [])).toHaveLength(0);
  });

  it("alerta para medicação pendente", () => {
    const alerts = getPatientAlerts([], [pendingMedicationTask()]);
    expect(alerts[0].label).toBe("Medicação pendente");
  });

  it("limita a no máximo 3 alertas", () => {
    const alerts = getPatientAlerts([bradenAssessment(), tecAssessment(3.5)], [pendingMedicationTask()]);
    expect(alerts.length).toBeLessThanOrEqual(3);
  });
});
