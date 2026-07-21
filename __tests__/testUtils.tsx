import { render as rntlRender, type RenderOptions } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { PaperProvider } from "react-native-paper";
import { ThemeProvider } from "../src/theme/ThemeContext";

/**
 * Render com ThemeProvider + PaperProvider (necessário para qualquer
 * componente que use useTheme()/useThemedStyles() ou Portal/Dialog do
 * react-native-paper). Substitui o `render` padrão da RNTL nos testes de
 * componentes do redesign v3 (modo escuro).
 */
export function render(ui: ReactElement, options?: RenderOptions) {
  return rntlRender(
    <PaperProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </PaperProvider>,
    options,
  );
}

export { fireEvent, screen, waitFor, within, act } from "@testing-library/react-native";
