import { useMemo } from "react";
import type { ThemeTokens } from "./tokens";
import { useTheme } from "./ThemeContext";

/** Memoiza um StyleSheet dependente dos tokens de tema atuais (recalcula só quando o modo muda). */
export function useThemedStyles<T>(factory: (tokens: ThemeTokens) => T): T {
  const { tokens } = useTheme();
  return useMemo(() => factory(tokens), [tokens]);
}
