import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";

interface CircularIndicatorProps {
  label: string;
  value: string;
  sublabel?: string;
  /** 0-100: quanto do anel é preenchido (semântica definida por quem chama — ver indicatorVisuals.ts). */
  percent: number;
  color: string;
  size?: number;
  testID?: string;
}

const STROKE_WIDTH = 8;

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { alignItems: "center", gap: 4, minWidth: 96 },
    valueOverlay: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    value: { fontSize: 18, fontWeight: "700", color: tokens.ink },
    label: { fontSize: 13, fontWeight: "600", color: tokens.ink, textAlign: "center" },
    sublabel: { fontSize: 11, color: tokens.inkSecondary, textAlign: "center" },
  });
}

/** Indicador circular genérico (health card do perfil do paciente). */
export function CircularIndicator({ label, value, sublabel, percent, color, size = 88, testID }: CircularIndicatorProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <View style={styles.container} testID={testID}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={tokens.surface} strokeWidth={STROKE_WIDTH} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={[styles.valueOverlay, { width: size, height: size }]}>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
}
