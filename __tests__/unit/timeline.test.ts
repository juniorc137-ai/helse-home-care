import { buildPatientTimeline } from "../../src/utils/timeline";
import type { CarePlanTask, ClinicalNote, IndicatorAssessment } from "../../src/types/entities";

const note: ClinicalNote = {
  id: "n1",
  patientId: "p1",
  dataHora: "2026-07-20T10:00:00.000Z",
  profissionalId: "u1",
  conteudoTexto: "Nota",
  sinaisVitais: null,
  fotoAnexada: null,
  status: "finalizada",
  addendumToNoteId: null,
  createdAt: "2026-07-20T10:00:00.000Z",
  updatedAt: "2026-07-20T10:00:00.000Z",
};

const assessment: IndicatorAssessment = {
  id: "a1",
  patientId: "p1",
  assessedBy: "u1",
  assessedAt: "2026-07-21T09:00:00.000Z",
  payload: { type: "tec", seconds: 2, hasContextualFactor: false },
  createdAt: "2026-07-21T09:00:00.000Z",
};

const completedTask: CarePlanTask = {
  id: "t1",
  patientId: "p1",
  descricao: "Curativo",
  tipo: "curativo",
  horarioAgendado: "2026-07-19T08:00:00.000Z",
  profissionalResponsavel: "u1",
  status: "concluida",
  timestampConclusao: "2026-07-19T08:30:00.000Z",
  notasDoProfissional: null,
  priorityOrder: 0,
  createdAt: "2026-07-19T08:00:00.000Z",
  updatedAt: "2026-07-19T08:30:00.000Z",
  deletedAt: null,
};

describe("buildPatientTimeline", () => {
  it("combina notas, avaliações e tarefas concluídas, ordenadas da mais recente para a mais antiga", () => {
    const timeline = buildPatientTimeline([note], [assessment], [completedTask]);
    expect(timeline.map((e) => e.id)).toEqual(["a1", "n1", "t1"]);
  });

  it("ignora tarefas não concluídas ou removidas", () => {
    const pending: CarePlanTask = { ...completedTask, id: "t2", status: "pendente", timestampConclusao: null };
    const removed: CarePlanTask = { ...completedTask, id: "t3", deletedAt: "2026-01-01T00:00:00.000Z" };
    const timeline = buildPatientTimeline([], [], [pending, removed]);
    expect(timeline).toHaveLength(0);
  });

  it("marca nota em rascunho com tom neutro e nota finalizada com tom ok", () => {
    const draft: ClinicalNote = { ...note, id: "n2", status: "rascunho" };
    const timeline = buildPatientTimeline([note, draft], [], []);
    expect(timeline.find((e) => e.id === "n1")?.tone).toBe("ok");
    expect(timeline.find((e) => e.id === "n2")?.tone).toBe("neutral");
  });
});
