import { StyleSheet, Text, View } from "react-native";
import { radii, shadows, spacing } from "../../constants/theme";
import { useTheme } from "../../theme/ThemeContext";
import type { ThemeTokens } from "../../theme/tokens";
import { useThemedStyles } from "../../theme/useThemedStyles";
import type { ClinicalNote } from "../../types/entities";
import { extractSoapSections, type SoapSection } from "../../utils/soapNote";

interface RecentNotesTimelineProps {
  notes: ClinicalNote[];
}

const SECTION_COLOR: Record<SoapSection, "primary" | "ok" | "warning" | "danger"> = {
  S: "primary",
  O: "ok",
  A: "warning",
  P: "danger",
};

/** Zona inferior do dashboard profissional: últimas 5 notas em timeline compacta (ícone S/O/A/P, autor, horário). */
export function RecentNotesTimeline({ notes }: RecentNotesTimelineProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
  const toneColor: Record<"primary" | "ok" | "warning" | "danger", string> = {
    primary: tokens.primary,
    ok: tokens.statusOk,
    warning: tokens.statusWarning,
    danger: tokens.statusDanger,
  };

  const recent = [...notes].sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()).slice(0, 5);

  return (
    <View style={styles.card} testID="recent-notes-timeline">
      <Text style={styles.title}>Últimas notas clínicas</Text>
      {recent.length === 0 ? (
        <Text style={styles.empty}>Nenhuma nota registrada ainda.</Text>
      ) : (
        recent.map((note) => {
          const sections = extractSoapSections(note.conteudoTexto);
          return (
            <View key={note.id} style={styles.row} testID={`recent-note-${note.id}`}>
              <View style={styles.sectionBadges}>
                {(sections.length > 0 ? sections : (["S"] as SoapSection[])).map((section) => (
                  <View key={section} style={[styles.sectionBadge, { backgroundColor: toneColor[SECTION_COLOR[section]] }]}>
                    <Text style={styles.sectionBadgeText}>{section}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.info}>
                <Text style={styles.author}>{note.profissionalId}</Text>
                <Text style={styles.date}>{new Date(note.dataHora).toLocaleString("pt-BR")}</Text>
              </View>
              <Text style={styles.status}>{note.status === "finalizada" ? "Finalizada" : "Rascunho"}</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    card: { backgroundColor: tokens.surfaceRaised, borderRadius: radii.lg, padding: spacing.md, ...shadows.sm },
    title: { fontSize: 15, fontWeight: "700", color: tokens.ink, marginBottom: spacing.sm },
    empty: { fontSize: 13, color: tokens.inkSecondary },
    row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: 6 },
    sectionBadges: { flexDirection: "row", gap: 3 },
    sectionBadge: { width: 20, height: 20, borderRadius: 4, alignItems: "center", justifyContent: "center" },
    sectionBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
    info: { flex: 1 },
    author: { fontSize: 13, fontWeight: "600", color: tokens.ink },
    date: { fontSize: 11, color: tokens.inkSecondary },
    status: { fontSize: 11, color: tokens.inkMuted },
  });
}
