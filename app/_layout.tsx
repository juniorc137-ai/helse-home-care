import "../src/global.css";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { Stack } from "expo-router";
import { useCarePlanStore } from "../src/store/carePlanStore";
import { usePatientStore } from "../src/store/patientStore";
import { generateMockCarePlanTasks } from "../src/utils/mockData";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";
import { ThemeToggleButton } from "../src/components/ThemeToggleButton";

function RootLayoutNav() {
  const { mode, tokens } = useTheme();

  useEffect(() => {
    usePatientStore.getState().hydrateMock();
    const patients = usePatientStore.getState().patients;
    patients.forEach((p) => {
      useCarePlanStore.getState().seedTasks(p.id, generateMockCarePlanTasks(p.id));
    });
  }, []);

  const paperTheme = {
    ...(mode === "dark" ? MD3DarkTheme : MD3LightTheme),
    colors: { ...(mode === "dark" ? MD3DarkTheme.colors : MD3LightTheme.colors), primary: tokens.primary },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: tokens.primary },
          headerTintColor: "#fff",
          headerRight: () => <ThemeToggleButton color="#fff" />,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard-a" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard-b" options={{ headerShown: false }} />
        <Stack.Screen name="patient/new" options={{ title: "Novo Paciente" }} />
        <Stack.Screen name="patient/[id]" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
