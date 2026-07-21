import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { MOCK_CURRENT_USER_ID } from "../constants/mockSession";
import { useNotesStore } from "../store/notesStore";
import { formatSoapNote, isSoapNoteEmpty, type SoapFields } from "../utils/soapNote";

interface SoapNoteFormProps {
  patientId: string;
  onSaved?: () => void;
}

const EMPTY_FIELDS: SoapFields = { subjetivo: "", objetivo: "", avaliacao: "", plano: "" };

/** Formulário SOAP (seção 2.5): Subjetivo/Objetivo/Avaliação/Plano, salva como rascunho. */
export function SoapNoteForm({ patientId, onSaved }: SoapNoteFormProps) {
  const [fields, setFields] = useState<SoapFields>(EMPTY_FIELDS);
  const createDraft = useNotesStore((s) => s.createDraft);

  function updateField(key: keyof SoapFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (isSoapNoteEmpty(fields)) return;
    createDraft(MOCK_CURRENT_USER_ID, patientId, { conteudoTexto: formatSoapNote(fields) });
    setFields(EMPTY_FIELDS);
    onSaved?.();
  }

  return (
    <View style={styles.container} testID="soap-note-form">
      <TextInput
        mode="outlined"
        label="S — Subjetivo"
        value={fields.subjetivo}
        onChangeText={(v) => updateField("subjetivo", v)}
        multiline
        testID="soap-subjetivo"
      />
      <TextInput
        mode="outlined"
        label="O — Objetivo"
        value={fields.objetivo}
        onChangeText={(v) => updateField("objetivo", v)}
        multiline
        testID="soap-objetivo"
      />
      <TextInput
        mode="outlined"
        label="A — Avaliação"
        value={fields.avaliacao}
        onChangeText={(v) => updateField("avaliacao", v)}
        multiline
        testID="soap-avaliacao"
      />
      <TextInput mode="outlined" label="P — Plano" value={fields.plano} onChangeText={(v) => updateField("plano", v)} multiline testID="soap-plano" />
      <Button mode="contained" onPress={handleSave} disabled={isSoapNoteEmpty(fields)} testID="soap-save-draft">
        Salvar rascunho
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
});
