import { generateMockCarePlanTasks, generateMockPatients } from "../../src/utils/mockData";

describe("Dados mock (Fase 1: 20 pacientes)", () => {
  it("gera exatamente 20 pacientes", () => {
    expect(generateMockPatients()).toHaveLength(20);
  });

  it("gera pacientes com ids únicos e consentimento LGPD registrado", () => {
    const patients = generateMockPatients();
    const ids = new Set(patients.map((p) => p.id));
    expect(ids.size).toBe(20);
    patients.forEach((p) => {
      expect(p.consent.consentGiven).toBe(true);
      expect(p.consent.consentTimestamp).toBeTruthy();
    });
  });

  it("é determinístico para uma mesma data de referência", () => {
    const ref = new Date("2026-07-21T12:00:00Z");
    const a = generateMockPatients(ref);
    const b = generateMockPatients(ref);
    expect(a).toEqual(b);
  });

  it("gera tarefas de Care Plan para um paciente", () => {
    const tasks = generateMockCarePlanTasks("patient-01");
    expect(tasks.length).toBeGreaterThan(0);
    tasks.forEach((t) => expect(t.patientId).toBe("patient-01"));
  });
});
