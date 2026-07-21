import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeTokens } from "../theme/tokens";

export type BadgeTone = "ok" | "warning" | "danger" | "neutral";

interface StatusBadgeProps {
  label: string;
  tone: BadgeTone;
}

function toneStyles(tokens: ThemeTokens): Record<BadgeTone, { bg: string; text: string }> {
  return {
    ok: { bg: tokens.statusOkBg, text: tokens.statusOk },
    warning: { bg: tokens.statusWarningBg, text: tokens.statusWarning },
    danger: { bg: tokens.statusDangerBg, text: tokens.statusDanger },
    neutral: { bg: tokens.surface, text: tokens.inkSecondary },
  };
}

/** Zona de toque mínima não se aplica (badge informativo, não interativo). */
export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const { tokens } = useTheme();
  const toneStyle = toneStyles(tokens)[tone];
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
