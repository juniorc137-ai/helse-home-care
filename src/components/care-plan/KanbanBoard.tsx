import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useCarePlanStore } from "../../store/carePlanStore";
import { useResponsive } from "../../hooks/useResponsive";
import type { ThemeTokens } from "../../theme/tokens";
import { useThemedStyles } from "../../theme/useThemedStyles";
import type { CarePlanTask } from "../../types/entities";
import { bucketTasksForKanban, KANBAN_COLUMNS } from "../../utils/kanbanBuckets";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  patientId: string;
}

// Referência estável: evita recriar `[]` dentro do seletor do Zustand, o
// que quebraria o useSyncExternalStore (loop infinito de render).
const EMPTY_TASKS: CarePlanTask[] = [];

/** Kanban do Care Plan (seção 2.3, redesign v2): Pendente | Hoje | Completo. */
export function KanbanBoard({ patientId }: KanbanBoardProps) {
  const { isDesktop } = useResponsive();
  const styles = useThemedStyles(createStyles);
  const tasks = useCarePlanStore((s) => s.tasksByPatient[patientId] ?? EMPTY_TASKS);
  const buckets = bucketTasksForKanban(tasks);

  if (tasks.filter((t) => !t.deletedAt).length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Nenhuma tarefa agendada para este paciente.</Text>
      </View>
    );
  }

  const columns = KANBAN_COLUMNS.map(({ key, title }) => (
    <KanbanColumn key={key} title={title} tasks={buckets[key]} patientId={patientId} allowSwipeToComplete={key !== "completo"} />
  ));

  if (isDesktop) {
    return <View style={styles.desktopRow}>{columns}</View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.mobileStack} showsVerticalScrollIndicator={false}>
      {columns}
    </ScrollView>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    desktopRow: { flexDirection: "row", gap: 20, alignItems: "flex-start" },
    mobileStack: { gap: 24, paddingBottom: 32 },
    emptyState: { padding: 24, alignItems: "center" },
    emptyText: { color: tokens.inkSecondary, fontSize: 14 },
  });
}
