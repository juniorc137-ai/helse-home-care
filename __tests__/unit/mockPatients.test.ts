import { isValidCPF } from "../../src/utils/cpf";
import { mockPatients, MOCK_PATIENT_ID } from "../../src/data/mockPatients";

describe("mockPatients (paciente único, ADR-009)", () => {
  it("contém exatamente um paciente: Valdir da Silva", () => {
    expect(mockPatients).toHaveLength(1);
    expect(mockPatients[0].name).toBe("Valdir da Silva");
    expect(mockPatients[0].id).toBe(MOCK_PATIENT_ID);
  });

  it("tem CPF válido pelo algoritmo de dígito verificador", () => {
    expect(isValidCPF(mockPatients[0].cpf)).toBe(true);
  });

  it("tem diagnóstico, comorbidades, alergias e medicações conforme especificado", () => {
    const patient = mockPatients[0];
    expect(patient.mainDiagnosis).toContain("Insuficiência cardíaca");
    expect(patient.comorbidities).toEqual(["Hipertensão", "Diabetes tipo 2"]);
    expect(patient.allergies).toEqual(["Dipirona"]);
    expect(patient.activeMedications).toHaveLength(3);
  });

  it("tem contato de emergência, cuidador e consentimento preenchidos", () => {
    const patient = mockPatients[0];
    expect(patient.primaryEmergencyContact.name).toBeTruthy();
    expect(patient.responsibleCaregiver.name).toBeTruthy();
    expect(patient.consent.consentGiven).toBe(true);
  });
});
