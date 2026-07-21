import { StyleSheet, Text, View } from "react-native";
import { radii, shadows, spacing } from "../constants/theme";
import { useIndicatorStore } from "../store/indicatorStore";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";
import type { BradenAssessment, MorseAssessment, TecAssessment } from "../types/entities";
import { bradenToVisual, morseToVisual, tecToVisual } from "../utils/indicatorVisuals";
import { CircularIndicator } from "./CircularIndicator";

interface HealthCardProps {
  patientId: string;
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    card: {
      backgroundColor: tokens.surfaceRaised,
      borderRadius: radii.lg,
      padding: spacing.md,
      ...shadows.md,
    },
    title: { fontSize: 18, fontWeight: "700", color: tokens.ink, marginBottom: spacing.sm },
    empty: { fontSize: 14, color: tokens.inkSecondary },
    ringsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, justifyContent: "space-around" },
  });
}

/** Resumo visual do perfil do paciente (redesign v2): indicadores circulares dos escores centrais. */
export function HealthCard({ patientId }: HealthCardProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
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
            <CircularIndicator {...bradenToVisual(latestBraden.payload as BradenAssessment, tokens)} testID="health-card-braden" />
          )}
          {latestTec && <CircularIndicator {...tecToVisual(latestTec.payload as TecAssessment, tokens)} testID="health-card-tec" />}
          {latestMorse && (
            <CircularIndicator {...morseToVisual(latestMorse.payload as MorseAssessment, tokens)} testID="health-card-morse" />
          )}
        </View>
      )}
    </View>
  );
}
