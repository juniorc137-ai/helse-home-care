import { StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing } from "../constants/theme";
import { useIndicatorStore } from "../store/indicatorStore";
import type { BradenAssessment, MorseAssessment, TecAssessment } from "../types/entities";
import { CircularIndicator } from "./CircularIndicator";
import { bradenToVisual, morseToVisual, tecToVisual } from "../utils/indicatorVisuals";

interface HealthCardProps {
  patientId: string;
}

/** Resumo visual do perfil do paciente (redesign v2): indicadores circulares dos escores centrais. */
export function HealthCard({ patientId }: HealthCardProps) {
  const latestBraden = useIndicatorStore((s) => s.getLatest(patientId, "braden"));
  const latestTec = useIndicatorStore((s) => s.getLatest(patientId, "tec"));
  const latestMorse = useIndicatorStore((s) => s.getLatest(patientId, "morse"));

  const hasAny = latestBraden || latestTec || latestMorse;

  return (
    <View style={styles.card} testID="health-card">
      <Text style={styles.title}>Resumo clínico</Text>
      {!hasAny ? (
        <Text style={styles.empty}>Nenhuma avaliação registrada ainda.</Text>
      ) : (
        <View style={styles.ringsRow}>
          {latestBraden && (
            <CircularIndicator {...bradenToVisual(latestBraden.payload as BradenAssessment)} testID="health-card-braden" />
          )}
          {latestTec && <CircularIndicator {...tecToVisual(latestTec.payload as TecAssessment)} testID="health-card-tec" />}
          {latestMorse && (
            <CircularIndicator {...morseToVisual(latestMorse.payload as MorseAssessment)} testID="health-card-morse" />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.sm },
  empty: { fontSize: 14, color: colors.textSecondary },
  ringsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, justifyContent: "space-around" },
});
