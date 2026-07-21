import type { CarePlanTask, IndicatorAssessment, IndicatorAssessmentPayload } from "../types/entities";

/** Indicadores clínicos considerados no % de "avaliações em dia" no health card. */
export const CORE_INDICATOR_TYPES: ReadonlyArray<IndicatorAssessmentPayload["type"]> = ["braden", "tec", "morse"];

/** % de tarefas ativas do Care Plan já concluídas (barra de progresso do card do paciente). */
export function calculateTaskCompletionPct(tasks: CarePlanTask[]): number {
  const active = tasks.filter((t) => !t.deletedAt);
  if (active.length === 0) return 0;
  const completed = active.filter((t) => t.status === "concluida").length;
  return Math.round((completed / active.length) * 100);
}

/** % dos indicadores clínicos centrais com pelo menos uma avaliação registrada. */
export function calculateAssessmentsUpToDatePct(assessments: IndicatorAssessment[]): number {
  const typesPresent = new Set(assessments.map((a) => a.payload.type));
  const coveredCount = CORE_INDICATOR_TYPES.filter((type) => typesPresent.has(type)).length;
  return Math.round((coveredCount / CORE_INDICATOR_TYPES.length) * 100);
}

export interface PatientBadge {
  key: string;
  label: string;
  emoji: string;
}

/**
 * Badges de completude por paciente (seção "Perfil do Paciente" do
 * redesign): indicadores binários de qualidade documental, não uma
 * pontuação competitiva do paciente (ver ADR-006 em docs/DECISIONS.md).
 */
export function calculatePatientBadges(taskCompletionPct: number, assessmentsUpToDatePct: number): PatientBadge[] {
  const badges: PatientBadge[] = [];
  if (taskCompletionPct === 100) {
    badges.push({ key: "tasks-100", label: "Plano de cuidados em dia", emoji: "✅" });
  }
  if (assessmentsUpToDatePct === 100) {
    badges.push({ key: "assessments-100", label: "Avaliações completas", emoji: "🎯" });
  }
  return badges;
}
