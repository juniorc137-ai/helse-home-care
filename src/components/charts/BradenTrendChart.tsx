import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Polyline, Rect } from "react-native-svg";
import { BRADEN_CLASSIFICATION, BRADEN_SCORE_MAX, BRADEN_SCORE_MIN } from "../../constants/clinicalScales";
import { radii, shadows, spacing } from "../../constants/theme";
import { useTheme } from "../../theme/ThemeContext";
import type { ThemeTokens } from "../../theme/tokens";
import { useThemedStyles } from "../../theme/useThemedStyles";
import type { TrendPoint } from "../../utils/dashboardMetrics";

interface BradenTrendChartProps {
  points: TrendPoint[];
}

const CHART_WIDTH = 300;
const CHART_HEIGHT = 130;
const PADDING = 8;

function toneForLabel(label: string, tokens: ThemeTokens): string {
  if (label === "Risco alto" || label === "Risco muito alto") return tokens.statusDanger;
  if (label === "Risco moderado") return tokens.statusWarning;
  return tokens.statusOk;
}

/** Linha temporal do Braden (últimas 8 avaliações), com faixa de risco sombreada ao fundo. */
export function BradenTrendChart({ points }: BradenTrendChartProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (points.length === 0) {
    return (
      <View style={styles.card} testID="braden-trend-chart">
        <Text style={styles.title}>Braden — últimas avaliações</Text>
        <Text style={styles.empty}>Sem avaliações registradas ainda.</Text>
      </View>
    );
  }

  const innerWidth = CHART_WIDTH - PADDING * 2;
  const innerHeight = CHART_HEIGHT - PADDING * 2;
  const scoreRange = BRADEN_SCORE_MAX - BRADEN_SCORE_MIN;

  function yFor(score: number): number {
    const normalized = (score - BRADEN_SCORE_MIN) / scoreRange;
    return PADDING + innerHeight * (1 - normalized);
  }

  function xFor(index: number): number {
    return points.length === 1 ? PADDING + innerWidth / 2 : PADDING + (innerWidth * index) / (points.length - 1);
  }

  const bandColor = (label: string) => (label === "Risco alto" || label === "Risco muito alto" ? tokens.statusDangerBg : label === "Risco moderado" ? tokens.statusWarningBg : tokens.statusOkBg);

  return (
    <View style={styles.card} testID="braden-trend-chart">
      <Text style={styles.title}>Braden — últimas avaliações</Text>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {BRADEN_CLASSIFICATION.map((range) => (
          <Rect
            key={range.label}
            x={0}
            y={yFor(range.max)}
            width={CHART_WIDTH}
            height={Math.max(1, yFor(range.min) - yFor(range.max))}
            fill={bandColor(range.label)}
          />
        ))}
        <Polyline
          points={points.map((p, i) => `${xFor(i)},${yFor(p.value)}`).join(" ")}
          fill="none"
          stroke={tokens.primary}
          strokeWidth={2}
        />
        {points.map((p, i) => (
          <Circle key={i} cx={xFor(i)} cy={yFor(p.value)} r={4} fill={toneForLabel(p.label, tokens)} />
        ))}
      </Svg>
      <Text style={styles.caption}>
        Última: {points[points.length - 1].value} — {points[points.length - 1].label}
      </Text>
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    card: { backgroundColor: tokens.surfaceRaised, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm, flex: 1, minWidth: 280 },
    title: { fontSize: 15, fontWeight: "700", color: tokens.ink, marginBottom: spacing.xs },
    empty: { fontSize: 13, color: tokens.inkSecondary },
    caption: { fontSize: 12, color: tokens.inkSecondary, marginTop: spacing.xs },
  });
}
