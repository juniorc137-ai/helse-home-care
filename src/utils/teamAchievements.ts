import type { CarePlanTask } from "../types/entities";

/**
 * Conquistas da EQUIPE assistencial (enfermeiro/cuidador), não dos
 * pacientes (ver ADR-006, docs/DECISIONS.md). Mede consistência e
 * completude documental do profissional — nunca ranking ou pontuação de
 * pacientes, para não criar incentivo perverso de "correr" atendimentos.
 */

export const POINTS_PER_TASK_COMPLETED = 10;
export const POINTS_PER_ASSESSMENT = 5;

export type AchievementTier = "bronze" | "prata" | "ouro";

export const TIER_THRESHOLDS: Record<AchievementTier, number> = {
  bronze: 50,
  prata: 150,
  ouro: 300,
};

export const TIER_EMOJI: Record<AchievementTier, string> = {
  bronze: "🥉",
  prata: "🥈",
  ouro: "🥇",
};

export function calculateTeamPoints(tasksCompletedCount: number, assessmentsCompletedCount: number): number {
  return tasksCompletedCount * POINTS_PER_TASK_COMPLETED + assessmentsCompletedCount * POINTS_PER_ASSESSMENT;
}

export function calculateTier(totalPoints: number): AchievementTier | null {
  if (totalPoints >= TIER_THRESHOLDS.ouro) return "ouro";
  if (totalPoints >= TIER_THRESHOLDS.prata) return "prata";
  if (totalPoints >= TIER_THRESHOLDS.bronze) return "bronze";
  return null;
}

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/**
 * Sequência de dias consecutivos em que todas as tarefas agendadas para o
 * dia foram concluídas (consistência da equipe, não frequência de visitas
 * ao paciente). Dias sem nenhuma tarefa agendada não quebram a sequência.
 * O dia de hoje, se ainda tiver pendências, não quebra a sequência (o dia
 * ainda não terminou).
 */
export function calculateConsistencyStreak(allTasks: CarePlanTask[], referenceDate: Date = new Date()): number {
  const byDay = new Map<string, CarePlanTask[]>();
  allTasks
    .filter((t) => !t.deletedAt)
    .forEach((t) => {
      const key = dayKey(t.horarioAgendado);
      const bucket = byDay.get(key) ?? [];
      bucket.push(t);
      byDay.set(key, bucket);
    });

  const cursor = new Date(referenceDate);
  cursor.setHours(0, 0, 0, 0);
  const todayKey = cursor.toISOString().slice(0, 10);

  let streak = 0;
  const MAX_LOOKBACK_DAYS = 3650;
  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    const key = cursor.toISOString().slice(0, 10);
    const dayTasks = byDay.get(key);

    if (dayTasks && dayTasks.length > 0) {
      const allDone = dayTasks.every((t) => t.status === "concluida");
      if (allDone) {
        streak++;
      } else if (key !== todayKey) {
        break;
      }
      // dia de hoje com pendências: não quebra a sequência, apenas não conta ainda
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
