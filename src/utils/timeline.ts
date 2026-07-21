import type { CarePlanTask, ClinicalNote, IndicatorAssessment } from "../types/entities";

export type TimelineCategory = "nota" | "avaliacao" | "tarefa";
export type TimelineTone = "ok" | "warning" | "danger" | "neutral";

export interface TimelineEntry {
  id: string;
  timestamp: string;
  category: TimelineCategory;
  title: string;
  tone: TimelineTone;
}

const ASSESSMENT_LABEL: Record<IndicatorAssessment["payload"]["type"], string> = {
  braden: "Avaliação de Braden",
  tec: "Avaliação de TEC",
  morse: "Avaliação de Morse",
  aspiracao: "Avaliação de risco de aspiração",
  dispositivos: "Avaliação de dispositivos médicos",
  custom: "Avaliação de indicador personalizado",
};

/** Timeline de últimas ações do perfil do paciente (redesign v2): notas, avaliações e tarefas concluídas, mais recentes primeiro. */
export function buildPatientTimeline(notes: ClinicalNote[], assessments: IndicatorAssessment[], tasks: CarePlanTask[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  notes.forEach((note) => {
    entries.push({
      id: note.id,
      timestamp: note.dataHora,
      category: "nota",
      title: note.status === "finalizada" ? "Nota de evolução finalizada" : "Rascunho de nota de evolução",
      tone: note.status === "finalizada" ? "ok" : "neutral",
    });
  });

  assessments.forEach((assessment) => {
    entries.push({
      id: assessment.id,
      timestamp: assessment.assessedAt,
      category: "avaliacao",
      title: ASSESSMENT_LABEL[assessment.payload.type],
      tone: "neutral",
    });
  });

  tasks
    .filter((task) => task.status === "concluida" && task.timestampConclusao && !task.deletedAt)
    .forEach((task) => {
      entries.push({
        id: task.id,
        timestamp: task.timestampConclusao as string,
        category: "tarefa",
        title: `Tarefa concluída: ${task.descricao}`,
        tone: "ok",
      });
    });

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
