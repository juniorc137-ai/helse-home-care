import { bucketTasksForKanban } from "../../src/utils/kanbanBuckets";
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

describe("bucketTasksForKanban", () => {
  const NOW = new Date("2026-07-21T10:00:00.000Z");

  it("coloca tarefas concluídas em Completo, independente da data", () => {
    const buckets = bucketTasksForKanban([makeTask({ status: "concluida", horarioAgendado: "2099-01-01T00:00:00.000Z" })], NOW);
    expect(buckets.completo).toHaveLength(1);
    expect(buckets.hoje).toHaveLength(0);
    expect(buckets.pendente).toHaveLength(0);
  });

  it("coloca tarefas de hoje em Hoje", () => {
    const buckets = bucketTasksForKanban([makeTask({ horarioAgendado: "2026-07-21T18:00:00.000Z" })], NOW);
    expect(buckets.hoje).toHaveLength(1);
  });

  it("coloca tarefas atrasadas (data passada, ainda pendentes) em Hoje", () => {
    const buckets = bucketTasksForKanban([makeTask({ horarioAgendado: "2026-07-19T08:00:00.000Z" })], NOW);
    expect(buckets.hoje).toHaveLength(1);
  });

  it("coloca tarefas futuras em Pendente", () => {
    const buckets = bucketTasksForKanban([makeTask({ horarioAgendado: "2026-07-25T08:00:00.000Z" })], NOW);
    expect(buckets.pendente).toHaveLength(1);
  });

  it("ignora tarefas removidas (soft delete)", () => {
    const buckets = bucketTasksForKanban([makeTask({ deletedAt: "2026-01-01T00:00:00.000Z" })], NOW);
    expect(buckets.pendente).toHaveLength(0);
    expect(buckets.hoje).toHaveLength(0);
    expect(buckets.completo).toHaveLength(0);
  });

  it("ordena cada coluna por priorityOrder", () => {
    const buckets = bucketTasksForKanban(
      [
        makeTask({ id: "a", horarioAgendado: "2026-07-25T08:00:00.000Z", priorityOrder: 2 }),
        makeTask({ id: "b", horarioAgendado: "2026-07-26T08:00:00.000Z", priorityOrder: 0 }),
        makeTask({ id: "c", horarioAgendado: "2026-07-27T08:00:00.000Z", priorityOrder: 1 }),
      ],
      NOW,
    );
    expect(buckets.pendente.map((t) => t.id)).toEqual(["b", "c", "a"]);
  });
});
