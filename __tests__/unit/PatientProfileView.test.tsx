import { fireEvent, render, screen } from "../testUtils";
import { PatientProfileView } from "../../src/components/PatientProfileView";
import type { Patient } from "../../src/types/entities";

const patient: Patient = {
  id: "patient-01",
  name: "Maria Silva",
  cpf: "12345678900",
  birthDate: "1950-01-01",
  sex: "feminino",
  mainDiagnosis: "Insuficiência Cardíaca Congestiva",
  comorbidities: ["Hipertensão Arterial Sistêmica"],
  allergies: ["Dipirona"],
  activeMedications: ["Losartana 50mg 1x/dia"],
  primaryEmergencyContact: { name: "Ana", relationship: "Filha", phone: "11999999999" },
  responsibleCaregiver: { name: "Cuidadora", relationship: "Contratada", availability: "Diurno" },
  consent: { consentGiven: true, consentTimestamp: "2026-01-01T00:00:00.000Z", consentVersion: "1.0.0" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
};

describe("<PatientProfileView /> (renderização, seção 2.2 — layout mobile em acordeão)", () => {
  it("mostra a Identidade expandida por padrão", () => {
    render(<PatientProfileView patient={patient} />);
    expect(screen.getByText("Maria Silva")).toBeTruthy();
  });

  it("expande Clínico e revela diagnóstico, comorbidades e alergias", () => {
    render(<PatientProfileView patient={patient} />);
    fireEvent.press(screen.getByText("Clínico"));
    expect(screen.getByText("Insuficiência Cardíaca Congestiva")).toBeTruthy();
    expect(screen.getByText("Hipertensão Arterial Sistêmica")).toBeTruthy();
    expect(screen.getByText("Dipirona")).toBeTruthy();
  });

  it("expande Contato e mostra consentimento concedido", () => {
    render(<PatientProfileView patient={patient} />);
    fireEvent.press(screen.getByText("Contato e cuidador"));
    expect(screen.getByText("Concedido")).toBeTruthy();
  });

  it("expande Contato e indica consentimento não concedido quando aplicável", () => {
    render(<PatientProfileView patient={{ ...patient, consent: { ...patient.consent, consentGiven: false } }} />);
    fireEvent.press(screen.getByText("Contato e cuidador"));
    expect(screen.getByText("Não concedido")).toBeTruthy();
  });
});
