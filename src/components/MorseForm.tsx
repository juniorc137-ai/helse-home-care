import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Button } from "react-native-paper";
import { calculateMorseScore, classifyMorseScore, type MorseScores } from "../constants/clinicalScales";
import { MOCK_CURRENT_USER_ID } from "../constants/mockSession";
import { useIndicatorStore } from "../store/indicatorStore";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";
import { Card } from "./Card";
import { SubscalePicker } from "./SubscalePicker";

interface MorseFormProps {
  patientId: string;
  onSubmitted?: () => void;
}

type PartialMorse = Partial<MorseScores>;

/** Itens da Escala de Morse (seção 2.4.3, versão brasileira Urbanetto et al., 2013). */
const MORSE_ITEMS: Array<{ key: keyof MorseScores; title: string; options: Array<{ score: number; label: string }> }> = [
  {
    key: "historicoQuedas",
    title: "Histórico de quedas (últimos 3 meses)",
    options: [
      { score: 0, label: "Não" },
      { score: 25, label: "Sim" },
    ],
  },
  {
    key: "diagnosticoSecundario",
    title: "Diagnóstico secundário",
    options: [
      { score: 0, label: "Não" },
      { score: 15, label: "Sim" },
    ],
  },
  {
    key: "auxilioDeambulacao",
    title: "Auxílio na deambulação",
    options: [
      { score: 0, label: "Nenhum / acamado / cuidador / cadeira de rodas" },
      { score: 15, label: "Muletas, bengala ou andador" },
      { score: 30, label: "Apoia-se em móveis" },
    ],
  },
  {
    key: "terapiaEndovenosa",
    title: "Terapia endovenosa / dispositivo EV",
    options: [
      { score: 0, label: "Não" },
      { score: 20, label: "Sim" },
    ],
  },
  {
    key: "marcha",
    title: "Marcha",
    options: [
      { score: 0, label: "Normal, acamado ou imóvel" },
      { score: 10, label: "Fraca" },
      { score: 20, label: "Comprometida" },
    ],
  },
  {
    key: "estadoMental",
    title: "Estado mental",
    options: [
      { score: 0, label: "Orientado quanto à própria capacidade" },
      { score: 15, label: "Superestima a capacidade / esquece limitações" },
    ],
  },
];

export function MorseForm({ patientId, onSubmitted }: MorseFormProps) {
  const styles = useThemedStyles(createStyles);
  const [scores, setScores] = useState<PartialMorse>({});
  const addAssessment = useIndicatorStore((s) => s.addAssessment);

  const isComplete = MORSE_ITEMS.every((item) => scores[item.key] !== undefined);
  const total = useMemo(() => (isComplete ? calculateMorseScore(scores as MorseScores) : null), [scores, isComplete]);
  const classification = total !== null ? classifyMorseScore(total) : null;

  function handleSelect(key: keyof MorseScores, score: number) {
    setScores((prev) => ({ ...prev, [key]: score }));
  }

  function handleSubmit() {
    if (!isComplete) return;
    addAssessment(MOCK_CURRENT_USER_ID, patientId, { type: "morse", scores: scores as MorseScores });
    onSubmitted?.();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {MORSE_ITEMS.map((item) => (
        <SubscalePicker
          key={item.key}
          testID={`morse-item-${item.key}`}
          title={item.title}
          selected={scores[item.key] ?? null}
          onSelect={(score) => handleSelect(item.key, score)}
          options={item.options}
        />
      ))}

      <Card title="Resultado">
        {total !== null ? (
          <Text style={styles.resultScore}>
            Escore total: {total} — {classification}
          </Text>
        ) : (
          <Text style={styles.pending}>Selecione uma opção em cada um dos 6 itens para calcular o escore.</Text>
        )}
      </Card>

      <Button mode="contained" disabled={!isComplete} onPress={handleSubmit} testID="morse-submit">
        Registrar avaliação
      </Button>
    </ScrollView>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { gap: 12, paddingBottom: 32 },
    resultScore: { fontSize: 16, fontWeight: "700", color: tokens.ink },
    pending: { fontSize: 13, color: tokens.inkSecondary },
  });
}
