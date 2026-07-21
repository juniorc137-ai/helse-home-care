import {
  calculateBradenScore,
  calculateMorseScore,
  classifyBradenScore,
  classifyMorseScore,
  classifyTec,
} from "../constants/clinicalScales";
import type { BradenAssessment, CarePlanTask, IndicatorAssessment, MorseAssessment, TecAssessment } from "../types/entities";

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** % de tarefas de hoje já concluídas (micro-gamificação da Variante B: "care plan do dia"). */
export function calculateTodayCarePlanProgress(tasks: CarePlanTask[], now: Date = new Date()): number {
  const todayTasks = tasks.filter((t) => !t.deletedAt && isSameDay(new Date(t.horarioAgendado), now));
  if (todayTasks.length === 0) return 0;
  const done = todayTasks.filter((t) => t.status === "concluida").length;
  return Math.round((done / todayTasks.length) * 100);
}

export interface DashboardKpis {
  pendingToday: number;
  overdue: number;
  assessmentsLast7Days: number;
  activeCriticalAlerts: number;
}

/** KPIs em tempo real do dashboard profissional (zona superior). */
export function calculateDashboardKpis(tasks: CarePlanTask[], assessments: IndicatorAssessment[], now: Date = new Date()): DashboardKpis {
  const activeTasks = tasks.filter((t) => !t.deletedAt && t.status !== "concluida");

  const pendingToday = activeTasks.filter((t) => isSameDay(new Date(t.horarioAgendado), now) && new Date(t.horarioAgendado).getTime() >= now.getTime()).length;
  const overdue = activeTasks.filter((t) => new Date(t.horarioAgendado).getTime() < now.getTime()).length;

  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  const assessmentsLast7Days = assessments.filter((a) => new Date(a.assessedAt).getTime() >= sevenDaysAgo).length;

  let activeCriticalAlerts = 0;
  const latestByType = new Map<string, IndicatorAssessment>();
  assessments.forEach((a) => latestByType.set(a.payload.type, a));
  latestByType.forEach((a) => {
    if (a.payload.type === "braden") {
      const label = classifyBradenScore(calculateBradenScore((a.payload as BradenAssessment).scores));
      if (label === "Risco alto" || label === "Risco muito alto") activeCriticalAlerts++;
    } else if (a.payload.type === "tec") {
      if (classifyTec((a.payload as TecAssessment).seconds).label === "Alterado") activeCriticalAlerts++;
    } else if (a.payload.type === "morse") {
      if (classifyMorseScore(calculateMorseScore((a.payload as MorseAssessment).scores)) === "Risco elevado") activeCriticalAlerts++;
    }
  });
  activeCriticalAlerts += overdue > 0 ? 1 : 0;

  return { pendingToday, overdue, assessmentsLast7Days, activeCriticalAlerts };
}

export interface TrendPoint {
  date: string;
  value: number;
  label: string;
}

/** Últimas N avaliações de Braden, ordenadas cronologicamente (para o gráfico de linha). */
export function getBradenTrend(assessments: IndicatorAssessment[], limit = 8): TrendPoint[] {
  return assessments
    .filter((a): a is IndicatorAssessment & { payload: BradenAssessment } => a.payload.type === "braden")
    .sort((a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime())
    .slice(-limit)
    .map((a) => {
      const score = calculateBradenScore(a.payload.scores);
      return { date: a.assessedAt, value: score, label: classifyBradenScore(score) };
    });
}

/** Últimas N medições de TEC, ordenadas cronologicamente (para o sparkline). */
export function getTecTrend(assessments: IndicatorAssessment[], limit = 10): TrendPoint[] {
  return assessments
    .filter((a): a is IndicatorAssessment & { payload: TecAssessment } => a.payload.type === "tec")
    .sort((a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime())
    .slice(-limit)
    .map((a) => ({ date: a.assessedAt, value: a.payload.seconds, label: classifyTec(a.payload.seconds).label }));
}

export interface LatestMorse {
  score: number;
  classification: string;
  assessedAt: string;
}

/** Avaliação de Morse mais recente (para o gauge/donut). */
export function getLatestMorse(assessments: IndicatorAssessment[]): LatestMorse | null {
  const morseAssessments = assessments.filter((a): a is IndicatorAssessment & { payload: MorseAssessment } => a.payload.type === "morse");
  if (morseAssessments.length === 0) return null;
  const latest = morseAssessments.sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime())[0];
  const score = calculateMorseScore(latest.payload.scores);
  return { score, classification: classifyMorseScore(score), assessedAt: latest.assessedAt };
}

export interface DayCarePlanStatus {
  dateKey: string;
  dayLabel: string;
  pendente: number;
  concluida: number;
  adiada: number;
}

/** Status do Care Plan por dia da última semana (para a barra empilhada). */
export function getCarePlanWeekStatus(tasks: CarePlanTask[], now: Date = new Date()): DayCarePlanStatus[] {
  const days: DayCarePlanStatus[] = [];
  const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const dateKey = day.toISOString().slice(0, 10);

    const dayTasks = tasks.filter((t) => !t.deletedAt && new Date(t.horarioAgendado).toISOString().slice(0, 10) === dateKey);
    days.push({
      dateKey,
      dayLabel: weekdayFormatter.format(day),
      pendente: dayTasks.filter((t) => t.status === "pendente").length,
      concluida: dayTasks.filter((t) => t.status === "concluida").length,
      adiada: dayTasks.filter((t) => t.status === "adiada").length,
    });
  }

  return days;
}
