import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Checkbox, TextInput } from "react-native-paper";
import {
  classifyTec,
  requiresTecCoordinatorAlert,
  TEC_MAX_SECONDS,
  TEC_MIN_SECONDS,
  TEC_STEP_SECONDS,
} from "../constants/clinicalScales";
import { MOCK_CURRENT_USER_ID } from "../constants/mockSession";
import { colors } from "../constants/theme";
import { useIndicatorStore } from "../store/indicatorStore";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";

interface TecFormProps {
  patientId: string;
  onSubmitted?: () => void;
}

function roundToStep(seconds: number): number {
  const rounded = Math.round(seconds / TEC_STEP_SECONDS) * TEC_STEP_SECONDS;
  return Math.min(TEC_MAX_SECONDS, Math.max(TEC_MIN_SECONDS, Math.round(rounded * 10) / 10));
}

/** Formulário de Tempo de Enchimento Capilar (seção 2.4.2): timer visual, passo 0,5s, faixa 0-10s. */
export function TecForm({ patientId, onSubmitted }: TecFormProps) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [hasContextualFactor, setHasContextualFactor] = useState(false);
  const [contextualNote, setContextualNote] = useState("");
  const startedAtRef = useRef<number | null>(null);
  const addAssessment = useIndicatorStore((s) => s.addAssessment);

  useEffect(() => {
    if (!running) return;
    const intervalId = setInterval(() => {
      if (startedAtRef.current === null) return;
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      setSeconds(Math.min(TEC_MAX_SECONDS, elapsed));
    }, 100);
    return () => clearInterval(intervalId);
  }, [running]);

  function handleToggleTimer() {
    if (running) {
      setRunning(false);
      setSeconds((current) => roundToStep(current));
    } else {
      startedAtRef.current = Date.now();
      setRunning(true);
    }
  }

  function adjustSeconds(delta: number) {
    setRunning(false);
    setSeconds((current) => roundToStep(current + delta));
  }

  const classification = classifyTec(seconds);
  const alertNeeded = requiresTecCoordinatorAlert(seconds, hasContextualFactor);
  const toneByColor = { verde: "ok", amarelo: "warning", vermelho: "danger" } as const;

  function handleSubmit() {
    addAssessment(MOCK_CURRENT_USER_ID, patientId, {
      type: "tec",
      seconds,
      hasContextualFactor,
      contextualFactorNote: hasContextualFactor ? contextualNote : undefined,
    });
    onSubmitted?.();
  }

  return (
    <View style={styles.container}>
      <Card title="Timer visual">
        <Text style={styles.timerDisplay} testID="tec-timer-display">
          {`${seconds.toFixed(1)}s`}
        </Text>
        <StatusBadge label={classification.label} tone={toneByColor[classification.color]} />
        <View style={styles.row}>
          <Button mode="contained" onPress={handleToggleTimer} testID="tec-toggle-timer">
            {running ? "Parar" : "Iniciar"}
          </Button>
          <Button mode="outlined" onPress={() => adjustSeconds(-TEC_STEP_SECONDS)} disabled={running}>
            − 0,5s
          </Button>
          <Button mode="outlined" onPress={() => adjustSeconds(TEC_STEP_SECONDS)} disabled={running}>
            + 0,5s
          </Button>
        </View>
      </Card>

      <Card>
        <Checkbox.Item
          label="Fator contextual presente (hipotermia, vasoconstritores)"
          status={hasContextualFactor ? "checked" : "unchecked"}
          onPress={() => setHasContextualFactor((v) => !v)}
        />
        {hasContextualFactor && (
          <TextInput
            mode="outlined"
            label="Descreva o fator contextual"
            value={contextualNote}
            onChangeText={setContextualNote}
          />
        )}
        {alertNeeded && (
          <Text style={styles.alertText}>
            TEC &gt; 3s sem fator contextual registrado: um alerta será enviado ao coordenador.
          </Text>
        )}
      </Card>

      <Button mode="contained" onPress={handleSubmit} testID="tec-submit">
        Registrar avaliação
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  timerDisplay: { fontSize: 36, fontWeight: "700", color: colors.textPrimary },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 },
  alertText: { fontSize: 13, color: colors.statusDanger, marginTop: 8 },
});
