import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { MOCK_CURRENT_USER_ID } from "../constants/mockSession";
import { radii, shadows, spacing } from "../constants/theme";
import { useNotesStore } from "../store/notesStore";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";
import type { ClinicalNote } from "../types/entities";
import { StatusBadge } from "./StatusBadge";

interface NotesListProps {
  patientId: string;
}

function AddendumForm({ patientId, originalNoteId }: { patientId: string; originalNoteId: string }) {
  const styles = useThemedStyles(createStyles);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const createAddendum = useNotesStore((s) => s.createAddendum);

  if (!open) {
    return (
      <Button compact onPress={() => setOpen(true)} testID={`note-addendum-open-${originalNoteId}`}>
        Adicionar adendo
      </Button>
    );
  }

  return (
    <View style={styles.addendumForm}>
      <TextInput mode="outlined" label="Texto do adendo" value={text} onChangeText={setText} multiline testID={`note-addendum-input-${originalNoteId}`} />
      <Button
        mode="contained"
        disabled={!text.trim()}
        onPress={() => {
          createAddendum(MOCK_CURRENT_USER_ID, patientId, originalNoteId, text.trim());
          setText("");
          setOpen(false);
        }}
        testID={`note-addendum-save-${originalNoteId}`}
      >
        Salvar adendo
      </Button>
    </View>
  );
}

function NoteCard({ note, patientId }: { note: ClinicalNote; patientId: string }) {
  const styles = useThemedStyles(createStyles);
  const finalizeNote = useNotesStore((s) => s.finalizeNote);

  return (
    <View style={styles.card} testID={`note-card-${note.id}`}>
      <View style={styles.headerRow}>
        <StatusBadge label={note.status === "finalizada" ? "Finalizada" : "Rascunho"} tone={note.status === "finalizada" ? "ok" : "neutral"} />
        <Text style={styles.date}>{new Date(note.dataHora).toLocaleString("pt-BR")}</Text>
      </View>
      {note.addendumToNoteId && <Text style={styles.addendumTag}>Adendo à nota anterior</Text>}
      <Text style={styles.content}>{note.conteudoTexto}</Text>

      {note.status === "rascunho" && (
        <Button mode="outlined" onPress={() => finalizeNote(MOCK_CURRENT_USER_ID, patientId, note.id)} testID={`note-finalize-${note.id}`}>
          Finalizar
        </Button>
      )}
      {note.status === "finalizada" && <AddendumForm patientId={patientId} originalNoteId={note.id} />}
    </View>
  );
}

const EMPTY_NOTES: ClinicalNote[] = [];

/** Lista cronológica reversa das notas do paciente (seção 2.5). */
export function NotesList({ patientId }: NotesListProps) {
  const styles = useThemedStyles(createStyles);
  const notes = useNotesStore((s) => s.notesByPatient[patientId] ?? EMPTY_NOTES);
  const sorted = [...notes].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

  if (sorted.length === 0) {
    return <Text style={styles.empty}>Nenhuma nota registrada ainda.</Text>;
  }

  return (
    <View style={styles.list} testID="notes-list">
      {sorted.map((note) => (
        <NoteCard key={note.id} note={note} patientId={patientId} />
      ))}
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    list: { gap: spacing.sm },
    empty: { fontSize: 14, color: tokens.inkSecondary },
    card: {
      backgroundColor: tokens.surfaceRaised,
      borderRadius: radii.md,
      padding: spacing.sm,
      gap: 8,
      ...shadows.sm,
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    date: { fontSize: 12, color: tokens.inkSecondary },
    addendumTag: { fontSize: 12, fontStyle: "italic", color: tokens.primary },
    content: { fontSize: 14, color: tokens.ink },
    addendumForm: { gap: 8, marginTop: 4 },
  });
}
