import "../src/global.css";
import { useEffect } from "react";
import { PaperProvider } from "react-native-paper";
import { Stack } from "expo-router";
import { useCarePlanStore } from "../src/store/carePlanStore";
import { usePatientStore } from "../src/store/patientStore";
import { generateMockCarePlanTasks } from "../src/utils/mockData";
import { colors } from "../src/constants/theme";

export default function RootLayout() {
  useEffect(() => {
    usePatientStore.getState().hydrateMock();
    const patients = usePatientStore.getState().patients;
    patients.forEach((p) => {
      useCarePlanStore.getState().seedTasks(p.id, generateMockCarePlanTasks(p.id));
    });
  }, []);

  return (
    <PaperProvider theme={{ colors: { primary: colors.primary } }}>
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.primary }, headerTintColor: "#fff" }}>
        <Stack.Screen name="index" options={{ title: "Home Care — Dashboard" }} />
        <Stack.Screen name="patient/[id]" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
