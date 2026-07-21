import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { KanbanBoard } from "../../../src/components/care-plan/KanbanBoard";
import { PatientSectionNav } from "../../../src/components/PatientSectionNav";
import { colors } from "../../../src/constants/theme";

export default function CarePlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <PatientSectionNav patientId={id} />
      <View style={styles.content}>
        <KanbanBoard patientId={id} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: 16 },
});
