import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { ConfettiBurst } from "../ConfettiBurst";
import { StatusBadge } from "../StatusBadge";
import { radii, shadows } from "../../constants/theme";
import { useTheme } from "../../theme/ThemeContext";
import type { ThemeTokens } from "../../theme/tokens";
import { useThemedStyles } from "../../theme/useThemedStyles";
import type { CarePlanTask } from "../../types/entities";
import { pixelsToRowDelta, shouldCompleteFromSwipe, SWIPE_COMPLETE_THRESHOLD_PX } from "../../utils/kanbanGestures";
import { getTaskStatusDisplay } from "../../utils/taskStatusTone";

export const KANBAN_ROW_HEIGHT = 92;

interface TaskKanbanCardProps {
  task: CarePlanTask;
  allowSwipeToComplete: boolean;
  allowDragReorder: boolean;
  onComplete: () => void;
  /** Quantidade de linhas (arredondada) que o card foi arrastado para cima/baixo. */
  onDragEnd: (deltaRows: number) => void;
}

const TYPE_ICON: Record<CarePlanTask["tipo"], keyof typeof MaterialCommunityIcons.glyphMap> = {
  medicacao: "pill",
  curativo: "bandage",
  mobilizacao: "walk",
  monitoramento: "heart-pulse",
  outro: "clipboard-text-outline",
};

/** Card de tarefa do Kanban: swipe horizontal conclui, handle vertical reordena prioridade. */
export function TaskKanbanCard({ task, allowSwipeToComplete, allowDragReorder, onComplete, onDragEnd }: TaskKanbanCardProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const [showConfetti, setShowConfetti] = useState(false);

  function triggerComplete() {
    setShowConfetti(true);
    onComplete();
    setTimeout(() => setShowConfetti(false), 750);
  }

  function commitDrag(deltaRows: number) {
    onDragEnd(deltaRows);
  }

  const swipeGesture = Gesture.Pan()
    .withTestId(`kanban-swipe-gesture-${task.id}`)
    .enabled(allowSwipeToComplete)
    .activeOffsetX([-15, 15])
    .failOffsetY([-20, 20])
    .onUpdate((event) => {
      translateX.value = Math.max(0, event.translationX);
    })
    .onEnd(() => {
      if (shouldCompleteFromSwipe(translateX.value)) {
        translateX.value = withTiming(0, { duration: 220 });
        runOnJS(triggerComplete)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const longPressGesture = Gesture.LongPress()
    .withTestId(`kanban-longpress-gesture-${task.id}`)
    .enabled(allowSwipeToComplete)
    .minDuration(500)
    .onStart(() => {
      runOnJS(triggerComplete)();
    });

  const completeGesture = Gesture.Race(swipeGesture, longPressGesture);

  const dragGesture = Gesture.Pan()
    .withTestId(`kanban-drag-gesture-${task.id}`)
    .enabled(allowDragReorder)
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      const deltaRows = pixelsToRowDelta(translateY.value, KANBAN_ROW_HEIGHT);
      translateY.value = withTiming(0, { duration: 180 });
      isDragging.value = false;
      if (deltaRows !== 0) runOnJS(commitDrag)(deltaRows);
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: isDragging.value ? 1.03 : 1 }],
    zIndex: isDragging.value ? 10 : 0,
    ...(isDragging.value ? shadows.lg : shadows.sm),
  }));

  const revealStyle = useAnimatedStyle(() => ({
    opacity: Math.min(translateX.value / SWIPE_COMPLETE_THRESHOLD_PX, 1),
  }));

  const status = getTaskStatusDisplay(task);

  return (
    <View style={styles.wrapper} testID={`kanban-card-${task.id}`}>
      <Animated.View style={[styles.revealBackground, revealStyle]}>
        <MaterialCommunityIcons name="check-circle" size={28} color={tokens.statusOk} />
        <Text style={styles.revealText}>Concluir</Text>
      </Animated.View>

      <GestureDetector gesture={completeGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <MaterialCommunityIcons name={TYPE_ICON[task.tipo]} size={22} color={tokens.primary} style={styles.icon} />
          <View style={styles.info}>
            <Text style={styles.description} numberOfLines={1}>
              {task.descricao}
            </Text>
            <Text style={styles.time}>
              {new Date(task.horarioAgendado).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
            </Text>
          </View>
          <StatusBadge label={status.label} tone={status.tone} />
          {allowDragReorder && (
            <GestureDetector gesture={dragGesture}>
              <View style={styles.dragHandle} testID={`kanban-drag-handle-${task.id}`}>
                <MaterialCommunityIcons name="drag-vertical" size={22} color={tokens.inkMuted} />
              </View>
            </GestureDetector>
          )}
          <ConfettiBurst visible={showConfetti} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    wrapper: { height: KANBAN_ROW_HEIGHT, justifyContent: "center" },
    revealBackground: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 6,
      bottom: 6,
      borderRadius: radii.md,
      backgroundColor: tokens.statusOkBg,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 16,
      gap: 8,
    },
    revealText: { color: tokens.statusOk, fontWeight: "700" },
    card: {
      backgroundColor: tokens.surfaceRaised,
      borderRadius: radii.md,
      padding: 14,
      marginVertical: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      ...shadows.sm,
    },
    icon: { marginRight: 2 },
    info: { flex: 1, gap: 2 },
    description: { fontSize: 14, fontWeight: "600", color: tokens.ink },
    time: { fontSize: 12, color: tokens.inkSecondary },
    dragHandle: { paddingHorizontal: 4, paddingVertical: 8 },
  });
}
