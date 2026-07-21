import type { ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useThemedStyles } from "../theme/useThemedStyles";
import type { ThemeTokens } from "../theme/tokens";

interface CardProps {
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    card: {
      backgroundColor: tokens.surfaceRaised,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: tokens.border,
      padding: 16,
      gap: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: "700",
      color: tokens.ink,
      marginBottom: 4,
    },
  });
}

/** Container padrão de seção (perfil, care plan, indicadores) — seções 2.2-2.4. */
export function Card({ title, children, style }: CardProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}
