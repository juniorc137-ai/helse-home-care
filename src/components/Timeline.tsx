import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { radii, shadows, spacing } from "../constants/theme";
import { useCarePlanStore } from "../store/carePlanStore";
import { useIndicatorStore } from "../store/indicatorStore";
import { useNotesStore } from "../store/notesStore";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";
import type { CarePlanTask, ClinicalNote, IndicatorAssessment } from "../types/entities";
import { buildPatientTimeline, type TimelineCategory, type TimelineTone } from "../utils/timeline";

interface TimelineProps {
  patientId: string;
}

const CATEGORY_ICON: Record<TimelineCategory, keyof typeof MaterialCommunityIcons.glyphMap> = {
  nota: "file-document-outline",
  avaliacao: "clipboard-pulse-outline",
  tarefa: "check-circle-outline",
};

function toneColor(tokens: ThemeTokens): Record<TimelineTone, string> {
  return {
    ok: tokens.statusOk,
    warning: tokens.statusWarning,
    danger: tokens.statusDanger,
    neutral: tokens.inkSecondary,
  };
}

const EMPTY_NOTES: ClinicalNote[] = [];
const EMPTY_ASSESSMENTS: IndicatorAssessment[] = [];
const EMPTY_TASKS: CarePlanTask[] = [];

/** Timeline de últimas ações/notas do paciente (redesign v2), com ícones e cores por categoria. */
export function Timeline({ patientId }: TimelineProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
  const notes = useNotesStore((s) => s.notesByPatient[patientId] ?? EMPTY_NOTES);
  const assessments = useIndicatorStore((s) => s.assessmentsByPatient[patientId] ?? EMPTY_ASSESSMENTS);
  const tasks = useCarePlanStore((s) => s.tasksByPatient[patientId] ?? EMPTY_TASKS);

  const entries = buildPatientTimeline(notes, assessments, tasks);
  const toneColorMap = toneColor(tokens);

  return (
    <View style={styles.card} testID="patient-timeline">
      <Text style={styles.title}>Linha do tempo</Text>
      {entries.length === 0 ? (
        <Text style={styles.empty}>Nenhuma atividade registrada ainda.</Text>
      ) : (
        entries.slice(0, 15).map((entry) => (
          <View key={entry.id} style={styles.row}>
            <MaterialCommunityIcons name={CATEGORY_ICON[entry.category]} size={20} color={toneColorMap[entry.tone]} />
            <View style={styles.rowText}>
              <Text style={styles.entryTitle}>{entry.title}</Text>
              <Text style={styles.entryDate}>{new Date(entry.timestamp).toLocaleString("pt-BR")}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
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
    row: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 },
    rowText: { flex: 1 },
    entryTitle: { fontSize: 14, fontWeight: "600", color: tokens.ink },
    entryDate: { fontSize: 12, color: tokens.inkSecondary },
  });
}
