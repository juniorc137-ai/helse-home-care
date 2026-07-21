import { StyleSheet, Text, View } from "react-native";
import { Checkbox } from "react-native-paper";
import { colors } from "../constants/theme";
import { MOCK_CURRENT_USER_ID } from "../constants/mockSession";
import { useCarePlanStore } from "../store/carePlanStore";
import type { CarePlanTask } from "../types/entities";
import { getTaskStatusDisplay } from "../utils/taskStatusTone";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";

interface CarePlanSectionProps {
  patientId: string;
}

// Referência estável: um novo `[]` dentro do seletor do Zustand quebraria o
// useSyncExternalStore (getSnapshot mudaria a cada chamada -> loop infinito).
const EMPTY_TASKS: CarePlanTask[] = [];

/** Plano de Cuidados (seção 2.3): lista de tarefas com semáforo de status e conclusão. */
export function CarePlanSection({ patientId }: CarePlanSectionProps) {
  const patientTasks = useCarePlanStore((s) => s.tasksByPatient[patientId] ?? EMPTY_TASKS);
  const tasks = patientTasks.filter((t) => !t.deletedAt);
  const completeTask = useCarePlanStore((s) => s.completeTask);

  if (tasks.length === 0) {
    return (
      <Card title="Plano de Cuidados">
        <Text style={styles.muted}>Nenhuma tarefa agendada.</Text>
      </Card>
    );
  }

  return (
    <Card title="Plano de Cuidados">
      {tasks.map((task) => {
        const status = getTaskStatusDisplay(task);
        return (
          <View key={task.id} style={styles.row} testID={`care-plan-task-${task.id}`}>
            <Checkbox
              status={task.status === "concluida" ? "checked" : "unchecked"}
              disabled={task.status === "concluida"}
              onPress={() => completeTask(MOCK_CURRENT_USER_ID, patientId, task.id)}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.description}>{task.descricao}</Text>
              <Text style={styles.muted}>{new Date(task.horarioAgendado).toLocaleString("pt-BR")}</Text>
            </View>
            <StatusBadge label={status.label} tone={status.tone} />
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  description: { fontSize: 14, color: colors.textPrimary, fontWeight: "600" },
  muted: { fontSize: 13, color: colors.textSecondary },
});
