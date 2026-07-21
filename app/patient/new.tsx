import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { NewPatientForm } from "../../src/components/NewPatientForm";
import { useToast } from "../../src/components/Toast";
import { colors } from "../../src/constants/theme";

export default function NewPatientScreen() {
  const router = useRouter();
  const [toast, toastElement] = useToast();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <NewPatientForm
          onCreated={() => {
            toast.show("Paciente cadastrado com sucesso.");
            router.back();
          }}
        />
      </View>
      {toastElement}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: 16 },
});
