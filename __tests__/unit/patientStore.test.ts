import { act } from "@testing-library/react-native";
import { PermissionDeniedError } from "../../src/services/permissionGuard";
import { useAuditStore } from "../../src/store/auditStore";
import { usePatientStore } from "../../src/store/patientStore";
import type { Patient } from "../../src/types/entities";
import { MOCK_PATIENT_ID } from "../../src/data/mockPatients";

const ADMIN = "user-admin-01";
const NURSE = "user-nurse-01";

const NEW_PATIENT_INPUT = {
  name: "José da Silva",
  cpf: "11144477735",
  birthDate: "1950-05-10",
  sex: "masculino" as const,
  mainDiagnosis: "Hipertensão Arterial Sistêmica",
  comorbidities: ["Diabetes"],
  allergies: [],
  activeMedications: ["Losartana"],
  primaryEmergencyContact: { name: "Ana", relationship: "Filha", phone: "11999998888" },
  responsibleCaregiver: { name: "Ana", relationship: "Filha", availability: "Integral" },
  consentGiven: true,
};

describe("usePatientStore", () => {
  beforeEach(() => {
    usePatientStore.setState({ patients: [], hydrated: false });
    useAuditStore.setState({ events: [] });
  });

  it("hidrata com o paciente mock único (Valdir da Silva, ADR-009)", () => {
    act(() => {
      usePatientStore.getState().hydrateMock();
    });
    const patients = usePatientStore.getState().patients;
    expect(patients).toHaveLength(1);
    expect(patients[0].id).toBe(MOCK_PATIENT_ID);
    expect(patients[0].name).toBe("Valdir da Silva");
  });

  it("não duplica pacientes ao chamar hydrateMock mais de uma vez", () => {
    act(() => {
      usePatientStore.getState().hydrateMock();
      usePatientStore.getState().hydrateMock();
    });
    expect(usePatientStore.getState().patients).toHaveLength(1);
  });

  it("busca paciente por id", () => {
    act(() => {
      usePatientStore.getState().hydrateMock();
    });
    expect(usePatientStore.getState().getById(MOCK_PATIENT_ID)?.name).toBe("Valdir da Silva");
    expect(usePatientStore.getState().getById("inexistente")).toBeUndefined();
  });

  it("atualiza campos do paciente e o updatedAt", () => {
    act(() => {
      usePatientStore.getState().hydrateMock();
      usePatientStore.getState().updatePatient(MOCK_PATIENT_ID, { mainDiagnosis: "Novo diagnóstico" });
    });
    expect(usePatientStore.getState().getById(MOCK_PATIENT_ID)?.mainDiagnosis).toBe("Novo diagnóstico");
  });

  it("cria um novo paciente com todos os campos (contato, cuidador, consentimento — ADR-010)", () => {
    let created: Patient | undefined;
    act(() => {
      created = usePatientStore.getState().addPatient(ADMIN, NEW_PATIENT_INPUT);
    });

    expect(usePatientStore.getState().patients).toHaveLength(1);
    expect(created?.name).toBe("José da Silva");
    expect(created?.consent.consentGiven).toBe(true);
    expect(created?.primaryEmergencyContact.name).toBe("Ana");
    expect(created?.responsibleCaregiver.availability).toBe("Integral");
    expect(created?.deletedAt).toBeNull();

    const auditEvents = useAuditStore.getState().events;
    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0].action).toBe("patient.create");
    expect(auditEvents[0].entityType).toBe("patient");
  });

  describe("removePatient (ADR-010: soft delete auditado, restrito a ADMIN)", () => {
    it("remove com sucesso quando o papel é ADMIN, registrando auditoria", () => {
      let patientId = "";
      act(() => {
        patientId = usePatientStore.getState().addPatient(ADMIN, NEW_PATIENT_INPUT).id;
      });
      act(() => {
        usePatientStore.getState().removePatient(ADMIN, "ADMIN", patientId);
      });

      const patient = usePatientStore.getState().getById(patientId);
      expect(patient?.deletedAt).not.toBeNull();

      const events = useAuditStore.getState().events;
      expect(events.some((e) => e.action === "patient.remove" && e.entityId === patientId)).toBe(true);
    });

    it("nega remoção para papel não-ADMIN e registra access.denied", () => {
      let patientId = "";
      act(() => {
        patientId = usePatientStore.getState().addPatient(ADMIN, NEW_PATIENT_INPUT).id;
      });

      expect(() => usePatientStore.getState().removePatient(NURSE, "NURSE", patientId)).toThrow(PermissionDeniedError);

      const patient = usePatientStore.getState().getById(patientId);
      expect(patient?.deletedAt).toBeNull();

      const events = useAuditStore.getState().events;
      expect(events.some((e) => e.action === "access.denied")).toBe(true);
    });
  });
});
