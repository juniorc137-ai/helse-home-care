import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { radii, shadows, spacing } from "../constants/theme";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";

export interface QuickStat {
  key: string;
  label: string;
  value: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface QuickStatsProps {
  stats: QuickStat[];
}

/** Grid de estatísticas rápidas do dashboard (redesign v2): total pacientes, tarefas hoje, avaliações pendentes. */
export function QuickStats({ stats }: QuickStatsProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.grid} testID="quick-stats">
      {stats.map((stat) => (
        <View key={stat.key} style={styles.card} testID={`quick-stat-${stat.key}`}>
          <MaterialCommunityIcons name={stat.icon} size={22} color={tokens.primary} />
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    card: {
      flex: 1,
      minWidth: 110,
      backgroundColor: tokens.surfaceRaised,
      borderRadius: radii.md,
      padding: spacing.sm,
      gap: 2,
      ...shadows.sm,
    },
    value: { fontSize: 22, fontWeight: "700", color: tokens.ink },
    label: { fontSize: 12, color: tokens.inkSecondary },
  });
}
