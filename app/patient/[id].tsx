import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Checkbox } from "react-native-paper";
import { StatusBadge } from "../../src/components/StatusBadge";
import { calculateBradenScore, classifyBradenScore } from "../../src/constants/clinicalScales";
import { colors } from "../../src/constants/theme";
import { useCarePlanStore } from "../../src/store/carePlanStore";
import { useIndicatorStore } from "../../src/store/indicatorStore";
import { usePatientStore } from "../../src/store/patientStore";

const NURSE_ID = "user-nurse-01"; // sessão mock (Fase 1); RBAC real na Fase 5

/**
 * Perfil do Paciente + Plano de Cuidados + Indicadores (seções 2.2-2.4),
 * consolidados em uma única tela por acordeão no MVP (mobile-first).
 */
export default function PatientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const patient = usePatientStore((s) => s.getById(id));
  const tasks = useCarePlanStore((s) => s.tasksByPatient[id] ?? []);
  const completeTask = useCarePlanStore((s) => s.completeTask);
  const latestBraden = useIndicatorStore((s) => s.getLatest(id, "braden"));

  const [bradenTotal, setBradenTotal] = useState<number | null>(null);

  if (!patient) {
    return (
      <View style={styles.container}>
        <Text>Paciente não encontrado.</Text>
      </View>
    );
  }

  const bradenScoreToShow =
    bradenTotal ?? (latestBraden?.payload.type === "braden" ? calculateBradenScore(latestBraden.payload.scores) : null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{patient.name}</Text>
      <Text style={styles.subtitle}>{patient.mainDiagnosis}</Text>

      <Section title="Plano de Cuidados">
        {tasks.length === 0 && <Text style={styles.muted}>Nenhuma tarefa agendada.</Text>}
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskRow}>
            <Checkbox
              status={task.status === "concluida" ? "checked" : "unchecked"}
              disabled={task.status === "concluida"}
              onPress={() => completeTask(NURSE_ID, patient.id, task.id)}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.taskDescription}>{task.descricao}</Text>
              <Text style={styles.muted}>{new Date(task.horarioAgendado).toLocaleString("pt-BR")}</Text>
            </View>
            <StatusBadge
              label={task.status === "concluida" ? "Concluída" : task.status === "adiada" ? "Adiada" : "Pendente"}
              tone={task.status === "concluida" ? "ok" : task.status === "adiada" ? "warning" : "neutral"}
            />
          </View>
        ))}
      </Section>

      <Section title="Indicador de Braden (risco de LPP)">
        {bradenScoreToShow !== null ? (
          <Text style={styles.taskDescription}>
            Escore {bradenScoreToShow} — {classifyBradenScore(bradenScoreToShow)}
          </Text>
        ) : (
          <Text style={styles.muted}>Sem avaliação registrada.</Text>
        )}
        <Button mode="outlined" style={{ marginTop: 8 }} onPress={() => setBradenTotal(10)}>
          Simular avaliação (fixture de referência)
        </Button>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16, gap: 16 },
  name: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 8 },
  section: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  muted: { fontSize: 13, color: colors.textSecondary },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  taskDescription: { fontSize: 14, color: colors.textPrimary, fontWeight: "600" },
});
