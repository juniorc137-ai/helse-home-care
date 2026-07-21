import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { NewPatientForm } from "../../src/components/NewPatientForm";
import { useToast } from "../../src/components/Toast";
import type { ThemeTokens } from "../../src/theme/tokens";
import { useThemedStyles } from "../../src/theme/useThemedStyles";

export default function NewPatientScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
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

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.surface },
    content: { flex: 1, padding: 16 },
  });
}
