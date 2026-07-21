import { StyleSheet, Text, View } from "react-native";
import { radii, shadows, spacing } from "../constants/theme";
import { useCarePlanStore } from "../store/carePlanStore";
import { useIndicatorStore } from "../store/indicatorStore";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";
import { calculateConsistencyStreak, calculateTeamPoints, calculateTier, TIER_EMOJI } from "../utils/teamAchievements";

/**
 * Conquistas da equipe assistencial (redesign v2, ADR-006): pontos,
 * sequência de consistência e selo por tier. Nunca ranking de pacientes.
 */
export function TeamAchievementsCard() {
  const styles = useThemedStyles(createStyles);
  const tasksByPatient = useCarePlanStore((s) => s.tasksByPatient);
  const assessmentsByPatient = useIndicatorStore((s) => s.assessmentsByPatient);

  const allTasks = Object.values(tasksByPatient).flat();
  const allAssessments = Object.values(assessmentsByPatient).flat();

  const tasksCompletedCount = allTasks.filter((t) => t.status === "concluida").length;
  const assessmentsCompletedCount = allAssessments.length;
  const points = calculateTeamPoints(tasksCompletedCount, assessmentsCompletedCount);
  const tier = calculateTier(points);
  const streak = calculateConsistencyStreak(allTasks);

  return (
    <View style={styles.card} testID="team-achievements-card">
      <Text style={styles.title}>Suas conquistas</Text>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{points}</Text>
          <Text style={styles.metricLabel}>pontos</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>
            {streak} {streak > 0 ? "🔥" : ""}
          </Text>
          <Text style={styles.metricLabel}>dias de consistência</Text>
        </View>
        {tier && (
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{TIER_EMOJI[tier]}</Text>
            <Text style={styles.metricLabel}>selo {tier}</Text>
          </View>
        )}
      </View>
      <Text style={styles.hint}>+10 por tarefa concluída, +5 por avaliação clínica registrada.</Text>
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    card: {
      backgroundColor: tokens.surfaceRaised,
      borderRadius: radii.lg,
      padding: spacing.md,
      ...shadows.md,
    },
    title: { fontSize: 18, fontWeight: "700", color: tokens.ink, marginBottom: spacing.sm },
    row: { flexDirection: "row", gap: spacing.lg },
    metric: { alignItems: "center", flex: 1 },
    metricValue: { fontSize: 22, fontWeight: "700", color: tokens.ink },
    metricLabel: { fontSize: 12, color: tokens.inkSecondary, textAlign: "center" },
    hint: { fontSize: 12, color: tokens.inkMuted, marginTop: spacing.sm },
  });
}
