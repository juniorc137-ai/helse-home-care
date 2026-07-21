import { fireEvent, render, screen, within } from "@testing-library/react-native";
import { BradenForm } from "../../src/components/BradenForm";
import { useIndicatorStore } from "../../src/store/indicatorStore";

const PATIENT_ID = "patient-01";

describe("<BradenForm /> (renderização, seção 2.4.1)", () => {
  beforeEach(() => {
    useIndicatorStore.setState({ assessmentsByPatient: {}, pendingCoordinatorAlerts: [] });
  });

  it("renderiza as 6 subescalas", () => {
    render(<BradenForm patientId={PATIENT_ID} />);
    expect(screen.getByTestId("braden-subscale-percepcaoSensorial")).toBeTruthy();
    expect(screen.getByTestId("braden-subscale-umidade")).toBeTruthy();
    expect(screen.getByTestId("braden-subscale-atividade")).toBeTruthy();
    expect(screen.getByTestId("braden-subscale-mobilidade")).toBeTruthy();
    expect(screen.getByTestId("braden-subscale-nutricao")).toBeTruthy();
    expect(screen.getByTestId("braden-subscale-friccaoCisalhamento")).toBeTruthy();
  });

  it("mantém o botão de registrar desabilitado até completar as 6 subescalas", () => {
    render(<BradenForm patientId={PATIENT_ID} />);
    expect(screen.getByTestId("braden-submit").props.accessibilityState.disabled).toBe(true);
  });

  it("calcula escore 10 / Risco alto com a fixture obrigatória e registra ao submeter", () => {
    const onSubmitted = jest.fn();
    render(<BradenForm patientId={PATIENT_ID} onSubmitted={onSubmitted} />);

    const press = (subscaleKey: string, label: string) =>
      fireEvent.press(within(screen.getByTestId(`braden-subscale-${subscaleKey}`)).getByLabelText(label));

    press("percepcaoSensorial", "Levemente limitada, 3 pontos");
    press("umidade", "Muito úmida, 2 pontos");
    press("atividade", "Acamado, 1 pontos");
    press("mobilidade", "Totalmente imóvel, 1 pontos");
    press("nutricao", "Provavelmente inadequada, 2 pontos");
    press("friccaoCisalhamento", "Problema, 1 pontos");

    expect(screen.getByText("Escore total: 10 — Risco alto")).toBeTruthy();

    fireEvent.press(screen.getByTestId("braden-submit"));
    expect(onSubmitted).toHaveBeenCalledTimes(1);

    const stored = useIndicatorStore.getState().getLatest(PATIENT_ID, "braden");
    expect(stored).toBeDefined();
  });
});
