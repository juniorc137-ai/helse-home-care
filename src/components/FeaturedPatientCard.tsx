import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { colors, radii, shadows, spacing } from "../constants/theme";
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
          <MaterialCommunityIcons name="star-circle" size={22} color={colors.primary} />
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: 6,
    borderWidth: 1.5,
    borderColor: colors.primaryMuted,
    ...shadows.lg,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  eyebrow: { fontSize: 13, fontWeight: "700", color: colors.primary, textTransform: "uppercase" },
  name: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
  diagnosis: { fontSize: 15, color: colors.textSecondary },
  alertsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
});
