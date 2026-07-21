import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export type BadgeTone = "ok" | "warning" | "danger" | "neutral";

interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
}

const TONE_STYLES: Record<BadgeTone, { bg: string; text: string }> = {
  ok: { bg: colors.statusOkBg, text: colors.statusOk },
  warning: { bg: colors.statusWarningBg, text: colors.statusWarning },
  danger: { bg: colors.statusDangerBg, text: colors.statusDanger },
  neutral: { bg: colors.surface, text: colors.textSecondary },
};

/** Zona de toque mínima não se aplica (badge informativo, não interativo). */
export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const toneStyle = TONE_STYLES[tone];
  return (
    <View
      style={[styles.container, { backgroundColor: toneStyle.bg }]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      <Text style={[styles.text, { color: toneStyle.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});
