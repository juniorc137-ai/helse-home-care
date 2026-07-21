import { StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing } from "../constants/theme";
import { useCarePlanStore } from "../store/carePlanStore";
import { useIndicatorStore } from "../store/indicatorStore";
import type { CarePlanTask, IndicatorAssessment } from "../types/entities";
import { calculateAssessmentsUpToDatePct, calculatePatientBadges, calculateTaskCompletionPct } from "../utils/patientProgress";
import { ProgressBar } from "./ProgressBar";

interface PatientBadgesSectionProps {
  patientId: string;
}

const EMPTY_TASKS: CarePlanTask[] = [];
const EMPTY_ASSESSMENTS: IndicatorAssessment[] = [];

/**
 * Progresso e badges de completude do paciente (redesign v2). Indicadores
 * de qualidade documental — não uma pontuação competitiva do paciente
 * (ver ADR-006, docs/DECISIONS.md).
 */
export function PatientBadgesSection({ patientId }: PatientBadgesSectionProps) {
  const tasks = useCarePlanStore((s) => s.tasksByPatient[patientId] ?? EMPTY_TASKS);
  const assessments = useIndicatorStore((s) => s.assessmentsByPatient[patientId] ?? EMPTY_ASSESSMENTS);

  const taskPct = calculateTaskCompletionPct(tasks);
  const assessmentPct = calculateAssessmentsUpToDatePct(assessments);
  const badges = calculatePatientBadges(taskPct, assessmentPct);

  return (
    <View style={styles.card} testID="patient-badges-section">
      <Text style={styles.title}>Progresso do cuidado</Text>
      <ProgressBar label="Plano de cuidados concluído" percent={taskPct} testID="patient-progress-tasks" />
      <View style={{ height: spacing.sm }} />
      <ProgressBar label="Avaliações clínicas em dia" percent={assessmentPct} testID="patient-progress-assessments" />

      {badges.length > 0 && (
        <View style={styles.badgesRow}>
          {badges.map((badge) => (
            <View key={badge.key} style={styles.badge} testID={`patient-badge-${badge.key}`}>
              <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.sm },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.md },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primaryMuted,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeEmoji: { fontSize: 16 },
  badgeLabel: { fontSize: 13, fontWeight: "600", color: colors.primary },
});
