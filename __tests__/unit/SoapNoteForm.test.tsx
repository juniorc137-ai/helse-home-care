import { fireEvent, render, screen } from "@testing-library/react-native";
import { SoapNoteForm } from "../../src/components/SoapNoteForm";
import { useNotesStore } from "../../src/store/notesStore";

const PATIENT = "patient-01";

describe("<SoapNoteForm /> (seção 2.5)", () => {
  beforeEach(() => {
    useNotesStore.setState({ notesByPatient: {} });
  });

  it("mantém o botão de salvar desabilitado com todos os campos vazios", () => {
    render(<SoapNoteForm patientId={PATIENT} />);
    expect(screen.getByTestId("soap-save-draft").props.accessibilityState.disabled).toBe(true);
  });

  it("salva rascunho com estrutura SOAP e limpa o formulário", () => {
    const onSaved = jest.fn();
    render(<SoapNoteForm patientId={PATIENT} onSaved={onSaved} />);

    fireEvent.changeText(screen.getByTestId("soap-subjetivo"), "Dor lombar leve");
    fireEvent.changeText(screen.getByTestId("soap-objetivo"), "PA 130x80");
    fireEvent.changeText(screen.getByTestId("soap-avaliacao"), "Estável");
    fireEvent.changeText(screen.getByTestId("soap-plano"), "Reavaliar em 24h");
    fireEvent.press(screen.getByTestId("soap-save-draft"));

    expect(onSaved).toHaveBeenCalledTimes(1);
    const notes = useNotesStore.getState().notesByPatient[PATIENT];
    expect(notes).toHaveLength(1);
    expect(notes[0].conteudoTexto).toBe("S: Dor lombar leve\nO: PA 130x80\nA: Estável\nP: Reavaliar em 24h");
    expect(notes[0].status).toBe("rascunho");
  });
});
