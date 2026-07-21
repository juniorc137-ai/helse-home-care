import { fireEvent, render, screen, within } from "../testUtils";
import { MorseForm } from "../../src/components/MorseForm";
import { useIndicatorStore } from "../../src/store/indicatorStore";

const PATIENT_ID = "patient-01";

describe("<MorseForm /> (renderização, seção 2.4.3)", () => {
  beforeEach(() => {
    useIndicatorStore.setState({ assessmentsByPatient: {}, pendingCoordinatorAlerts: [] });
  });

  it("mantém o botão de registrar desabilitado até completar os 6 itens", () => {
    render(<MorseForm patientId={PATIENT_ID} />);
    expect(screen.getByTestId("morse-submit").props.accessibilityState.disabled).toBe(true);
  });

  it("calcula escore 50 / Risco elevado e registra ao submeter", () => {
    const onSubmitted = jest.fn();
    render(<MorseForm patientId={PATIENT_ID} onSubmitted={onSubmitted} />);

    const press = (itemKey: string, label: string) =>
      fireEvent.press(within(screen.getByTestId(`morse-item-${itemKey}`)).getByLabelText(label));

    // historicoQuedas(25) + diagnosticoSecundario(15) + auxilioDeambulacao(0) + terapiaEndovenosa(0) + marcha(10) + estadoMental(0) = 50
    press("historicoQuedas", "Sim, 25 pontos");
    press("diagnosticoSecundario", "Sim, 15 pontos");
    press("auxilioDeambulacao", "Nenhum / acamado / cuidador / cadeira de rodas, 0 pontos");
    press("terapiaEndovenosa", "Não, 0 pontos");
    press("marcha", "Fraca, 10 pontos");
    press("estadoMental", "Orientado quanto à própria capacidade, 0 pontos");

    expect(screen.getByText("Escore total: 50 — Risco elevado")).toBeTruthy();

    fireEvent.press(screen.getByTestId("morse-submit"));
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    expect(useIndicatorStore.getState().getLatest(PATIENT_ID, "morse")).toBeDefined();
  });
});
