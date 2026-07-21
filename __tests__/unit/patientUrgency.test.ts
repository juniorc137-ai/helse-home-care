import { calculateUrgencyScore, pickMostUrgentPatient } from "../../src/utils/patientUrgency";
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

describe("calculateUrgencyScore", () => {
  it("soma alertas por severidade e tarefas atrasadas", () => {
    const now = new Date("2026-07-21T15:00:00.000Z");
    const score = calculateUrgencyScore(
      [{ label: "TEC alterado", tone: "danger" }, { label: "Medicação pendente", tone: "warning" }],
      [makeTask()], // atrasada às 14h, agora são 15h
      now,
    );
    expect(score).toBe(3 + 1 + 2);
  });

  it("ignora tarefas concluídas e removidas na contagem de atraso", () => {
    const now = new Date("2026-07-21T15:00:00.000Z");
    const score = calculateUrgencyScore([], [makeTask({ status: "concluida" }), makeTask({ deletedAt: "2026-01-01T00:00:00.000Z" })], now);
    expect(score).toBe(0);
  });
});

describe("pickMostUrgentPatient", () => {
  it("retorna null para lista vazia", () => {
    expect(pickMostUrgentPatient([], {})).toBeNull();
  });

  it("escolhe o paciente com maior urgência", () => {
    const patients = [{ id: "p1" }, { id: "p2" }, { id: "p3" }];
    const result = pickMostUrgentPatient(patients, { p1: 2, p2: 9, p3: 5 });
    expect(result?.id).toBe("p2");
  });
});
