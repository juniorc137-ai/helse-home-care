import type { BadgeTone } from "../components/StatusBadge";
import type { CarePlanTask } from "../types/entities";

/** Janela antes do horário agendado considerada "próximo do horário" (seção 2.3). */
export const TASK_WARNING_WINDOW_MINUTES = 30;

export type TaskStatusToneLabel = "Em dia" | "Próximo do horário" | "Atrasado" | "Concluída" | "Adiada";

export interface TaskStatusDisplay {
  label: TaskStatusToneLabel;
  tone: BadgeTone;
}

/** Semáforo de status do Care Plan: verde (em dia), amarelo (próximo/adiada), vermelho (atrasado). */
export function getTaskStatusDisplay(task: CarePlanTask, now: Date = new Date()): TaskStatusDisplay {
  if (task.status === "concluida") return { label: "Concluída", tone: "ok" };
  if (task.status === "adiada") return { label: "Adiada", tone: "warning" };

  const scheduled = new Date(task.horarioAgendado).getTime();
  const minutesUntil = (scheduled - now.getTime()) / 60_000;

  if (minutesUntil < 0) return { label: "Atrasado", tone: "danger" };
  if (minutesUntil <= TASK_WARNING_WINDOW_MINUTES) return { label: "Próximo do horário", tone: "warning" };
  return { label: "Em dia", tone: "ok" };
}
