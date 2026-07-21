import { act } from "@testing-library/react-native";
import { hasScheduleOverlap, isTaskEditLocked, useCarePlanStore } from "../../src/store/carePlanStore";
import type { CarePlanTask } from "../../src/types/entities";

const USER = "user-nurse-01";
const PATIENT = "patient-01";

function makeTask(overrides: Partial<CarePlanTask> = {}): CarePlanTask {
  return {
    id: "task-1",
    patientId: PATIENT,
    descricao: "Administrar medicação",
    tipo: "medicacao",
    horarioAgendado: "2026-07-21T14:00:00.000Z",
    profissionalResponsavel: USER,
    status: "pendente",
    timestampConclusao: null,
    notasDoProfissional: null,
    priorityOrder: 0,
    createdAt: "2026-07-21T08:00:00.000Z",
    updatedAt: "2026-07-21T08:00:00.000Z",
    deletedAt: null,
    ...overrides,
  };
}

describe("Care Plan — validação de horário sem sobreposição", () => {
  it("detecta sobreposição para o mesmo horário", () => {
    const tasks = [makeTask()];
    expect(hasScheduleOverlap(tasks, "2026-07-21T14:00:00.000Z")).toBe(true);
    expect(hasScheduleOverlap(tasks, "2026-07-21T15:00:00.000Z")).toBe(false);
  });

  it("ignora tarefas já concluídas na checagem de sobreposição", () => {
    const tasks = [makeTask({ status: "concluida" })];
    expect(hasScheduleOverlap(tasks, "2026-07-21T14:00:00.000Z")).toBe(false);
  });
});

describe("Care Plan — bloqueio de edição 4h após conclusão", () => {
  it("não bloqueia tarefa pendente", () => {
    expect(isTaskEditLocked(makeTask({ status: "pendente" }))).toBe(false);
  });

  it("permite edição até 4h após conclusão", () => {
    const completedAt = "2026-07-21T10:00:00.000Z";
    const now = new Date("2026-07-21T13:59:00.000Z");
    expect(isTaskEditLocked(makeTask({ status: "concluida", timestampConclusao: completedAt }), now)).toBe(false);
  });

  it("bloqueia edição após 4h da conclusão", () => {
    const completedAt = "2026-07-21T10:00:00.000Z";
    const now = new Date("2026-07-21T14:01:00.000Z");
    expect(isTaskEditLocked(makeTask({ status: "concluida", timestampConclusao: completedAt }), now)).toBe(true);
  });
});

describe("useCarePlanStore", () => {
  beforeEach(() => {
    useCarePlanStore.setState({ tasksByPatient: {} });
  });

  it("adiciona tarefa e rejeita conflito de horário", () => {
    act(() => {
      useCarePlanStore.getState().addTask(USER, PATIENT, {
        descricao: "Curativo",
        tipo: "curativo",
        horarioAgendado: "2026-07-21T14:00:00.000Z",
        profissionalResponsavel: USER,
      });
    });
    expect(() =>
      useCarePlanStore.getState().addTask(USER, PATIENT, {
        descricao: "Outra tarefa",
        tipo: "monitoramento",
        horarioAgendado: "2026-07-21T14:00:00.000Z",
        profissionalResponsavel: USER,
      }),
    ).toThrow();
  });

  it("conclui tarefa com timestamp automático", () => {
    let task;
    act(() => {
      task = useCarePlanStore.getState().addTask(USER, PATIENT, {
        descricao: "Curativo",
        tipo: "curativo",
        horarioAgendado: "2026-07-21T14:00:00.000Z",
        profissionalResponsavel: USER,
      });
    });
    act(() => {
      useCarePlanStore.getState().completeTask(USER, PATIENT, task!.id);
    });
    const stored = useCarePlanStore.getState().tasksByPatient[PATIENT][0];
    expect(stored.status).toBe("concluida");
    expect(stored.timestampConclusao).not.toBeNull();
  });

  it("bloqueia edição de tarefa já concluída", () => {
    let task;
    act(() => {
      task = useCarePlanStore.getState().addTask(USER, PATIENT, {
        descricao: "Curativo",
        tipo: "curativo",
        horarioAgendado: "2026-07-21T14:00:00.000Z",
        profissionalResponsavel: USER,
      });
    });
    act(() => {
      useCarePlanStore.getState().completeTask(USER, PATIENT, task!.id);
    });
    expect(() =>
      useCarePlanStore.getState().editTask(USER, PATIENT, task!.id, { descricao: "Editada" }),
    ).toThrow();
  });

  it("reorderTasks reordena prioridade sem alterar status (Kanban, redesign v2)", () => {
    let taskA: CarePlanTask | undefined;
    let taskB: CarePlanTask | undefined;
    act(() => {
      taskA = useCarePlanStore.getState().addTask(USER, PATIENT, {
        descricao: "A",
        tipo: "curativo",
        horarioAgendado: "2026-07-21T14:00:00.000Z",
        profissionalResponsavel: USER,
      });
      taskB = useCarePlanStore.getState().addTask(USER, PATIENT, {
        descricao: "B",
        tipo: "monitoramento",
        horarioAgendado: "2026-07-21T15:00:00.000Z",
        profissionalResponsavel: USER,
      });
    });

    act(() => {
      useCarePlanStore.getState().reorderTasks(PATIENT, [taskB!.id, taskA!.id]);
    });

    const tasks = useCarePlanStore.getState().tasksByPatient[PATIENT];
    expect(tasks.find((t) => t.id === taskB!.id)?.priorityOrder).toBe(0);
    expect(tasks.find((t) => t.id === taskA!.id)?.priorityOrder).toBe(1);
    expect(tasks.find((t) => t.id === taskA!.id)?.status).toBe("pendente");
  });
});
