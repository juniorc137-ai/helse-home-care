import { render, screen } from "../testUtils";
import { Timeline } from "../../src/components/Timeline";
import { useNotesStore } from "../../src/store/notesStore";

const PATIENT = "patient-01";
const USER = "user-nurse-01";

describe("<Timeline /> (redesign v2)", () => {
  beforeEach(() => {
    useNotesStore.setState({ notesByPatient: {} });
  });

  it("mostra mensagem vazia sem nenhuma atividade", () => {
    render(<Timeline patientId={PATIENT} />);
    expect(screen.getByText("Nenhuma atividade registrada ainda.")).toBeTruthy();
  });

  it("mostra entrada para nota finalizada", () => {
    const note = useNotesStore.getState().createDraft(USER, PATIENT, { conteudoTexto: "Nota" });
    useNotesStore.getState().finalizeNote(USER, PATIENT, note.id);

    render(<Timeline patientId={PATIENT} />);
    expect(screen.getByText("Nota de evolução finalizada")).toBeTruthy();
  });
});
