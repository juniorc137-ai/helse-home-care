import { render, screen } from "@testing-library/react-native";
import { HealthCard } from "../../src/components/HealthCard";
import { useIndicatorStore } from "../../src/store/indicatorStore";
import { BRADEN_FIXTURE_HIGH_RISK, TEC_FIXTURE_ALTERED_SECONDS } from "../fixtures/clinicalFixtures";

const PATIENT = "patient-01";
const USER = "user-nurse-01";

describe("<HealthCard /> (redesign v2)", () => {
  beforeEach(() => {
    useIndicatorStore.setState({ assessmentsByPatient: {}, pendingCoordinatorAlerts: [] });
  });

  it("mostra mensagem vazia sem avaliações", () => {
    render(<HealthCard patientId={PATIENT} />);
    expect(screen.getByText("Nenhuma avaliação registrada ainda.")).toBeTruthy();
  });

  it("renderiza anéis para Braden e TEC quando há avaliações", () => {
    useIndicatorStore.getState().addAssessment(USER, PATIENT, { type: "braden", scores: BRADEN_FIXTURE_HIGH_RISK });
    useIndicatorStore.getState().addAssessment(USER, PATIENT, { type: "tec", seconds: TEC_FIXTURE_ALTERED_SECONDS, hasContextualFactor: false });

    render(<HealthCard patientId={PATIENT} />);
    expect(screen.getByTestId("health-card-braden")).toBeTruthy();
    expect(screen.getByTestId("health-card-tec")).toBeTruthy();
    expect(screen.getByText("Risco alto")).toBeTruthy();
    expect(screen.getByText("Alterado")).toBeTruthy();
  });
});
