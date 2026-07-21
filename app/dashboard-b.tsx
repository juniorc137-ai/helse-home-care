import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BradenTrendChart } from "../src/components/charts/BradenTrendChart";
import { CarePlanWeekBarChart } from "../src/components/charts/CarePlanWeekBarChart";
import { MorseGaugeCard } from "../src/components/charts/MorseGaugeCard";
import { RecentNotesTimeline } from "../src/components/charts/RecentNotesTimeline";
import { TecSparkline } from "../src/components/charts/TecSparkline";
import { DashboardVariantSelector } from "../src/components/DashboardVariantSelector";
import { ProfessionalKpiRow } from "../src/components/ProfessionalKpiRow";
import { ProgressBar } from "../src/components/ProgressBar";
import { ThemeToggleButton } from "../src/components/ThemeToggleButton";
import { WebGrid } from "../src/components/WebGrid";
import { radii, shadows, spacing } from "../src/constants/theme";
import { FAB } from "react-native-paper";
import { useProfessionalDashboardData } from "../src/hooks/useProfessionalDashboardData";
import { useTheme } from "../src/theme/ThemeContext";
import type { ThemeTokens } from "../src/theme/tokens";
import { useThemedStyles } from "../src/theme/useThemedStyles";

/** Cor de destaque única e saturada da Variante B "Minimalista + micro-gamificação". */
const ACCENT_B = "#7C3AED";

/** Dashboard como prontuário eletrônico profissional — Variante B: cards de borda-radius grande, um único elemento gamificado sutil. */
export default function DashboardVariantB() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { patient, kpis, bradenTrend, tecTrend, latestMorse, carePlanWeek, recentNotes, todayProgressPct, noOverdueStreakDays } =
    useProfessionalDashboardData();

  return (
    <View style={styles.container}>
      <View style={styles.header} testID="dashboard-b-header">
        <View>
          <Text style={styles.patientName}>{patient?.name ?? "—"}</Text>
          <Text style={styles.patientMeta}>{patient?.mainDiagnosis}</Text>
        </View>
        <View style={styles.headerActions}>
          <Text style={styles.headerAction} onPress={() => patient && router.push(`/patient/${patient.id}`)} testID="dashboard-b-patient-link">
            Ver perfil
          </Text>
          <ThemeToggleButton />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <DashboardVariantSelector active="b" />

        <View style={styles.gamificationCard} testID="today-care-plan-progress-card">
          <Text style={styles.gamificationTitle}>Care plan do dia</Text>
          <ProgressBar label="Concluído" percent={todayProgressPct} testID="today-progress-bar" />
          {noOverdueStreakDays > 0 && (
            <View style={styles.streakBadge} testID="no-overdue-streak-badge">
              <Text style={styles.streakText}>{noOverdueStreakDays} dias consecutivos sem atraso</Text>
            </View>
          )}
        </View>

        <ProfessionalKpiRow kpis={kpis} accentColor={ACCENT_B} />

        <WebGrid minItemWidth={280} gap={spacing.md}>
          <BradenTrendChart points={bradenTrend} />
          <TecSparkline points={tecTrend} />
          <MorseGaugeCard latest={latestMorse} />
          <CarePlanWeekBarChart days={carePlanWeek} />
        </WebGrid>

        <RecentNotesTimeline notes={recentNotes} />
      </ScrollView>
      <FAB icon="plus" label="Novo Paciente" style={[styles.fab, { backgroundColor: ACCENT_B }]} onPress={() => router.push("/patient/new")} testID="dashboard-b-new-patient-fab" />
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.bg },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
    },
    patientName: { fontSize: 20, fontWeight: "700", color: tokens.ink, letterSpacing: 0.2 },
    patientMeta: { fontSize: 13, color: tokens.inkSecondary },
    headerAction: { fontSize: 13, fontWeight: "700", color: ACCENT_B },
    headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    content: { padding: spacing.md, gap: spacing.lg, paddingBottom: 96 },
    gamificationCard: {
      backgroundColor: tokens.surfaceRaised,
      borderRadius: radii.lg + 8,
      padding: spacing.lg,
      gap: spacing.sm,
      ...shadows.md,
    },
    gamificationTitle: { fontSize: 16, fontWeight: "700", color: tokens.ink },
    streakBadge: {
      alignSelf: "flex-start",
      backgroundColor: `${ACCENT_B}22`,
      borderRadius: radii.full,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    streakText: { fontSize: 12, fontWeight: "700", color: ACCENT_B },
    fab: { position: "absolute", right: spacing.md, bottom: spacing.lg },
  });
}
