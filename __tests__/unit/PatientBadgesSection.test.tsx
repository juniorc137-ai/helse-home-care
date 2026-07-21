import { render, screen } from "@testing-library/react-native";
import { PatientBadgesSection } from "../../src/components/PatientBadgesSection";
import { useCarePlanStore } from "../../src/store/carePlanStore";
import { useIndicatorStore } from "../../src/store/indicatorStore";

const PATIENT = "patient-01";
const USER = "user-nurse-01";

describe("<PatientBadgesSection /> (completude, não ranking — ADR-006)", () => {
  beforeEach(() => {
    useCarePlanStore.setState({ tasksByPatient: {} });
    useIndicatorStore.setState({ assessmentsByPatient: {}, pendingCoordinatorAlerts: [] });
  });

  it("não mostra badges quando nada está completo", () => {
    render(<PatientBadgesSection patientId={PATIENT} />);
    expect(screen.queryByTestId("patient-badge-tasks-100")).toBeNull();
  });

  it("mostra badge de plano de cuidados em dia quando todas as tarefas estão concluídas", () => {
    useCarePlanStore.getState().addTask(USER, PATIENT, {
      descricao: "Tarefa",
      tipo: "medicacao",
      horarioAgendado: "2026-07-21T14:00:00.000Z",
      profissionalResponsavel: USER,
    });
    const task = useCarePlanStore.getState().tasksByPatient[PATIENT][0];
    useCarePlanStore.getState().completeTask(USER, PATIENT, task.id);

    render(<PatientBadgesSection patientId={PATIENT} />);
    expect(screen.getByTestId("patient-badge-tasks-100")).toBeTruthy();
  });
});
