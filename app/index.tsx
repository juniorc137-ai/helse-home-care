import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { PatientCard } from "../src/components/PatientCard";
import { colors } from "../src/constants/theme";
import { useResponsive } from "../src/hooks/useResponsive";
import { useCarePlanStore } from "../src/store/carePlanStore";
import { useIndicatorStore } from "../src/store/indicatorStore";
import { usePatientStore } from "../src/store/patientStore";
import type { Patient } from "../src/types/entities";
import { getPatientAlerts } from "../src/utils/patientAlerts";

/** Dashboard Inicial (seção 2.1): grid desktop / lista mobile, até 3 alertas por card. */
export default function DashboardScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const patients = usePatientStore((s) => s.patients.filter((p) => !p.deletedAt));
  const tasksByPatient = useCarePlanStore((s) => s.tasksByPatient);
  const assessmentsByPatient = useIndicatorStore((s) => s.assessmentsByPatient);

  const renderItem = ({ item }: { item: Patient }) => {
    const tasks = tasksByPatient[item.id] ?? [];
    const alerts = getPatientAlerts(assessmentsByPatient[item.id] ?? [], tasks);
    const nextTask = tasks
      .filter((t) => t.status === "pendente")
      .sort((a, b) => new Date(a.horarioAgendado).getTime() - new Date(b.horarioAgendado).getTime())[0];

    return (
      <PatientCard
        patient={item}
        alerts={alerts}
        nextAppointment={nextTask ? new Date(nextTask.horarioAgendado).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : null}
        onPress={() => router.push(`/patient/${item.id}`)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pacientes em atendimento</Text>
      <FlatList
        data={patients}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        numColumns={isDesktop ? 2 : 1}
        key={isDesktop ? "desktop" : "mobile"}
        columnWrapperStyle={isDesktop ? styles.row : undefined}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, padding: 16 },
  title: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, marginBottom: 12 },
  list: { paddingBottom: 24 },
  row: { gap: 12 },
});
