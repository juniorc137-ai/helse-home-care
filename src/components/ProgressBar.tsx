import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ANIMATION_MS, colors, radii } from "../constants/theme";

interface ProgressBarProps {
  label: string;
  percent: number; // 0-100
  testID?: string;
}

/** Barra de progresso minimalista (% tarefas concluídas / % avaliações em dia). */
export function ProgressBar({ label, percent, testID }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(clamped, { duration: ANIMATION_MS.celebration });
  }, [clamped, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.percent}>{clamped}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 13, color: colors.textSecondary },
  percent: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  track: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radii.full,
    backgroundColor: colors.primary,
  },
});
