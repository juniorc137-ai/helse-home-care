import type { CarePlanTask } from "../types/entities";

/** Gera tarefas de Care Plan mock para um paciente, ancoradas na data de referência. */
export function generateMockCarePlanTasks(patientId: string, referenceDate: Date = new Date("2026-07-21T12:00:00Z")): CarePlanTask[] {
  const base = new Date(referenceDate);
  const tasks: Array<Pick<CarePlanTask, "descricao" | "tipo" | "status"> & { hour: number }> = [
    { descricao: "Administrar medicação anti-hipertensiva", tipo: "medicacao", status: "pendente", hour: 8 },
    { descricao: "Trocar curativo", tipo: "curativo", status: "concluida", hour: 11 },
    { descricao: "Visita de acompanhamento cardíaco", tipo: "monitoramento", status: "pendente", hour: 14 },
    { descricao: "Monitorar sinais vitais", tipo: "monitoramento", status: "pendente", hour: 17 },
  ];

  return tasks.map((t, idx) => {
    const scheduled = new Date(base);
    scheduled.setHours(t.hour, 0, 0, 0);
    const nowIso = base.toISOString();
    return {
      id: `${patientId}-task-${idx + 1}`,
      patientId,
      descricao: t.descricao,
      tipo: t.tipo,
      horarioAgendado: scheduled.toISOString(),
      profissionalResponsavel: "user-nurse-01",
      status: t.status,
      timestampConclusao: t.status === "concluida" ? nowIso : null,
      notasDoProfissional: null,
      priorityOrder: idx,
      createdAt: nowIso,
      updatedAt: nowIso,
      deletedAt: null,
    };
  });
}
