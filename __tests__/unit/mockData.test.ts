import { generateMockCarePlanTasks } from "../../src/utils/mockData";

describe("Dados mock de Care Plan", () => {
  it("gera tarefas de Care Plan para um paciente", () => {
    const tasks = generateMockCarePlanTasks("patient-01");
    expect(tasks.length).toBeGreaterThan(0);
    tasks.forEach((t) => expect(t.patientId).toBe("patient-01"));
  });

  it("inclui uma tarefa pendente hoje às 14h (próxima visita)", () => {
    const tasks = generateMockCarePlanTasks("patient-01");
    const task14h = tasks.find((t) => new Date(t.horarioAgendado).getHours() === 14);
    expect(task14h).toBeDefined();
    expect(task14h?.status).toBe("pendente");
  });

  it("é determinístico para uma mesma data de referência", () => {
    const ref = new Date("2026-07-21T12:00:00Z");
    const a = generateMockCarePlanTasks("patient-01", ref);
    const b = generateMockCarePlanTasks("patient-01", ref);
    expect(a).toEqual(b);
  });
});
