import type { ComponentProps } from "react";
import { RemovePatientDialog } from "../../src/components/RemovePatientDialog";
import { fireEvent, render, screen } from "../testUtils";

function renderDialog(props: ComponentProps<typeof RemovePatientDialog>) {
  return render(<RemovePatientDialog {...props} />);
}

describe("<RemovePatientDialog /> (confirmação dupla)", () => {
  it("mantém o botão de confirmar desabilitado até digitar REMOVER exatamente", () => {
    renderDialog({ visible: true, patientName: "Valdir da Silva", onDismiss: () => {}, onConfirm: () => {} });
    expect(screen.getByTestId("remove-patient-confirm").props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(screen.getByTestId("remove-patient-confirmation-input"), "remover");
    expect(screen.getByTestId("remove-patient-confirm").props.accessibilityState.disabled).toBe(false);
  });

  it("não confirma com texto incorreto", () => {
    const onConfirm = jest.fn();
    renderDialog({ visible: true, patientName: "Valdir da Silva", onDismiss: () => {}, onConfirm });

    fireEvent.changeText(screen.getByTestId("remove-patient-confirmation-input"), "remove");
    fireEvent.press(screen.getByTestId("remove-patient-confirm"));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("confirma quando o texto exato é digitado", () => {
    const onConfirm = jest.fn();
    renderDialog({ visible: true, patientName: "Valdir da Silva", onDismiss: () => {}, onConfirm });

    fireEvent.changeText(screen.getByTestId("remove-patient-confirmation-input"), "REMOVER");
    fireEvent.press(screen.getByTestId("remove-patient-confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("chama onDismiss ao cancelar", () => {
    const onDismiss = jest.fn();
    renderDialog({ visible: true, patientName: "Valdir da Silva", onDismiss, onConfirm: () => {} });
    fireEvent.press(screen.getByTestId("remove-patient-cancel"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
