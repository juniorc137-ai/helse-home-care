import { act } from "@testing-library/react-native";
import { usePatientStore } from "../../src/store/patientStore";

describe("usePatientStore", () => {
  beforeEach(() => {
    usePatientStore.setState({ patients: [], hydrated: false });
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
});
