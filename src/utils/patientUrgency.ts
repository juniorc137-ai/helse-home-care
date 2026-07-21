import type { CarePlanTask } from "../types/entities";
import type { PatientAlert } from "./patientAlerts";

/** Peso de urgência por severidade de alerta (usado no "card principal do dia"). */
const ALERT_WEIGHT: Record<PatientAlert["tone"], number> = {
  danger: 3,
  warning: 1,
  ok: 0,
  neutral: 0,
};

const OVERDUE_TASK_WEIGHT = 2;

/** Escore de urgência de um paciente: soma de alertas ponderados + tarefas atrasadas. */
export function calculateUrgencyScore(alerts: PatientAlert[], tasks: CarePlanTask[], now: Date = new Date()): number {
  const alertScore = alerts.reduce((sum, alert) => sum + ALERT_WEIGHT[alert.tone], 0);
  const overdueCount = tasks.filter((t) => !t.deletedAt && t.status !== "concluida" && new Date(t.horarioAgendado).getTime() < now.getTime()).length;
  return alertScore + overdueCount * OVERDUE_TASK_WEIGHT;
}

export interface UrgencyRankable {
  id: string;
}

/** Seleciona o paciente de maior urgência para o card destacado do dashboard. */
export function pickMostUrgentPatient<T extends UrgencyRankable>(patients: T[], urgencyById: Record<string, number>): T | null {
  if (patients.length === 0) return null;
  return [...patients].sort((a, b) => (urgencyById[b.id] ?? 0) - (urgencyById[a.id] ?? 0))[0];
}
