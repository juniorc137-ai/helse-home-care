import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import { AddTaskForm } from "../../../src/components/care-plan/AddTaskForm";
import { KanbanBoard } from "../../../src/components/care-plan/KanbanBoard";
import { PatientSectionNav } from "../../../src/components/PatientSectionNav";
import { spacing } from "../../../src/constants/theme";
import { useThemedStyles } from "../../../src/theme/useThemedStyles";
import type { ThemeTokens } from "../../../src/theme/tokens";

export default function CarePlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = useThemedStyles(createStyles);
  const [showForm, setShowForm] = useState(false);

  return (
    <View style={styles.container}>
      <PatientSectionNav patientId={id} />
      <View style={styles.content}>
        <Button mode={showForm ? "outlined" : "contained"} onPress={() => setShowForm((v) => !v)} testID="toggle-add-task-form">
          {showForm ? "Cancelar" : "+ Nova tarefa"}
        </Button>
        {showForm && (
          <View style={styles.formWrapper}>
            <AddTaskForm patientId={id} onAdded={() => setShowForm(false)} />
          </View>
        )}
        <View style={styles.board}>
          <KanbanBoard patientId={id} />
        </View>
      </View>
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.surface },
    content: { flex: 1, padding: spacing.md, gap: spacing.md },
    formWrapper: { marginTop: spacing.xs },
    board: { flex: 1 },
  });
}
