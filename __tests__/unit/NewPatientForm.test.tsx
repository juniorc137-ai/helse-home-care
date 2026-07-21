import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { NewPatientForm } from "../../src/components/NewPatientForm";
import { usePatientStore } from "../../src/store/patientStore";

describe("<NewPatientForm /> (seção 2.1: botão + Novo)", () => {
  beforeEach(() => {
    usePatientStore.setState({ patients: [], hydrated: false });
  });

  it("valida campos obrigatórios e não cria paciente com CPF inválido", async () => {
    const onCreated = jest.fn();
    render(<NewPatientForm onCreated={onCreated} />);

    fireEvent.changeText(screen.getByTestId("new-patient-cpf"), "123");
    fireEvent.press(screen.getByTestId("new-patient-submit"));

    await waitFor(() => expect(screen.getByText("CPF inválido")).toBeTruthy());
    expect(onCreated).not.toHaveBeenCalled();
    expect(usePatientStore.getState().patients).toHaveLength(0);
  });

  it("rejeita nome e diagnóstico vazios", async () => {
    render(<NewPatientForm />);
    fireEvent.press(screen.getByTestId("new-patient-submit"));

    await waitFor(() => {
      expect(screen.getByText("Nome é obrigatório")).toBeTruthy();
      expect(screen.getByText("Diagnóstico principal é obrigatório")).toBeTruthy();
    });
  });

  it("cria paciente com dados válidos e converte listas separadas por vírgula", async () => {
    const onCreated = jest.fn();
    render(<NewPatientForm onCreated={onCreated} />);

    fireEvent.changeText(screen.getByTestId("new-patient-name"), "José da Silva");
    fireEvent.changeText(screen.getByTestId("new-patient-cpf"), "11144477735");
    fireEvent.changeText(screen.getByTestId("new-patient-birthdate"), "1950-05-10");
    fireEvent.changeText(screen.getByTestId("new-patient-diagnosis"), "Hipertensão Arterial Sistêmica");
    fireEvent.changeText(screen.getByTestId("new-patient-comorbidities"), "Diabetes, Obesidade");
    fireEvent.changeText(screen.getByTestId("new-patient-allergies"), "Dipirona");
    fireEvent.changeText(screen.getByTestId("new-patient-medications"), "Losartana, AAS");
    fireEvent.press(screen.getByTestId("new-patient-sex-masculino"));

    fireEvent.press(screen.getByTestId("new-patient-submit"));

    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));

    const patients = usePatientStore.getState().patients;
    expect(patients).toHaveLength(1);
    expect(patients[0]).toMatchObject({
      name: "José da Silva",
      cpf: "111.444.777-35",
      sex: "masculino",
      mainDiagnosis: "Hipertensão Arterial Sistêmica",
      comorbidities: ["Diabetes", "Obesidade"],
      allergies: ["Dipirona"],
      activeMedications: ["Losartana", "AAS"],
    });
  });
});
