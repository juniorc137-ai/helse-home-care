import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Polyline, Rect } from "react-native-svg";
import { TEC_MAX_SECONDS, TEC_MIN_SECONDS } from "../../constants/clinicalScales";
import { radii, shadows, spacing } from "../../constants/theme";
import { useTheme } from "../../theme/ThemeContext";
import type { ThemeTokens } from "../../theme/tokens";
import { useThemedStyles } from "../../theme/useThemedStyles";
import type { TrendPoint } from "../../utils/dashboardMetrics";

interface TecSparklineProps {
  points: TrendPoint[];
}

const CHART_WIDTH = 300;
const CHART_HEIGHT = 110;
const PADDING = 8;

/** Sparkline do TEC (últimas 10 medições) com faixas de referência (Normal/Limítrofe/Alterado). */
export function TecSparkline({ points }: TecSparklineProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (points.length === 0) {
    return (
      <View style={styles.card} testID="tec-sparkline">
        <Text style={styles.title}>TEC — últimas medições</Text>
        <Text style={styles.empty}>Sem medições registradas ainda.</Text>
      </View>
    );
  }

  const innerWidth = CHART_WIDTH - PADDING * 2;
  const innerHeight = CHART_HEIGHT - PADDING * 2;
  const range = TEC_MAX_SECONDS - TEC_MIN_SECONDS;

  function yFor(seconds: number): number {
    return PADDING + innerHeight * (1 - (seconds - TEC_MIN_SECONDS) / range);
  }
  function xFor(index: number): number {
    return points.length === 1 ? PADDING + innerWidth / 2 : PADDING + (innerWidth * index) / (points.length - 1);
  }
  function colorFor(label: string): string {
    if (label === "Alterado") return tokens.statusDanger;
    if (label === "Limítrofe (atenção)") return tokens.statusWarning;
    return tokens.statusOk;
  }

  return (
    <View style={styles.card} testID="tec-sparkline">
      <Text style={styles.title}>TEC — últimas medições</Text>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Rect x={0} y={yFor(3)} width={CHART_WIDTH} height={Math.max(1, yFor(TEC_MIN_SECONDS) - yFor(3))} fill={tokens.statusDangerBg} />
        <Rect x={0} y={yFor(2)} width={CHART_WIDTH} height={Math.max(1, yFor(3) - yFor(2))} fill={tokens.statusWarningBg} />
        <Rect x={0} y={PADDING} width={CHART_WIDTH} height={Math.max(1, yFor(2) - PADDING)} fill={tokens.statusOkBg} />
        <Polyline points={points.map((p, i) => `${xFor(i)},${yFor(p.value)}`).join(" ")} fill="none" stroke={tokens.primary} strokeWidth={2} />
        {points.map((p, i) => (
          <Circle key={i} cx={xFor(i)} cy={yFor(p.value)} r={4} fill={colorFor(p.label)} />
        ))}
      </Svg>
      <Text style={styles.caption}>
        Última: {points[points.length - 1].value}s — {points[points.length - 1].label}
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
