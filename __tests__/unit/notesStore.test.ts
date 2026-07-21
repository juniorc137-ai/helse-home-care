import { act } from "@testing-library/react-native";
import { useNotesStore, validateVitalSigns } from "../../src/store/notesStore";

const USER = "user-nurse-01";
const PATIENT = "patient-01";

describe("Validação de sinais vitais (faixas fisiológicas plausíveis)", () => {
  it("aceita valores dentro da faixa", () => {
    expect(validateVitalSigns({ heartRate: 80, spo2: 97, temperature: 36.5 })).toHaveLength(0);
  });

  it("rejeita valores fora da faixa fisiológica plausível", () => {
    const errors = validateVitalSigns({ heartRate: 400, spo2: 10 });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("useNotesStore — imutabilidade de nota finalizada", () => {
  beforeEach(() => {
    useNotesStore.setState({ notesByPatient: {} });
  });

  it("cria rascunho e finaliza a nota", () => {
    let note;
    act(() => {
      note = useNotesStore.getState().createDraft(USER, PATIENT, { conteudoTexto: "S: paciente refere dor..." });
    });
    act(() => {
      useNotesStore.getState().finalizeNote(USER, PATIENT, note!.id);
    });
    const stored = useNotesStore.getState().notesByPatient[PATIENT][0];
    expect(stored.status).toBe("finalizada");
  });

  it("rejeita criação de rascunho com sinais vitais fora da faixa", () => {
    expect(() =>
      useNotesStore.getState().createDraft(USER, PATIENT, {
        conteudoTexto: "Nota",
        sinaisVitais: { heartRate: 999 },
      }),
    ).toThrow();
  });

  it("permite adendo apenas referenciando nota finalizada, nunca editando-a", () => {
    let note;
    act(() => {
      note = useNotesStore.getState().createDraft(USER, PATIENT, { conteudoTexto: "Nota original" });
      useNotesStore.getState().finalizeNote(USER, PATIENT, note.id);
    });

    let addendum;
    act(() => {
      addendum = useNotesStore.getState().createAddendum(USER, PATIENT, note!.id, "Correção: PA medida incorretamente");
    });

    const notes = useNotesStore.getState().notesByPatient[PATIENT];
    const original = notes.find((n) => n.id === note!.id)!;
    expect(original.conteudoTexto).toBe("Nota original"); // nunca alterada
    expect(addendum!.addendumToNoteId).toBe(note!.id);
  });

  it("rejeita adendo referenciando nota ainda em rascunho", () => {
    let note;
    act(() => {
      note = useNotesStore.getState().createDraft(USER, PATIENT, { conteudoTexto: "Rascunho" });
    });
    expect(() => useNotesStore.getState().createAddendum(USER, PATIENT, note!.id, "Adendo inválido")).toThrow();
  });
});
