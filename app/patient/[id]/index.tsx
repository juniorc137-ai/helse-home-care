import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PatientProfileView } from "../../../src/components/PatientProfileView";
import { PatientSectionNav } from "../../../src/components/PatientSectionNav";
import { colors } from "../../../src/constants/theme";
import { usePatientStore } from "../../../src/store/patientStore";

/** Perfil do Paciente (seção 2.2): read-only por padrão. */
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
        <PatientProfileView patient={patient} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 16 },
});
