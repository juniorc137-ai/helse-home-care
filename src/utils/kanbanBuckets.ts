import type { CarePlanTask } from "../types/entities";

export type KanbanColumnKey = "pendente" | "hoje" | "completo";

export const KANBAN_COLUMNS: ReadonlyArray<{ key: KanbanColumnKey; title: string }> = [
  { key: "pendente", title: "Pendente" },
  { key: "hoje", title: "Hoje" },
  { key: "completo", title: "Completo" },
];

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Agrupa tarefas em Pendente/Hoje/Completo (Kanban do Care Plan, redesign
 * v2). As colunas são um agrupamento visual pelo status real da tarefa —
 * nenhuma tarefa muda de coluna por ação do usuário além de concluir
 * (swipe) ou ter seu horário alterado (edição). Tarefas atrasadas (data
 * passada, ainda pendentes) aparecem em "Hoje" junto com as de hoje.
 */
export function bucketTasksForKanban(tasks: CarePlanTask[], now: Date = new Date()): Record<KanbanColumnKey, CarePlanTask[]> {
  const active = tasks.filter((t) => !t.deletedAt);
  const buckets: Record<KanbanColumnKey, CarePlanTask[]> = { pendente: [], hoje: [], completo: [] };

  active.forEach((task) => {
    if (task.status === "concluida") {
      buckets.completo.push(task);
      return;
    }
    const scheduled = new Date(task.horarioAgendado);
    const isTodayOrOverdue = isSameDay(scheduled, now) || scheduled.getTime() < now.getTime();
    if (isTodayOrOverdue) {
      buckets.hoje.push(task);
    } else {
      buckets.pendente.push(task);
    }
  });

  (Object.keys(buckets) as KanbanColumnKey[]).forEach((key) => {
    buckets[key].sort((a, b) => a.priorityOrder - b.priorityOrder);
  });

  return buckets;
}
