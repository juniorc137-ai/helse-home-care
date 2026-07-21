import { fireEvent, render, screen, within } from "@testing-library/react-native";
import { CarePlanSection } from "../../src/components/CarePlanSection";
import { useCarePlanStore } from "../../src/store/carePlanStore";

const PATIENT_ID = "patient-01";

describe("<CarePlanSection /> (renderização, seção 2.3)", () => {
  beforeEach(() => {
    useCarePlanStore.setState({ tasksByPatient: {} });
  });

  it("mostra mensagem quando não há tarefas", () => {
    render(<CarePlanSection patientId={PATIENT_ID} />);
    expect(screen.getByText("Nenhuma tarefa agendada.")).toBeTruthy();
  });

  it("renderiza tarefa e conclui via checkbox", () => {
    useCarePlanStore.getState().addTask("user-nurse-01", PATIENT_ID, {
      descricao: "Administrar medicação",
      tipo: "medicacao",
      horarioAgendado: "2099-01-01T14:00:00.000Z",
      profissionalResponsavel: "user-nurse-01",
    });
    render(<CarePlanSection patientId={PATIENT_ID} />);
    expect(screen.getByText("Administrar medicação")).toBeTruthy();

    const task = useCarePlanStore.getState().tasksByPatient[PATIENT_ID][0];
    const row = screen.getByTestId(`care-plan-task-${task.id}`);
    fireEvent.press(within(row).getByRole("checkbox"));

    expect(useCarePlanStore.getState().tasksByPatient[PATIENT_ID][0].status).toBe("concluida");
  });
});
