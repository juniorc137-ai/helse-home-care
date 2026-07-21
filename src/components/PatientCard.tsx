import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors, minTouchTarget, radii, shadows, spacing } from "../constants/theme";
import type { Patient } from "../types/entities";
import type { PatientAlert } from "../utils/patientAlerts";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";

interface PatientCardProps {
  patient: Patient;
  alerts: PatientAlert[];
  nextAppointment: string | null;
  taskCompletionPct: number;
  onPress: () => void;
}

/** Card do dashboard (seção 2.1, redesign v2). Tap abre o Perfil; toque ≥ 44pt/48dp; micro-interação suave. */
export function PatientCard({ patient, alerts, nextAppointment, taskCompletionPct, onPress }: PatientCardProps) {
  const pressed = useSharedValue(0);
  const [hovered, setHovered] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.02 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 120 });
      }}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={`Abrir perfil de ${patient.name}`}
      hitSlop={8}
    >
      <Animated.View style={[styles.card, hovered && shadows.md, animatedStyle]}>
        <Text style={styles.name}>{patient.name}</Text>
        <Text style={styles.diagnosis} numberOfLines={2}>
          {patient.mainDiagnosis}
        </Text>
        {nextAppointment && <Text style={styles.appointment}>Próximo agendamento: {nextAppointment}</Text>}
        {alerts.length > 0 && (
          <View style={styles.alertsRow}>
            {alerts.map((alert, idx) => (
              <StatusBadge key={idx} label={alert.label} tone={alert.tone} />
            ))}
          </View>
        )}
        <View style={styles.progressWrapper}>
          <ProgressBar label="Plano de cuidados" percent={taskCompletionPct} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: minTouchTarget.android * 2,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: 6,
    ...shadows.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  diagnosis: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  appointment: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  alertsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  progressWrapper: { marginTop: spacing.xs },
});
