import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import {
  BRADEN_SUBSCALES,
  calculateBradenScore,
  classifyBradenScore,
  type BradenScores,
  type BradenSubscaleKey,
} from "../constants/clinicalScales";
import { colors } from "../constants/theme";
import { MOCK_CURRENT_USER_ID } from "../constants/mockSession";
import { useIndicatorStore } from "../store/indicatorStore";
import { Card } from "./Card";
import { SubscalePicker } from "./SubscalePicker";

interface BradenFormProps {
  patientId: string;
  onSubmitted?: () => void;
}

type PartialScores = Partial<Record<BradenSubscaleKey, number>>;

/** Formulário completo da Escala de Braden (seção 2.4.1) — 6 subescalas + escore + classificação. */
export function BradenForm({ patientId, onSubmitted }: BradenFormProps) {
  const [scores, setScores] = useState<PartialScores>({});
  const addAssessment = useIndicatorStore((s) => s.addAssessment);

  const isComplete = BRADEN_SUBSCALES.every((sub) => scores[sub.key] !== undefined);
  const total = useMemo(() => (isComplete ? calculateBradenScore(scores as BradenScores) : null), [scores, isComplete]);
  const classification = total !== null ? classifyBradenScore(total) : null;

  function handleSelect(key: BradenSubscaleKey, score: number) {
    setScores((prev) => ({ ...prev, [key]: score }));
  }

  function handleSubmit() {
    if (!isComplete) return;
    addAssessment(MOCK_CURRENT_USER_ID, patientId, { type: "braden", scores: scores as BradenScores });
    onSubmitted?.();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {BRADEN_SUBSCALES.map((sub) => (
        <SubscalePicker
          key={sub.key}
          testID={`braden-subscale-${sub.key}`}
          title={sub.title}
          selected={scores[sub.key] ?? null}
          onSelect={(score) => handleSelect(sub.key, score)}
          options={sub.levels.map((level) => ({ score: level.score, label: level.label, helperText: level.orientacaoClinica }))}
        />
      ))}

      <Card title="Resultado">
        {total !== null ? (
          <>
            <Text style={styles.resultScore}>
              Escore total: {total} — {classification}
            </Text>
            <Text style={styles.resultHint}>Reavaliação recomendada em 7 dias, ou antes se houver mudança clínica significativa.</Text>
          </>
        ) : (
          <Text style={styles.pending}>Selecione um nível em cada uma das 6 subescalas para calcular o escore.</Text>
        )}
      </Card>

      <Button mode="contained" disabled={!isComplete} onPress={handleSubmit} testID="braden-submit">
        Registrar avaliação
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, paddingBottom: 32 },
  resultScore: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  resultHint: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  pending: { fontSize: 13, color: colors.textSecondary },
});
