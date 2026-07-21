import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NotesList } from "../../../src/components/NotesList";
import { PatientSectionNav } from "../../../src/components/PatientSectionNav";
import { SoapNoteForm } from "../../../src/components/SoapNoteForm";
import { useToast } from "../../../src/components/Toast";
import { spacing } from "../../../src/constants/theme";
import type { ThemeTokens } from "../../../src/theme/tokens";
import { useThemedStyles } from "../../../src/theme/useThemedStyles";

export default function NotesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = useThemedStyles(createStyles);
  const [toast, toastElement] = useToast();

  return (
    <View style={styles.container}>
      <PatientSectionNav patientId={id} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nova nota de evolução</Text>
        <SoapNoteForm patientId={id} onSaved={() => toast.show("Rascunho salvo.")} />
        <Text style={styles.title}>Histórico</Text>
        <NotesList patientId={id} />
      </ScrollView>
      {toastElement}
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.surface },
    content: { padding: spacing.md, gap: spacing.md },
    title: { fontSize: 18, fontWeight: "700", color: tokens.ink },
  });
}
