import { fireEvent, render, screen } from "../testUtils";
import { NotesList } from "../../src/components/NotesList";
import { useNotesStore } from "../../src/store/notesStore";

const PATIENT = "patient-01";
const USER = "user-nurse-01";

describe("<NotesList /> (cronológica reversa, seção 2.5)", () => {
  beforeEach(() => {
    useNotesStore.setState({ notesByPatient: {} });
  });

  it("mostra mensagem vazia sem notas", () => {
    render(<NotesList patientId={PATIENT} />);
    expect(screen.getByText("Nenhuma nota registrada ainda.")).toBeTruthy();
  });

  it("finaliza um rascunho, tornando-o imutável", () => {
    const note = useNotesStore.getState().createDraft(USER, PATIENT, { conteudoTexto: "S: teste" });
    render(<NotesList patientId={PATIENT} />);

    expect(screen.getByTestId(`note-finalize-${note.id}`)).toBeTruthy();
    fireEvent.press(screen.getByTestId(`note-finalize-${note.id}`));

    expect(useNotesStore.getState().notesByPatient[PATIENT][0].status).toBe("finalizada");
  });

  it("permite adendo apenas em nota finalizada, criando uma nova nota referenciando a original", () => {
    const note = useNotesStore.getState().createDraft(USER, PATIENT, { conteudoTexto: "Nota original" });
    useNotesStore.getState().finalizeNote(USER, PATIENT, note.id);

    render(<NotesList patientId={PATIENT} />);
    fireEvent.press(screen.getByTestId(`note-addendum-open-${note.id}`));
    fireEvent.changeText(screen.getByTestId(`note-addendum-input-${note.id}`), "Correção de PA");
    fireEvent.press(screen.getByTestId(`note-addendum-save-${note.id}`));

    const notes = useNotesStore.getState().notesByPatient[PATIENT];
    expect(notes).toHaveLength(2);
    const addendum = notes.find((n) => n.addendumToNoteId === note.id);
    expect(addendum?.conteudoTexto).toBe("Correção de PA");
    expect(notes.find((n) => n.id === note.id)?.conteudoTexto).toBe("Nota original"); // original nunca muda
  });
});
