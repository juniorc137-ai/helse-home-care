import { fireEvent, render, screen } from "@testing-library/react-native";
import { FeaturedPatientCard } from "../../src/components/FeaturedPatientCard";
import type { Patient } from "../../src/types/entities";

const patient: Patient = {
  id: "patient-01",
  name: "Maria Silva",
  cpf: "12345678900",
  birthDate: "1950-01-01",
  sex: "feminino",
  mainDiagnosis: "Insuficiência Cardíaca Congestiva",
  comorbidities: [],
  allergies: [],
  activeMedications: [],
  primaryEmergencyContact: { name: "Filha", relationship: "Filha", phone: "11999999999" },
  responsibleCaregiver: { name: "Cuidadora", relationship: "Contratada", availability: "Diurno" },
  consent: { consentGiven: true, consentTimestamp: "2026-01-01T00:00:00.000Z", consentVersion: "1.0.0" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  deletedAt: null,
};

describe("<FeaturedPatientCard /> (card principal do dia, redesign v2)", () => {
  it("renderiza nome, diagnóstico e alertas do paciente mais urgente", () => {
    render(<FeaturedPatientCard patient={patient} alerts={[{ label: "TEC alterado", tone: "danger" }]} onPress={() => {}} />);
    expect(screen.getByText("Paciente do dia")).toBeTruthy();
    expect(screen.getByText("Maria Silva")).toBeTruthy();
    expect(screen.getByText("TEC alterado")).toBeTruthy();
  });

  it("chama onPress ao tocar", () => {
    const onPress = jest.fn();
    render(<FeaturedPatientCard patient={patient} alerts={[]} onPress={onPress} />);
    fireEvent.press(screen.getByTestId("featured-patient-card"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
