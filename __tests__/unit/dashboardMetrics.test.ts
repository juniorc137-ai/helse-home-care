import {
  calculateDashboardKpis,
  getBradenTrend,
  getCarePlanWeekStatus,
  getLatestMorse,
  getTecTrend,
} from "../../src/utils/dashboardMetrics";
import type { CarePlanTask, IndicatorAssessment } from "../../src/types/entities";
import { BRADEN_FIXTURE_HIGH_RISK, MORSE_FIXTURE_HIGH_RISK } from "../fixtures/clinicalFixtures";

const NOW = new Date("2026-07-21T12:00:00.000Z");

function makeTask(overrides: Partial<CarePlanTask> = {}): CarePlanTask {
  return {
    id: "t1",
    patientId: "p1",
    descricao: "Tarefa",
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
    ...overrides,
  };
}

function makeAssessment(overrides: Partial<IndicatorAssessment> = {}): IndicatorAssessment {
  return {
    id: "a1",
    patientId: "p1",
    assessedBy: "u1",
    assessedAt: "2026-07-21T08:00:00.000Z",
    payload: { type: "tec", seconds: 1, hasContextualFactor: false },
    createdAt: "2026-07-21T08:00:00.000Z",
    ...overrides,
  };
}

describe("calculateDashboardKpis", () => {
  it("conta tarefas pendentes hoje e atrasadas separadamente", () => {
    const tasks = [
      makeTask({ id: "future-today", horarioAgendado: "2026-07-21T18:00:00.000Z" }),
      makeTask({ id: "overdue", horarioAgendado: "2026-07-21T08:00:00.000Z" }),
      makeTask({ id: "done", status: "concluida", horarioAgendado: "2026-07-21T08:00:00.000Z" }),
    ];
    const kpis = calculateDashboardKpis(tasks, [], NOW);
    expect(kpis.pendingToday).toBe(1);
    expect(kpis.overdue).toBe(1);
  });

  it("conta avaliações nos últimos 7 dias", () => {
    const assessments = [
      makeAssessment({ id: "recent", assessedAt: "2026-07-20T08:00:00.000Z" }),
      makeAssessment({ id: "old", assessedAt: "2026-06-01T08:00:00.000Z" }),
    ];
    expect(calculateDashboardKpis([], assessments, NOW).assessmentsLast7Days).toBe(1);
  });

  it("conta alertas críticos ativos (Braden alto, TEC alterado, Morse elevado, tarefas atrasadas)", () => {
    const assessments = [
      makeAssessment({ id: "braden", payload: { type: "braden", scores: BRADEN_FIXTURE_HIGH_RISK } }),
      makeAssessment({ id: "morse", payload: { type: "morse", scores: MORSE_FIXTURE_HIGH_RISK } }),
    ];
    const tasks = [makeTask({ horarioAgendado: "2026-07-21T08:00:00.000Z" })]; // atrasada
    const kpis = calculateDashboardKpis(tasks, assessments, NOW);
    expect(kpis.activeCriticalAlerts).toBe(3); // braden + morse + tarefas atrasadas
  });
});

describe("getBradenTrend / getTecTrend", () => {
  it("retorna apenas o tipo correto, ordenado cronologicamente, limitado ao N mais recente", () => {
    const assessments = [
      makeAssessment({ id: "b1", assessedAt: "2026-07-19T08:00:00.000Z", payload: { type: "braden", scores: BRADEN_FIXTURE_HIGH_RISK } }),
      makeAssessment({ id: "t1", assessedAt: "2026-07-20T08:00:00.000Z", payload: { type: "tec", seconds: 3.5, hasContextualFactor: false } }),
      makeAssessment({ id: "b2", assessedAt: "2026-07-21T08:00:00.000Z", payload: { type: "braden", scores: BRADEN_FIXTURE_HIGH_RISK } }),
    ];
    const bradenTrend = getBradenTrend(assessments);
    expect(bradenTrend).toHaveLength(2);
    expect(bradenTrend[0].value).toBe(10);
    expect(bradenTrend[1].date).toBe("2026-07-21T08:00:00.000Z");

    const tecTrend = getTecTrend(assessments);
    expect(tecTrend).toHaveLength(1);
    expect(tecTrend[0].value).toBe(3.5);
    expect(tecTrend[0].label).toBe("Alterado");
  });

  it("respeita o limite (últimas N)", () => {
    const assessments = Array.from({ length: 12 }, (_, i) =>
      makeAssessment({ id: `b${i}`, assessedAt: `2026-07-${String(i + 1).padStart(2, "0")}T08:00:00.000Z`, payload: { type: "braden", scores: BRADEN_FIXTURE_HIGH_RISK } }),
    );
    expect(getBradenTrend(assessments, 8)).toHaveLength(8);
  });
});

describe("getLatestMorse", () => {
  it("retorna null sem avaliação de Morse", () => {
    expect(getLatestMorse([])).toBeNull();
  });

  it("retorna a avaliação mais recente", () => {
    const assessments = [
      makeAssessment({ id: "old", assessedAt: "2026-07-01T08:00:00.000Z", payload: { type: "morse", scores: { historicoQuedas: 0, diagnosticoSecundario: 0, auxilioDeambulacao: 0, terapiaEndovenosa: 0, marcha: 0, estadoMental: 0 } } }),
      makeAssessment({ id: "new", assessedAt: "2026-07-20T08:00:00.000Z", payload: { type: "morse", scores: MORSE_FIXTURE_HIGH_RISK } }),
    ];
    const latest = getLatestMorse(assessments);
    expect(latest?.score).toBe(50);
    expect(latest?.classification).toBe("Risco elevado");
  });
});

describe("getCarePlanWeekStatus", () => {
  it("retorna 7 dias com contagem por status", () => {
    const tasks = [makeTask({ horarioAgendado: "2026-07-21T14:00:00.000Z", status: "concluida" })];
    const days = getCarePlanWeekStatus(tasks, NOW);
    expect(days).toHaveLength(7);
    const today = days[days.length - 1];
    expect(today.concluida).toBe(1);
  });
});
