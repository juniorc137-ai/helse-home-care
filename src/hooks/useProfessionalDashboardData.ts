import { MOCK_PATIENT_ID } from "../data/mockPatients";
import { useCarePlanStore } from "../store/carePlanStore";
import { useIndicatorStore } from "../store/indicatorStore";
import { useNotesStore } from "../store/notesStore";
import { usePatientStore } from "../store/patientStore";
import type { CarePlanTask, ClinicalNote, IndicatorAssessment } from "../types/entities";
import {
  calculateDashboardKpis,
  calculateTodayCarePlanProgress,
  getBradenTrend,
  getCarePlanWeekStatus,
  getLatestMorse,
  getTecTrend,
} from "../utils/dashboardMetrics";
import { calculateConsistencyStreak } from "../utils/teamAchievements";

const EMPTY_TASKS: CarePlanTask[] = [];
const EMPTY_ASSESSMENTS: IndicatorAssessment[] = [];
const EMPTY_NOTES: ClinicalNote[] = [];

/**
 * Dados do dashboard profissional (seções 8-11 do redesign v3), compartilhados
 * entre as variantes A e B. Reativo via hooks Zustand (re-renderiza sozinho
 * quando uma nova avaliação/tarefa/nota é registrada).
 */
export function useProfessionalDashboardData() {
  const patient = usePatientStore((s) => s.getById(MOCK_PATIENT_ID));
  const tasks = useCarePlanStore((s) => s.tasksByPatient[MOCK_PATIENT_ID] ?? EMPTY_TASKS);
  const assessments = useIndicatorStore((s) => s.assessmentsByPatient[MOCK_PATIENT_ID] ?? EMPTY_ASSESSMENTS);
  const notes = useNotesStore((s) => s.notesByPatient[MOCK_PATIENT_ID] ?? EMPTY_NOTES);

  return {
    patient,
    kpis: calculateDashboardKpis(tasks, assessments),
    bradenTrend: getBradenTrend(assessments),
    tecTrend: getTecTrend(assessments),
    latestMorse: getLatestMorse(assessments),
    carePlanWeek: getCarePlanWeekStatus(tasks),
    recentNotes: notes,
    tasks,
    todayProgressPct: calculateTodayCarePlanProgress(tasks),
    noOverdueStreakDays: calculateConsistencyStreak(tasks),
  };
}
