import { render, screen } from "../testUtils";
import { KanbanBoard } from "../../src/components/care-plan/KanbanBoard";
import { useCarePlanStore } from "../../src/store/carePlanStore";

const USER = "user-nurse-01";
const PATIENT = "patient-01";
const TODAY = "2026-07-21T14:00:00.000Z";

/**
 * A lógica de decisão dos gestos (limiar de swipe, matemática do
 * reordenamento) é testada isoladamente em kanbanGestures.test.ts —
 * simular o gesto nativo via react-native-gesture-handler/jest-utils
 * mostrou-se instável nesta versão da lib. Aqui validamos apenas que o
 * board renderiza corretamente a partir do estado da store.
 */
describe("<KanbanBoard /> (redesign v2)", () => {
  beforeEach(() => {
    useCarePlanStore.setState({ tasksByPatient: {} });
  });

  it("mostra estado vazio quando o paciente não tem tarefas", () => {
    render(<KanbanBoard patientId={PATIENT} />);
    expect(screen.getByText("Nenhuma tarefa agendada para este paciente.")).toBeTruthy();
  });

  it("distribui tarefas nas colunas Pendente/Hoje/Completo", () => {
    useCarePlanStore.getState().addTask(USER, PATIENT, {
      descricao: "Tarefa de hoje",
      tipo: "medicacao",
      horarioAgendado: TODAY,
      profissionalResponsavel: USER,
    });
    useCarePlanStore.getState().addTask(USER, PATIENT, {
      descricao: "Tarefa futura",
      tipo: "monitoramento",
      horarioAgendado: "2099-01-01T08:00:00.000Z",
      profissionalResponsavel: USER,
    });

    render(<KanbanBoard patientId={PATIENT} />);

    expect(screen.getByTestId("kanban-column-Hoje")).toBeTruthy();
    expect(screen.getByTestId("kanban-column-Pendente")).toBeTruthy();
    expect(screen.getByTestId("kanban-column-Completo")).toBeTruthy();
    expect(screen.getByText("Tarefa de hoje")).toBeTruthy();
    expect(screen.getByText("Tarefa futura")).toBeTruthy();
  });

  it("mostra tarefa concluída na coluna Completo", () => {
    const task = useCarePlanStore.getState().addTask(USER, PATIENT, {
      descricao: "Já feita",
      tipo: "curativo",
      horarioAgendado: TODAY,
      profissionalResponsavel: USER,
    });
    useCarePlanStore.getState().completeTask(USER, PATIENT, task.id);

    render(<KanbanBoard patientId={PATIENT} />);
    expect(screen.getByTestId(`kanban-card-${task.id}`)).toBeTruthy();
    expect(screen.getByText("Concluída")).toBeTruthy();
  });
});
