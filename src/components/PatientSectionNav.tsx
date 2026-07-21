import { Link, usePathname } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { minTouchTarget } from "../constants/theme";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";

interface PatientSectionNavProps {
  patientId: string;
}

const SECTIONS = [
  { href: "", label: "Perfil" },
  { href: "/care-plan", label: "Plano de Cuidados" },
  { href: "/indicators", label: "Indicadores" },
  { href: "/notes", label: "Anotações" },
] as const;

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { backgroundColor: tokens.bg, borderBottomWidth: 1, borderBottomColor: tokens.border },
    content: { paddingHorizontal: 8, gap: 4 },
    tab: {
      minHeight: minTouchTarget.android,
      textAlignVertical: "center",
      paddingHorizontal: 16,
      fontSize: 14,
      fontWeight: "600",
      color: tokens.inkSecondary,
    },
    tabActive: {
      color: tokens.primary,
      borderBottomWidth: 2,
      borderBottomColor: tokens.primary,
    },
  });
}

/** Navegação entre Perfil / Plano de Cuidados / Indicadores / Anotações (seção 2.2-2.5). */
export function PatientSectionNav({ patientId }: PatientSectionNavProps) {
  const pathname = usePathname();
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
      {SECTIONS.map((section) => {
        const href = `/patient/${patientId}${section.href}`;
        const isActive = pathname === href || (section.href === "" && pathname === `/patient/${patientId}`);
        return (
          <Link key={section.href} href={href as never} asChild>
            <Text
              style={StyleSheet.flatten([styles.tab, isActive && styles.tabActive])}
              accessibilityRole="link"
            >
              {section.label}
            </Text>
          </Link>
        );
      })}
    </ScrollView>
  );
}
