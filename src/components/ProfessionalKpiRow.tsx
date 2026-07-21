import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { radii, shadows, spacing } from "../constants/theme";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";
import type { DashboardKpis } from "../utils/dashboardMetrics";
import { WebGrid } from "./WebGrid";

interface ProfessionalKpiRowProps {
  kpis: DashboardKpis;
  /** Cor de destaque da variante do dashboard (sobrepõe tokens.primary só nesta zona). */
  accentColor?: string;
}

/** Zona superior do dashboard profissional (seção 9): 4 KPIs em tempo real. */
export function ProfessionalKpiRow({ kpis, accentColor }: ProfessionalKpiRowProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
  const accent = accentColor ?? tokens.primary;

  const items: Array<{ key: string; label: string; value: number; icon: keyof typeof MaterialCommunityIcons.glyphMap; tone: string }> = [
    { key: "pendingToday", label: "Tarefas pendentes hoje", value: kpis.pendingToday, icon: "calendar-clock-outline", tone: accent },
    { key: "overdue", label: "Tarefas atrasadas", value: kpis.overdue, icon: "alert-circle-outline", tone: kpis.overdue > 0 ? tokens.statusDanger : tokens.statusOk },
    { key: "assessments7d", label: "Avaliações (7 dias)", value: kpis.assessmentsLast7Days, icon: "clipboard-pulse-outline", tone: accent },
    { key: "criticalAlerts", label: "Alertas críticos ativos", value: kpis.activeCriticalAlerts, icon: "bell-alert-outline", tone: kpis.activeCriticalAlerts > 0 ? tokens.statusDanger : tokens.statusOk },
  ];

  return (
    <WebGrid minItemWidth={200} gap={spacing.sm}>
      {items.map((item) => (
        <View key={item.key} style={styles.card} testID={`kpi-${item.key}`}>
          <MaterialCommunityIcons name={item.icon} size={20} color={item.tone} />
          <Text style={[styles.value, { color: item.tone }]}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </WebGrid>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    card: {
      backgroundColor: tokens.surfaceRaised,
      borderRadius: radii.md,
      padding: spacing.sm,
      gap: 4,
      ...shadows.sm,
    },
    value: { fontSize: 24, fontWeight: "700" },
    label: { fontSize: 12, color: tokens.inkSecondary },
  });
}
