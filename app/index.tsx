import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { FAB } from "react-native-paper";
import { FeaturedPatientCard } from "../src/components/FeaturedPatientCard";
import { PatientCard } from "../src/components/PatientCard";
import { QuickStats, type QuickStat } from "../src/components/QuickStats";
import { TeamAchievementsCard } from "../src/components/TeamAchievementsCard";
import { colors, spacing } from "../src/constants/theme";
import { useResponsive } from "../src/hooks/useResponsive";
import { useCarePlanStore } from "../src/store/carePlanStore";
import { useIndicatorStore } from "../src/store/indicatorStore";
import { usePatientStore } from "../src/store/patientStore";
import type { CarePlanTask, Patient } from "../src/types/entities";
import { bucketTasksForKanban } from "../src/utils/kanbanBuckets";
import { getPatientAlerts } from "../src/utils/patientAlerts";
import { calculateAssessmentsUpToDatePct, calculateTaskCompletionPct } from "../src/utils/patientProgress";
import { calculateUrgencyScore, pickMostUrgentPatient } from "../src/utils/patientUrgency";

/** Dashboard Inicial (seção 2.1, redesign v2): card do dia, quick stats, conquistas da equipe, grid de pacientes. */
export default function DashboardScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const allPatients = usePatientStore((s) => s.patients);
  const patients = allPatients.filter((p) => !p.deletedAt);
  const tasksByPatient = useCarePlanStore((s) => s.tasksByPatient);
  const assessmentsByPatient = useIndicatorStore((s) => s.assessmentsByPatient);

  const tasksOf = (patientId: string): CarePlanTask[] => tasksByPatient[patientId] ?? [];
  const assessmentsOf = (patientId: string) => assessmentsByPatient[patientId] ?? [];

  const urgencyById: Record<string, number> = {};
  let tasksToday = 0;
  let patientsWithPendingAssessments = 0;

  patients.forEach((patient) => {
    const tasks = tasksOf(patient.id);
    const alerts = getPatientAlerts(assessmentsOf(patient.id), tasks);
    urgencyById[patient.id] = calculateUrgencyScore(alerts, tasks);
    tasksToday += bucketTasksForKanban(tasks).hoje.length;
    if (calculateAssessmentsUpToDatePct(assessmentsOf(patient.id)) < 100) patientsWithPendingAssessments++;
  });

  const featuredPatient = pickMostUrgentPatient(patients, urgencyById);
  const secondaryPatients = patients.filter((p) => p.id !== featuredPatient?.id);

  const quickStats: QuickStat[] = [
    { key: "patients", label: "Pacientes", value: patients.length, icon: "account-group-outline" },
    { key: "tasksToday", label: "Tarefas hoje", value: tasksToday, icon: "calendar-check-outline" },
    { key: "pendingAssessments", label: "Avaliações pendentes", value: patientsWithPendingAssessments, icon: "clipboard-alert-outline" },
  ];

  const renderPatientCard = (item: Patient) => {
    const tasks = tasksOf(item.id);
    const alerts = getPatientAlerts(assessmentsOf(item.id), tasks);
    const nextTask = tasks
      .filter((t) => t.status === "pendente" && !t.deletedAt)
      .sort((a, b) => new Date(a.horarioAgendado).getTime() - new Date(b.horarioAgendado).getTime())[0];

    return (
      <PatientCard
        patient={item}
        alerts={alerts}
        nextAppointment={nextTask ? new Date(nextTask.horarioAgendado).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : null}
        taskCompletionPct={calculateTaskCompletionPct(tasks)}
        onPress={() => router.push(`/patient/${item.id}`)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={secondaryPatients}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => renderPatientCard(item)}
        numColumns={isDesktop ? 2 : 1}
        key={isDesktop ? "desktop" : "mobile"}
        columnWrapperStyle={isDesktop ? styles.row : undefined}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {featuredPatient && (
              <FeaturedPatientCard
                patient={featuredPatient}
                alerts={getPatientAlerts(assessmentsOf(featuredPatient.id), tasksOf(featuredPatient.id))}
                onPress={() => router.push(`/patient/${featuredPatient.id}`)}
              />
            )}
            <QuickStats stats={quickStats} />
            <TeamAchievementsCard />
            <Text style={styles.sectionTitle}>Demais pacientes</Text>
          </View>
        }
      />
      <FAB icon="plus" label="Novo Paciente" style={styles.fab} onPress={() => router.push("/patient/new")} testID="new-patient-fab" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  headerSection: { padding: spacing.md, gap: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginTop: spacing.xs },
  list: { paddingBottom: 96, paddingHorizontal: spacing.md },
  row: { gap: spacing.sm },
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
  },
});
