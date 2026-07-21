import { Stack, useLocalSearchParams } from "expo-router";
import { usePatientStore } from "../../../src/store/patientStore";
import { useTheme } from "../../../src/theme/ThemeContext";

export default function PatientLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const patient = usePatientStore((s) => s.getById(id));
  const { tokens } = useTheme();

  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: tokens.primary }, headerTintColor: "#fff" }}>
      <Stack.Screen name="index" options={{ title: patient?.name ?? "Paciente" }} />
      <Stack.Screen name="care-plan" options={{ title: "Plano de Cuidados" }} />
      <Stack.Screen name="indicators/index" options={{ title: "Indicadores" }} />
      <Stack.Screen name="indicators/braden" options={{ title: "Escala de Braden" }} />
      <Stack.Screen name="indicators/tec" options={{ title: "Tempo de Enchimento Capilar" }} />
      <Stack.Screen name="indicators/morse" options={{ title: "Escala de Morse" }} />
      <Stack.Screen name="notes" options={{ title: "Anotações" }} />
    </Stack>
  );
}
