import { fireEvent, render, screen } from "../testUtils";
import { TecForm } from "../../src/components/TecForm";
import { useIndicatorStore } from "../../src/store/indicatorStore";

const PATIENT_ID = "patient-01";

describe("<TecForm /> (renderização, seção 2.4.2)", () => {
  beforeEach(() => {
    useIndicatorStore.setState({ assessmentsByPatient: {}, pendingCoordinatorAlerts: [] });
  });

  it("inicia em 0,0s classificado como Normal", () => {
    render(<TecForm patientId={PATIENT_ID} />);
    expect(screen.getByText("0.0s")).toBeTruthy();
    expect(screen.getByText("Normal")).toBeTruthy();
  });

  it("incrementa em passos de 0,5s até classificar como Alterado e registra a avaliação", () => {
    const onSubmitted = jest.fn();
    render(<TecForm patientId={PATIENT_ID} onSubmitted={onSubmitted} />);

    const incrementButton = screen.getByText("+ 0,5s");
    // 0.0 -> 3.5s em 7 incrementos
    for (let i = 0; i < 7; i++) {
      fireEvent.press(incrementButton);
    }

    expect(screen.getByText("3.5s")).toBeTruthy();
    expect(screen.getByText("Alterado")).toBeTruthy();
    expect(screen.getByText(/será enviado ao coordenador/)).toBeTruthy();

    fireEvent.press(screen.getByTestId("tec-submit"));
    expect(onSubmitted).toHaveBeenCalledTimes(1);

    const stored = useIndicatorStore.getState().getLatest(PATIENT_ID, "tec");
    expect(stored).toBeDefined();
    expect(useIndicatorStore.getState().pendingCoordinatorAlerts.length).toBe(1);
  });

  it("não sinaliza alerta ao coordenador quando há fator contextual", () => {
    render(<TecForm patientId={PATIENT_ID} />);
    const incrementButton = screen.getByText("+ 0,5s");
    for (let i = 0; i < 7; i++) fireEvent.press(incrementButton);

    fireEvent.press(screen.getByRole("checkbox"));
    expect(screen.queryByText(/será enviado ao coordenador/)).toBeNull();
  });
});
