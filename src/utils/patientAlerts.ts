import { classifyBradenScore, calculateBradenScore, classifyTec } from "../constants/clinicalScales";
import type { BadgeTone } from "../components/StatusBadge";
import type { BradenAssessment, CarePlanTask, IndicatorAssessment, TecAssessment } from "../types/entities";

export interface PatientAlert {
  label: string;
  tone: BadgeTone;
}

const HIGH_RISK_BRADEN_LABELS = ["Risco alto", "Risco muito alto"];

/**
 * Até 3 alertas críticos para o card do dashboard (seção 2.1): Braden em
 * risco alto/muito alto, TEC alterado, medicação pendente.
 */
export function getPatientAlerts(
  indicatorAssessments: IndicatorAssessment[],
  carePlanTasks: CarePlanTask[],
): PatientAlert[] {
  const alerts: PatientAlert[] = [];

  const bradenAssessments = indicatorAssessments.filter((a) => a.payload.type === "braden");
  const latestBraden = bradenAssessments[bradenAssessments.length - 1];
  if (latestBraden) {
    const payload = latestBraden.payload as BradenAssessment;
    const score = calculateBradenScore(payload.scores);
    const label = classifyBradenScore(score);
    if (HIGH_RISK_BRADEN_LABELS.includes(label)) {
      alerts.push({ label: `Braden: ${label} (${score})`, tone: "danger" });
    }
  }

  const tecAssessments = indicatorAssessments.filter((a) => a.payload.type === "tec");
  const latestTec = tecAssessments[tecAssessments.length - 1];
  if (latestTec) {
    const payload = latestTec.payload as TecAssessment;
    const classification = classifyTec(payload.seconds);
    if (classification.label === "Alterado") {
      alerts.push({ label: `TEC alterado (${payload.seconds}s)`, tone: "danger" });
    }
  }

  const pendingMedication = carePlanTasks.find((t) => t.tipo === "medicacao" && t.status === "pendente" && !t.deletedAt);
  if (pendingMedication) {
    alerts.push({ label: "Medicação pendente", tone: "warning" });
  }

  return alerts.slice(0, 3);
}
