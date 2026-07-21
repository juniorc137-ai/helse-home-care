import { Link, usePathname } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { colors, minTouchTarget } from "../constants/theme";

interface PatientSectionNavProps {
  patientId: string;
}

const SECTIONS = [
  { href: "", label: "Perfil" },
  { href: "/care-plan", label: "Plano de Cuidados" },
  { href: "/indicators", label: "Indicadores" },
] as const;

/** Navegação entre Perfil / Plano de Cuidados / Indicadores (seção 2.2-2.4). */
export function PatientSectionNav({ patientId }: PatientSectionNavProps) {
  const pathname = usePathname();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
      {SECTIONS.map((section) => {
        const href = `/patient/${patientId}${section.href}`;
        const isActive = pathname === href || (section.href === "" && pathname === `/patient/${patientId}`);
        return (
          <Link key={section.href} href={href as never} asChild>
            <Text style={[styles.tab, isActive && styles.tabActive]} accessibilityRole="link">
              {section.label}
            </Text>
          </Link>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  content: { paddingHorizontal: 8, gap: 4 },
  tab: {
    minHeight: minTouchTarget.android,
    textAlignVertical: "center",
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  tabActive: {
    color: colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
});
