import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing } from "../constants/theme";
import { useCarePlanStore } from "../store/carePlanStore";
import { useIndicatorStore } from "../store/indicatorStore";
import { useNotesStore } from "../store/notesStore";
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

const TONE_COLOR: Record<TimelineTone, string> = {
  ok: colors.statusOk,
  warning: colors.statusWarning,
  danger: colors.statusDanger,
  neutral: colors.textSecondary,
};

const EMPTY_NOTES: ClinicalNote[] = [];
const EMPTY_ASSESSMENTS: IndicatorAssessment[] = [];
const EMPTY_TASKS: CarePlanTask[] = [];

/** Timeline de últimas ações/notas do paciente (redesign v2), com ícones e cores por categoria. */
export function Timeline({ patientId }: TimelineProps) {
  const notes = useNotesStore((s) => s.notesByPatient[patientId] ?? EMPTY_NOTES);
  const assessments = useIndicatorStore((s) => s.assessmentsByPatient[patientId] ?? EMPTY_ASSESSMENTS);
  const tasks = useCarePlanStore((s) => s.tasksByPatient[patientId] ?? EMPTY_TASKS);

  const entries = buildPatientTimeline(notes, assessments, tasks);

  return (
    <View style={styles.card} testID="patient-timeline">
      <Text style={styles.title}>Linha do tempo</Text>
      {entries.length === 0 ? (
        <Text style={styles.empty}>Nenhuma atividade registrada ainda.</Text>
      ) : (
        entries.slice(0, 15).map((entry) => (
          <View key={entry.id} style={styles.row}>
            <MaterialCommunityIcons name={CATEGORY_ICON[entry.category]} size={20} color={TONE_COLOR[entry.tone]} />
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginBottom: spacing.sm },
  empty: { fontSize: 14, color: colors.textSecondary },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 },
  rowText: { flex: 1 },
  entryTitle: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  entryDate: { fontSize: 12, color: colors.textSecondary },
});
