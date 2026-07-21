import { StyleSheet, Text, View } from "react-native";
import { radii, shadows, spacing } from "../../constants/theme";
import { useTheme } from "../../theme/ThemeContext";
import type { ThemeTokens } from "../../theme/tokens";
import { useThemedStyles } from "../../theme/useThemedStyles";
import type { DayCarePlanStatus } from "../../utils/dashboardMetrics";

interface CarePlanWeekBarChartProps {
  days: DayCarePlanStatus[];
}

const BAR_AREA_HEIGHT = 90;

/** Barra empilhada de status do Care Plan por dia da última semana. */
export function CarePlanWeekBarChart({ days }: CarePlanWeekBarChartProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
  const maxTotal = Math.max(1, ...days.map((d) => d.pendente + d.concluida + d.adiada));

  return (
    <View style={styles.card} testID="care-plan-week-chart">
      <Text style={styles.title}>Care Plan — última semana</Text>
      <View style={styles.barsRow}>
        {days.map((day) => {
          const total = day.pendente + day.concluida + day.adiada;
          const scale = total === 0 ? 0 : BAR_AREA_HEIGHT / maxTotal;
          return (
            <View key={day.dateKey} style={styles.barColumn}>
              <View style={[styles.barStack, { height: BAR_AREA_HEIGHT }]}>
                {day.concluida > 0 && <View style={{ height: day.concluida * scale, backgroundColor: tokens.statusOk }} />}
                {day.pendente > 0 && <View style={{ height: day.pendente * scale, backgroundColor: tokens.primary }} />}
                {day.adiada > 0 && <View style={{ height: day.adiada * scale, backgroundColor: tokens.statusWarning }} />}
              </View>
              <Text style={styles.dayLabel}>{day.dayLabel}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legendRow}>
        <LegendItem color={tokens.statusOk} label="Concluída" />
        <LegendItem color={tokens.primary} label="Pendente" />
        <LegendItem color={tokens.statusWarning} label="Adiada" />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    card: { backgroundColor: tokens.surfaceRaised, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm, flex: 1, minWidth: 280 },
    title: { fontSize: 15, fontWeight: "700", color: tokens.ink, marginBottom: spacing.sm },
    barsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: BAR_AREA_HEIGHT + 20 },
    barColumn: { alignItems: "center", flex: 1 },
    barStack: { width: 18, justifyContent: "flex-end", borderRadius: 4, overflow: "hidden", backgroundColor: tokens.surface },
    dayLabel: { fontSize: 11, color: tokens.inkSecondary, marginTop: 4, textTransform: "capitalize" },
    legendRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap" },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    legendSwatch: { width: 10, height: 10, borderRadius: 2 },
    legendLabel: { fontSize: 11, color: tokens.inkSecondary },
  });
}
