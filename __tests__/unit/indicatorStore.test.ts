import { act } from "@testing-library/react-native";
import { useIndicatorStore } from "../../src/store/indicatorStore";
import { BRADEN_FIXTURE_HIGH_RISK, MORSE_FIXTURE_HIGH_RISK } from "../fixtures/clinicalFixtures";

const USER = "user-nurse-01";
const PATIENT = "patient-01";

describe("useIndicatorStore", () => {
  beforeEach(() => {
    useIndicatorStore.setState({ assessmentsByPatient: {}, pendingCoordinatorAlerts: [] });
  });

  it("registra avaliação de Braden e recupera a mais recente", () => {
    act(() => {
      useIndicatorStore.getState().addAssessment(USER, PATIENT, { type: "braden", scores: BRADEN_FIXTURE_HIGH_RISK });
    });
    const latest = useIndicatorStore.getState().getLatest(PATIENT, "braden");
    expect(latest?.payload.type).toBe("braden");
  });

  it("registra avaliação de Morse e mantém histórico", () => {
    act(() => {
      useIndicatorStore.getState().addAssessment(USER, PATIENT, { type: "morse", scores: MORSE_FIXTURE_HIGH_RISK });
      useIndicatorStore.getState().addAssessment(USER, PATIENT, { type: "morse", scores: MORSE_FIXTURE_HIGH_RISK });
    });
    expect(useIndicatorStore.getState().getHistory(PATIENT, "morse")).toHaveLength(2);
  });

  it("gera alerta pendente ao coordenador para TEC alterado sem fator contextual", () => {
    act(() => {
      useIndicatorStore.getState().addAssessment(USER, PATIENT, { type: "tec", seconds: 3.5, hasContextualFactor: false });
    });
    expect(useIndicatorStore.getState().pendingCoordinatorAlerts).toHaveLength(1);
  });

  it("não gera alerta quando há fator contextual registrado", () => {
    act(() => {
      useIndicatorStore.getState().addAssessment(USER, PATIENT, {
        type: "tec",
        seconds: 3.5,
        hasContextualFactor: true,
        contextualFactorNote: "Hipotermia registrada",
      });
    });
    expect(useIndicatorStore.getState().pendingCoordinatorAlerts).toHaveLength(0);
  });

  it("registra avaliação de risco de aspiração com justificativa obrigatória", () => {
    act(() => {
      useIndicatorStore.getState().addAssessment(USER, PATIENT, {
        type: "aspiracao",
        level: "moderado",
        justification: "Tosse ao deglutir líquidos finos",
      });
    });
    expect(useIndicatorStore.getState().getLatest(PATIENT, "aspiracao")?.payload).toMatchObject({ level: "moderado" });
  });

  it("registra checklist de risco de dispositivos médicos", () => {
    act(() => {
      useIndicatorStore.getState().addAssessment(USER, PATIENT, {
        type: "dispositivos",
        checklist: {
          sonda: "adequado",
          cateter: "inadequado",
          talaImobilizador: "adequado",
          ortese: "adequado",
          tuboDreno: "adequado",
        },
      });
    });
    const latest = useIndicatorStore.getState().getLatest(PATIENT, "dispositivos");
    expect(latest?.payload.type).toBe("dispositivos");
  });
});
