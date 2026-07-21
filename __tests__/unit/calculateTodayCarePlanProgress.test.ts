import { calculateTodayCarePlanProgress } from "../../src/utils/dashboardMetrics";
import type { CarePlanTask } from "../../src/types/entities";

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

describe("calculateTodayCarePlanProgress (micro-gamificação Variante B)", () => {
  it("retorna 0 sem tarefas hoje", () => {
    expect(calculateTodayCarePlanProgress([], NOW)).toBe(0);
  });

  it("calcula percentual de tarefas de hoje concluídas, ignorando outros dias", () => {
    const tasks = [
      makeTask({ id: "a", status: "concluida" }),
      makeTask({ id: "b", status: "pendente" }),
      makeTask({ id: "c", horarioAgendado: "2026-07-19T08:00:00.000Z", status: "concluida" }), // outro dia
    ];
    expect(calculateTodayCarePlanProgress(tasks, NOW)).toBe(50);
  });
});
