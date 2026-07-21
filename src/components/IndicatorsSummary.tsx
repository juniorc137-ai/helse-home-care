import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { calculateBradenScore, calculateMorseScore, classifyBradenScore, classifyMorseScore, classifyTec } from "../constants/clinicalScales";
import { colors } from "../constants/theme";
import { useIndicatorStore } from "../store/indicatorStore";
import type { BradenAssessment, MorseAssessment, TecAssessment } from "../types/entities";
import { Card } from "./Card";

interface IndicatorsSummaryProps {
  patientId: string;
}

/** Resumo dos indicadores de assistência (seção 2.4) com atalho para cada formulário. */
export function IndicatorsSummary({ patientId }: IndicatorsSummaryProps) {
  const router = useRouter();
  const latestBraden = useIndicatorStore((s) => s.getLatest(patientId, "braden"));
  const latestTec = useIndicatorStore((s) => s.getLatest(patientId, "tec"));
  const latestMorse = useIndicatorStore((s) => s.getLatest(patientId, "morse"));

  const bradenPayload = latestBraden?.payload as BradenAssessment | undefined;
  const tecPayload = latestTec?.payload as TecAssessment | undefined;
  const morsePayload = latestMorse?.payload as MorseAssessment | undefined;

  return (
    <View style={styles.container}>
      <Card title="Braden (risco de LPP)">
        <Text style={styles.value}>
          {bradenPayload
            ? `${calculateBradenScore(bradenPayload.scores)} — ${classifyBradenScore(calculateBradenScore(bradenPayload.scores))}`
            : "Sem avaliação registrada."}
        </Text>
        <Button mode="outlined" onPress={() => router.push(`/patient/${patientId}/indicators/braden`)}>
          Avaliar Braden
        </Button>
      </Card>

      <Card title="TEC (perfusão periférica)">
        <Text style={styles.value}>{tecPayload ? `${tecPayload.seconds}s — ${classifyTec(tecPayload.seconds).label}` : "Sem avaliação registrada."}</Text>
        <Button mode="outlined" onPress={() => router.push(`/patient/${patientId}/indicators/tec`)}>
          Avaliar TEC
        </Button>
      </Card>

      <Card title="Morse (risco de queda)">
        <Text style={styles.value}>
          {morsePayload ? `${calculateMorseScore(morsePayload.scores)} — ${classifyMorseScore(calculateMorseScore(morsePayload.scores))}` : "Sem avaliação registrada."}
        </Text>
        <Button mode="outlined" onPress={() => router.push(`/patient/${patientId}/indicators/morse`)}>
          Avaliar Morse
        </Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  value: { fontSize: 14, color: colors.textPrimary, marginBottom: 8 },
});
