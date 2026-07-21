import { StyleSheet, Text, View } from "react-native";
import { radii, shadows, spacing } from "../../constants/theme";
import { useTheme } from "../../theme/ThemeContext";
import type { ThemeTokens } from "../../theme/tokens";
import { useThemedStyles } from "../../theme/useThemedStyles";
import type { LatestMorse } from "../../utils/dashboardMetrics";
import { CircularIndicator } from "../CircularIndicator";

interface MorseGaugeCardProps {
  latest: LatestMorse | null;
}

const MAX_VISUAL_SCORE = 125;

/** Gauge/donut do Morse atual (zona de gráficos do dashboard profissional). */
export function MorseGaugeCard({ latest }: MorseGaugeCardProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!latest) {
    return (
      <View style={styles.card} testID="morse-gauge-card">
        <Text style={styles.title}>Morse atual</Text>
        <Text style={styles.empty}>Sem avaliação registrada ainda.</Text>
      </View>
    );
  }

  const color = latest.classification === "Risco elevado" ? tokens.statusDanger : latest.classification === "Risco moderado" ? tokens.statusWarning : tokens.statusOk;

  return (
    <View style={styles.card} testID="morse-gauge-card">
      <Text style={styles.title}>Morse atual</Text>
      <CircularIndicator
        label="Morse"
        value={String(latest.score)}
        sublabel={latest.classification}
        percent={Math.round((latest.score / MAX_VISUAL_SCORE) * 100)}
        color={color}
        size={110}
      />
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    card: { backgroundColor: tokens.surfaceRaised, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm, alignItems: "center", minWidth: 180 },
    title: { fontSize: 15, fontWeight: "700", color: tokens.ink, marginBottom: spacing.sm, alignSelf: "flex-start" },
    empty: { fontSize: 13, color: tokens.inkSecondary },
  });
}
