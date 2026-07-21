import { getTaskStatusDisplay } from "../../src/utils/taskStatusTone";
import type { CarePlanTask } from "../../src/types/entities";

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

describe("getTaskStatusDisplay (semáforo do Care Plan, seção 2.3)", () => {
  it("tarefa concluída é sempre verde", () => {
    expect(getTaskStatusDisplay(makeTask({ status: "concluida" })).label).toBe("Concluída");
  });

  it("tarefa adiada é amarela", () => {
    expect(getTaskStatusDisplay(makeTask({ status: "adiada" })).tone).toBe("warning");
  });

  it("tarefa pendente muito no futuro é verde (em dia)", () => {
    const now = new Date("2026-07-21T10:00:00.000Z");
    expect(getTaskStatusDisplay(makeTask(), now).label).toBe("Em dia");
  });

  it("tarefa pendente dentro da janela de 30min é amarela", () => {
    const now = new Date("2026-07-21T13:45:00.000Z");
    expect(getTaskStatusDisplay(makeTask(), now).label).toBe("Próximo do horário");
  });

  it("tarefa pendente com horário já passado é vermelha (atrasada)", () => {
    const now = new Date("2026-07-21T14:01:00.000Z");
    expect(getTaskStatusDisplay(makeTask(), now).label).toBe("Atrasado");
  });
});
