import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { radii, shadows, spacing } from "../constants/theme";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";
import type { Patient } from "../types/entities";
import type { PatientAlert } from "../utils/patientAlerts";
import { StatusBadge } from "./StatusBadge";

interface FeaturedPatientCardProps {
  patient: Patient;
  alerts: PatientAlert[];
  onPress: () => void;
}

/** Card principal do dia (redesign v2): paciente de maior urgência, com destaque animado sutil. */
export function FeaturedPatientCard({ patient, alerts, onPress }: FeaturedPatientCardProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.15 + glow.value * 0.15,
  }));

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Paciente do dia: ${patient.name}`} testID="featured-patient-card">
      <Animated.View style={[styles.card, glowStyle]}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="star-circle" size={22} color={tokens.primary} />
          <Text style={styles.eyebrow}>Paciente do dia</Text>
        </View>
        <Text style={styles.name}>{patient.name}</Text>
        <Text style={styles.diagnosis} numberOfLines={2}>
          {patient.mainDiagnosis}
        </Text>
        {alerts.length > 0 && (
          <View style={styles.alertsRow}>
            {alerts.map((alert, index) => (
              <StatusBadge key={index} label={alert.label} tone={alert.tone} />
            ))}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    card: {
      backgroundColor: tokens.surfaceRaised,
      borderRadius: radii.lg,
      padding: spacing.lg,
      gap: 6,
      borderWidth: 1.5,
      borderColor: tokens.primaryMuted,
      ...shadows.lg,
    },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
    eyebrow: { fontSize: 13, fontWeight: "700", color: tokens.primary, textTransform: "uppercase" },
    name: { fontSize: 20, fontWeight: "700", color: tokens.ink },
    diagnosis: { fontSize: 15, color: tokens.inkSecondary },
    alertsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  });
}
