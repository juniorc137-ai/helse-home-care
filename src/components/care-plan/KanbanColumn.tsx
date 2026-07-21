import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../constants/theme";
import { MOCK_CURRENT_USER_ID } from "../../constants/mockSession";
import { useCarePlanStore } from "../../store/carePlanStore";
import type { CarePlanTask } from "../../types/entities";
import { computeReorderedIds } from "../../utils/kanbanGestures";
import { TaskKanbanCard } from "./TaskKanbanCard";

interface KanbanColumnProps {
  title: string;
  tasks: CarePlanTask[]; // já ordenadas por priorityOrder
  patientId: string;
  allowSwipeToComplete: boolean;
}

/** Coluna do Kanban (Pendente | Hoje | Completo). Arrastar reordena prioridade só dentro da coluna. */
export function KanbanColumn({ title, tasks, patientId, allowSwipeToComplete }: KanbanColumnProps) {
  const completeTask = useCarePlanStore((s) => s.completeTask);
  const reorderTasks = useCarePlanStore((s) => s.reorderTasks);

  function handleDragEnd(taskId: string, deltaRows: number) {
    const currentIndex = tasks.findIndex((t) => t.id === taskId);
    if (currentIndex === -1) return;
    const currentIds = tasks.map((t) => t.id);
    const reordered = computeReorderedIds(currentIds, currentIndex, deltaRows);
    if (reordered !== currentIds) {
      reorderTasks(patientId, reordered);
    }
  }

  return (
    <View style={styles.column} testID={`kanban-column-${title}`}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{tasks.length}</Text>
        </View>
      </View>
      {tasks.length === 0 ? (
        <Text style={styles.empty}>Nenhuma tarefa</Text>
      ) : (
        tasks.map((task) => (
          <TaskKanbanCard
            key={task.id}
            task={task}
            allowSwipeToComplete={allowSwipeToComplete}
            allowDragReorder={tasks.length > 1}
            onComplete={() => completeTask(MOCK_CURRENT_USER_ID, patientId, task.id)}
            onDragEnd={(deltaRows) => handleDragEnd(task.id, deltaRows)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, minWidth: 260, gap: spacing.xs },
  header: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.xs },
  title: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  empty: { fontSize: 13, color: colors.textMuted, fontStyle: "italic" },
});
