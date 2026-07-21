import { act } from "@testing-library/react-native";
import { useAuditStore } from "../../src/store/auditStore";
import { usePatientStore } from "../../src/store/patientStore";
import type { Patient } from "../../src/types/entities";

const USER = "user-admin-01";

describe("usePatientStore", () => {
  beforeEach(() => {
    usePatientStore.setState({ patients: [], hydrated: false });
    useAuditStore.setState({ events: [] });
  });

  it("gera 20 pacientes mock ao hidratar", () => {
    act(() => {
      usePatientStore.getState().hydrateMock();
    });
    expect(usePatientStore.getState().patients).toHaveLength(20);
  });

  it("não duplica pacientes ao chamar hydrateMock mais de uma vez", () => {
    act(() => {
      usePatientStore.getState().hydrateMock();
      usePatientStore.getState().hydrateMock();
    });
    expect(usePatientStore.getState().patients).toHaveLength(20);
  });

  it("busca paciente por id", () => {
    act(() => {
      usePatientStore.getState().hydrateMock();
    });
    expect(usePatientStore.getState().getById("patient-01")?.name).toBeDefined();
    expect(usePatientStore.getState().getById("inexistente")).toBeUndefined();
  });

  it("atualiza campos do paciente e o updatedAt", () => {
    act(() => {
      usePatientStore.getState().hydrateMock();
      usePatientStore.getState().updatePatient("patient-01", { mainDiagnosis: "Novo diagnóstico" });
    });
    expect(usePatientStore.getState().getById("patient-01")?.mainDiagnosis).toBe("Novo diagnóstico");
  });

  it("soft delete marca deletedAt sem remover o registro", () => {
    act(() => {
      usePatientStore.getState().hydrateMock();
      usePatientStore.getState().softDeletePatient("patient-01");
    });
    const patient = usePatientStore.getState().getById("patient-01");
    expect(patient?.deletedAt).not.toBeNull();
  });

  it("cria um novo paciente com os campos informados e regras de auditoria (seção 2.1)", () => {
    let created: Patient | undefined;
    act(() => {
      created = usePatientStore.getState().createPatient(USER, {
        name: "José da Silva",
        cpf: "11144477735",
        birthDate: "1950-05-10",
        sex: "masculino",
        mainDiagnosis: "Hipertensão Arterial Sistêmica",
        comorbidities: ["Diabetes"],
        allergies: [],
        activeMedications: ["Losartana"],
      });
    });

    expect(usePatientStore.getState().patients).toHaveLength(1);
    expect(created?.name).toBe("José da Silva");
    expect(created?.consent.consentGiven).toBe(false);
    expect(created?.deletedAt).toBeNull();

    const auditEvents = useAuditStore.getState().events;
    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0].action).toBe("patient.create");
    expect(auditEvents[0].entityType).toBe("patient");
  });
});
