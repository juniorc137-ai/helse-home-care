import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, minTouchTarget } from "../constants/theme";
import type { Patient } from "../types/entities";
import type { PatientAlert } from "../utils/patientAlerts";
import { StatusBadge } from "./StatusBadge";

interface PatientCardProps {
  patient: Patient;
  alerts: PatientAlert[];
  nextAppointment: string | null;
  onPress: () => void;
}

/** Card do dashboard (seção 2.1). Tap abre o Perfil do Paciente; toque ≥ 44pt/48dp. */
export function PatientCard({ patient, alerts, nextAppointment, onPress }: PatientCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Abrir perfil de ${patient.name}`}
      hitSlop={8}
    >
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: minTouchTarget.android * 2,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    gap: 6,
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
});
