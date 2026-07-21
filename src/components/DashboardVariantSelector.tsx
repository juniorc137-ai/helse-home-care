import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Pressable } from "react-native";
import { radii, spacing } from "../constants/theme";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";

interface DashboardVariantSelectorProps {
  active: "a" | "b";
}

/** Seletor no topo para comparar Variante A (Clínico Moderno) e Variante B (Minimalista + micro-gamificação). */
export function DashboardVariantSelector({ active }: DashboardVariantSelectorProps) {
  const router = useRouter();
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container} testID="dashboard-variant-selector">
      <Pressable
        onPress={() => router.replace("/dashboard-a")}
        style={[styles.option, active === "a" && { backgroundColor: tokens.primary }]}
        testID="dashboard-variant-a-button"
      >
        <Text style={[styles.optionText, active === "a" && styles.optionTextActive]}>A · Clínico Moderno</Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace("/dashboard-b")}
        style={[styles.option, active === "b" && { backgroundColor: tokens.primary }]}
        testID="dashboard-variant-b-button"
      >
        <Text style={[styles.optionText, active === "b" && styles.optionTextActive]}>B · Minimalista</Text>
      </Pressable>
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { flexDirection: "row", gap: spacing.xs, padding: spacing.xs, backgroundColor: tokens.surface, borderRadius: radii.full, alignSelf: "flex-start" },
    option: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full },
    optionText: { fontSize: 13, fontWeight: "600", color: tokens.inkSecondary },
    optionTextActive: { color: "#fff" },
  });
}
