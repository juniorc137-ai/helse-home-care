import { fireEvent, render, screen } from "@testing-library/react-native";
import { PatientCard } from "../../src/components/PatientCard";
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

describe("<PatientCard /> (renderização, seção 2.1)", () => {
  it("renderiza nome, diagnóstico e alertas", () => {
    render(
      <PatientCard
        patient={patient}
        alerts={[{ label: "TEC alterado (3.5s)", tone: "danger" }]}
        nextAppointment="14:00"
        onPress={() => {}}
      />,
    );
    expect(screen.getByText("Maria Silva")).toBeTruthy();
    expect(screen.getByText("Insuficiência Cardíaca Congestiva")).toBeTruthy();
    expect(screen.getByText(/Próximo agendamento: 14:00/)).toBeTruthy();
    expect(screen.getByText("TEC alterado (3.5s)")).toBeTruthy();
  });

  it("chama onPress ao tocar no card", () => {
    const onPress = jest.fn();
    render(<PatientCard patient={patient} alerts={[]} nextAppointment={null} onPress={onPress} />);
    fireEvent.press(screen.getByLabelText("Abrir perfil de Maria Silva"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
