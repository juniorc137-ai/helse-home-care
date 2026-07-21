import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { HealthCard } from "../../../src/components/HealthCard";
import { PatientBadgesSection } from "../../../src/components/PatientBadgesSection";
import { PatientProfileView } from "../../../src/components/PatientProfileView";
import { PatientSectionNav } from "../../../src/components/PatientSectionNav";
import { Timeline } from "../../../src/components/Timeline";
import { colors, spacing } from "../../../src/constants/theme";
import { usePatientStore } from "../../../src/store/patientStore";

/** Perfil do Paciente (seção 2.2, redesign v2): health card + timeline + badges + dados read-only. */
export default function PatientProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const patient = usePatientStore((s) => s.getById(id));

  if (!patient) {
    return (
      <View style={styles.container}>
        <Text>Paciente não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PatientSectionNav patientId={id} />
      <ScrollView contentContainerStyle={styles.content}>
        <HealthCard patientId={id} />
        <PatientBadgesSection patientId={id} />
        <Timeline patientId={id} />
        <PatientProfileView patient={patient} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md, gap: spacing.md },
});
