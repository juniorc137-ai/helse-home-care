import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Text, TouchableOpacity } from "react-native";
import { ThemeProvider, useTheme } from "../../src/theme/ThemeContext";

function Probe() {
  const { mode, tokens, toggle } = useTheme();
  return (
    <TouchableOpacity onPress={toggle} testID="toggle">
      <Text testID="mode">{mode}</Text>
      <Text testID="bg">{tokens.bg}</Text>
    </TouchableOpacity>
  );
}

describe("ThemeContext (modo escuro, redesign v3)", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("inicia em modo claro por padrão", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("mode").props.children).toBe("light");
  });

  it("alterna para escuro e muda os tokens", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    fireEvent.press(screen.getByTestId("toggle"));
    expect(screen.getByTestId("mode").props.children).toBe("dark");
    expect(screen.getByTestId("bg").props.children).not.toBe("#FFFFFF");
  });

  it("persiste a escolha em AsyncStorage", async () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    fireEvent.press(screen.getByTestId("toggle"));
    await waitFor(async () => {
      expect(await AsyncStorage.getItem("home-care-theme-mode")).toBe("dark");
    });
  });

  it("useTheme lança erro fora do ThemeProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow("useTheme deve ser usado dentro de um ThemeProvider");
    consoleError.mockRestore();
  });
});
