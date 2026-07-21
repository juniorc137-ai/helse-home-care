import * as ExpoCrypto from "expo-crypto";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { recordAuditEvent } from "../services/auditLog";
import type { CarePlanTask, CarePlanTaskType } from "../types/entities";

/** Bloqueio de edição de tarefas concluídas após este intervalo (seção 2.3). */
export const TASK_EDIT_LOCK_HOURS_AFTER_COMPLETION = 4;

interface CarePlanState {
  tasksByPatient: Record<string, CarePlanTask[]>;
  seedTasks: (patientId: string, tasks: CarePlanTask[]) => void;
  addTask: (
    userId: string,
    patientId: string,
    input: { descricao: string; tipo: CarePlanTaskType; horarioAgendado: string; profissionalResponsavel: string },
  ) => CarePlanTask;
  completeTask: (userId: string, patientId: string, taskId: string) => void;
  editTask: (userId: string, patientId: string, taskId: string, changes: Partial<CarePlanTask>) => void;
  removeTask: (userId: string, patientId: string, taskId: string) => void;
}

/** Sem sobreposição de agendamentos para o mesmo paciente (seção 2.3). */
export function hasScheduleOverlap(tasks: CarePlanTask[], horarioAgendado: string, excludeTaskId?: string): boolean {
  const target = new Date(horarioAgendado).getTime();
  return tasks.some(
    (t) =>
      (excludeTaskId === undefined || t.id !== excludeTaskId) &&
      t.status !== "concluida" &&
      new Date(t.horarioAgendado).getTime() === target,
  );
}

export function isTaskEditLocked(task: CarePlanTask, now: Date = new Date()): boolean {
  if (task.status !== "concluida" || !task.timestampConclusao) return false;
  const hoursSinceCompletion = (now.getTime() - new Date(task.timestampConclusao).getTime()) / 3_600_000;
  return hoursSinceCompletion > TASK_EDIT_LOCK_HOURS_AFTER_COMPLETION;
}

export const useCarePlanStore = create<CarePlanState>()(
  immer((set, get) => ({
    tasksByPatient: {},
    seedTasks: (patientId, tasks) =>
      set((state) => {
        state.tasksByPatient[patientId] = tasks;
      }),
    addTask: (userId, patientId, input) => {
      const existing = get().tasksByPatient[patientId] ?? [];
      if (hasScheduleOverlap(existing, input.horarioAgendado)) {
        throw new Error("Já existe uma tarefa agendada para este horário.");
      }
      const now = new Date().toISOString();
      const task: CarePlanTask = {
        id: ExpoCrypto.randomUUID(),
        patientId,
        descricao: input.descricao,
        tipo: input.tipo,
        horarioAgendado: input.horarioAgendado,
        profissionalResponsavel: input.profissionalResponsavel,
        status: "pendente",
        timestampConclusao: null,
        notasDoProfissional: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      set((state) => {
        if (!state.tasksByPatient[patientId]) state.tasksByPatient[patientId] = [];
        state.tasksByPatient[patientId].push(task);
      });
      recordAuditEvent({ userId, action: "task.create", entityType: "carePlanTask", entityId: task.id, after: task });
      return task;
    },
    completeTask: (userId, patientId, taskId) => {
      const now = new Date().toISOString();
      let before: CarePlanTask | undefined;
      let after: CarePlanTask | undefined;
      set((state) => {
        const task = state.tasksByPatient[patientId]?.find((t) => t.id === taskId);
        if (!task) return;
        before = { ...task };
        task.status = "concluida";
        task.timestampConclusao = now;
        task.updatedAt = now;
        after = { ...task };
      });
      if (after) {
        recordAuditEvent({ userId, action: "task.complete", entityType: "carePlanTask", entityId: taskId, before, after });
      }
    },
    editTask: (userId, patientId, taskId, changes) => {
      const task = get().tasksByPatient[patientId]?.find((t) => t.id === taskId);
      if (!task) return;
      if (task.status === "concluida" && isTaskEditLocked(task)) {
        throw new Error("Edição bloqueada: tarefa concluída há mais de 4 horas.");
      }
      if (task.status === "concluida") {
        throw new Error("Edição permitida apenas para tarefas pendentes ou adiadas.");
      }
      const before = { ...task };
      set((state) => {
        const t = state.tasksByPatient[patientId]?.find((x) => x.id === taskId);
        if (!t) return;
        Object.assign(t, changes, { updatedAt: new Date().toISOString() });
      });
      const after = get().tasksByPatient[patientId]?.find((t) => t.id === taskId);
      recordAuditEvent({ userId, action: "task.update", entityType: "carePlanTask", entityId: taskId, before, after });
    },
    removeTask: (userId, patientId, taskId) => {
      const task = get().tasksByPatient[patientId]?.find((t) => t.id === taskId);
      if (!task) return;
      const before = { ...task };
      set((state) => {
        const t = state.tasksByPatient[patientId]?.find((x) => x.id === taskId);
        if (!t) return;
        t.deletedAt = new Date().toISOString();
      });
      recordAuditEvent({ userId, action: "task.remove", entityType: "carePlanTask", entityId: taskId, before, after: null });
    },
  })),
);
