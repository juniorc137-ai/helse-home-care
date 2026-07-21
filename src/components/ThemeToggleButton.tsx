import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface ThemeToggleButtonProps {
  color?: string;
  size?: number;
}

/** Botão de alternância de modo escuro (redesign v3, item 7) — reutilizado no header padrão e nas variantes do dashboard. */
export function ThemeToggleButton({ color, size = 22 }: ThemeToggleButtonProps) {
  const { mode, tokens, toggle } = useTheme();
  return (
    <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel="Alternar modo escuro" testID="theme-toggle-button" hitSlop={8}>
      <MaterialCommunityIcons name={mode === "dark" ? "weather-sunny" : "weather-night"} size={size} color={color ?? tokens.ink} />
    </Pressable>
  );
}
