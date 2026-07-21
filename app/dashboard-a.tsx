import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BradenTrendChart } from "../src/components/charts/BradenTrendChart";
import { CarePlanWeekBarChart } from "../src/components/charts/CarePlanWeekBarChart";
import { MorseGaugeCard } from "../src/components/charts/MorseGaugeCard";
import { RecentNotesTimeline } from "../src/components/charts/RecentNotesTimeline";
import { TecSparkline } from "../src/components/charts/TecSparkline";
import { DashboardVariantSelector } from "../src/components/DashboardVariantSelector";
import { ProfessionalKpiRow } from "../src/components/ProfessionalKpiRow";
import { ThemeToggleButton } from "../src/components/ThemeToggleButton";
import { WebGrid } from "../src/components/WebGrid";
import { spacing } from "../src/constants/theme";
import { FAB } from "react-native-paper";
import { useProfessionalDashboardData } from "../src/hooks/useProfessionalDashboardData";
import { useTheme } from "../src/theme/ThemeContext";
import type { ThemeTokens } from "../src/theme/tokens";
import { useThemedStyles } from "../src/theme/useThemedStyles";

/** Cor de destaque da Variante A "Clínico Moderno" (azul-petróleo). Independe do primary global. */
const ACCENT_A = "#0F6E7A";

/** Dashboard como prontuário eletrônico profissional — Variante A: Clínico Moderno (densidade média, ícones lineares). */
export default function DashboardVariantA() {
  const router = useRouter();
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { patient, kpis, bradenTrend, tecTrend, latestMorse, carePlanWeek, recentNotes } = useProfessionalDashboardData();

  return (
    <View style={styles.container}>
      <View style={styles.header} testID="dashboard-a-header">
        <View>
          <Text style={styles.patientName}>{patient?.name ?? "—"}</Text>
          <Text style={styles.patientMeta}>
            {patient?.mainDiagnosis} {patient?.cid10 ? `(${patient.cid10})` : ""}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Feather
            name="user"
            size={22}
            color={ACCENT_A}
            onPress={() => patient && router.push(`/patient/${patient.id}`)}
            testID="dashboard-a-patient-icon"
          />
          <ThemeToggleButton />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <DashboardVariantSelector active="a" />

        <Section title="Indicadores em tempo real" accent={ACCENT_A}>
          <ProfessionalKpiRow kpis={kpis} accentColor={ACCENT_A} />
        </Section>

        <Section title="Evolução clínica" accent={ACCENT_A}>
          <WebGrid minItemWidth={280} gap={spacing.sm}>
            <BradenTrendChart points={bradenTrend} />
            <TecSparkline points={tecTrend} />
            <MorseGaugeCard latest={latestMorse} />
            <CarePlanWeekBarChart days={carePlanWeek} />
          </WebGrid>
        </Section>

        <Section title="Notas recentes" accent={ACCENT_A}>
          <RecentNotesTimeline notes={recentNotes} />
        </Section>
      </ScrollView>
      <FAB icon="plus" label="Novo Paciente" style={[styles.fab, { backgroundColor: ACCENT_A }]} onPress={() => router.push("/patient/new")} testID="dashboard-a-new-patient-fab" />
    </View>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.section}>
      <View style={[styles.sectionAccentBar, { backgroundColor: accent }]} />
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
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
      padding: spacing.md,
      backgroundColor: tokens.surfaceRaised,
      borderBottomWidth: 1,
      borderBottomColor: tokens.border,
    },
    patientName: { fontSize: 18, fontWeight: "700", color: tokens.ink },
    patientMeta: { fontSize: 13, color: tokens.inkSecondary },
    headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    content: { padding: spacing.md, gap: spacing.lg, paddingBottom: 96 },
    section: { gap: spacing.sm },
    sectionAccentBar: { width: 32, height: 3, borderRadius: 2, marginBottom: 4 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: tokens.ink, marginBottom: spacing.xs },
    fab: { position: "absolute", right: spacing.md, bottom: spacing.lg },
  });
}
