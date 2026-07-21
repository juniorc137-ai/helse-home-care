import {
  calculateAssessmentsUpToDatePct,
  calculatePatientBadges,
  calculateTaskCompletionPct,
} from "../../src/utils/patientProgress";
import type { CarePlanTask, IndicatorAssessment } from "../../src/types/entities";

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

function makeAssessment(type: "braden" | "tec" | "morse"): IndicatorAssessment {
  const payload =
    type === "braden"
      ? ({ type: "braden", scores: { percepcaoSensorial: 4, umidade: 4, atividade: 4, mobilidade: 4, nutricao: 4, friccaoCisalhamento: 3 } } as const)
      : type === "tec"
        ? ({ type: "tec", seconds: 1, hasContextualFactor: false } as const)
        : ({
            type: "morse",
            scores: { historicoQuedas: 0, diagnosticoSecundario: 0, auxilioDeambulacao: 0, terapiaEndovenosa: 0, marcha: 0, estadoMental: 0 },
          } as const);
  return { id: `a-${type}`, patientId: "p1", assessedBy: "u1", assessedAt: "2026-07-21T08:00:00.000Z", payload, createdAt: "2026-07-21T08:00:00.000Z" };
}

describe("calculateTaskCompletionPct", () => {
  it("retorna 0 quando não há tarefas", () => {
    expect(calculateTaskCompletionPct([])).toBe(0);
  });

  it("ignora tarefas removidas (soft delete) no cálculo", () => {
    const tasks = [makeTask({ status: "concluida" }), makeTask({ id: "t2", deletedAt: "2026-01-01T00:00:00.000Z" })];
    expect(calculateTaskCompletionPct(tasks)).toBe(100);
  });

  it("calcula percentual correto com tarefas mistas", () => {
    const tasks = [makeTask({ status: "concluida" }), makeTask({ id: "t2" }), makeTask({ id: "t3" }), makeTask({ id: "t4" })];
    expect(calculateTaskCompletionPct(tasks)).toBe(25);
  });
});

describe("calculateAssessmentsUpToDatePct", () => {
  it("retorna 0 sem nenhuma avaliação", () => {
    expect(calculateAssessmentsUpToDatePct([])).toBe(0);
  });

  it("retorna 100 quando braden, tec e morse estão presentes", () => {
    expect(calculateAssessmentsUpToDatePct([makeAssessment("braden"), makeAssessment("tec"), makeAssessment("morse")])).toBe(100);
  });

  it("calcula percentual parcial (1 de 3)", () => {
    expect(calculateAssessmentsUpToDatePct([makeAssessment("braden")])).toBe(33);
  });
});

describe("calculatePatientBadges (completude, não ranking do paciente)", () => {
  it("sem badges quando nada está completo", () => {
    expect(calculatePatientBadges(50, 50)).toHaveLength(0);
  });

  it("badge de plano de cuidados em dia com 100% de tarefas", () => {
    const badges = calculatePatientBadges(100, 50);
    expect(badges.map((b) => b.key)).toEqual(["tasks-100"]);
  });

  it("ambos os badges quando tudo está 100%", () => {
    const badges = calculatePatientBadges(100, 100);
    expect(badges.map((b) => b.key)).toEqual(["tasks-100", "assessments-100"]);
  });
});
