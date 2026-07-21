import { render, screen } from "@testing-library/react-native";
import { TeamAchievementsCard } from "../../src/components/TeamAchievementsCard";
import { useCarePlanStore } from "../../src/store/carePlanStore";
import { useIndicatorStore } from "../../src/store/indicatorStore";

const PATIENT = "patient-01";
const USER = "user-nurse-01";

describe("<TeamAchievementsCard /> (equipe, não paciente — ADR-006)", () => {
  beforeEach(() => {
    useCarePlanStore.setState({ tasksByPatient: {} });
    useIndicatorStore.setState({ assessmentsByPatient: {}, pendingCoordinatorAlerts: [] });
  });

  it("mostra 0 pontos sem nenhuma atividade", () => {
    render(<TeamAchievementsCard />);
    expect(screen.getAllByText("0")).toHaveLength(2); // pontos e sequência de dias
  });

  it("soma pontos de tarefas concluídas em todos os pacientes", () => {
    useCarePlanStore.getState().addTask(USER, PATIENT, {
      descricao: "Tarefa",
      tipo: "medicacao",
      horarioAgendado: "2026-07-21T14:00:00.000Z",
      profissionalResponsavel: USER,
    });
    const task = useCarePlanStore.getState().tasksByPatient[PATIENT][0];
    useCarePlanStore.getState().completeTask(USER, PATIENT, task.id);

    render(<TeamAchievementsCard />);
    expect(screen.getByText("10")).toBeTruthy(); // +10 por tarefa concluída
  });
});
