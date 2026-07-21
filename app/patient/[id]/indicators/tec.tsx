import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { TecForm } from "../../../../src/components/TecForm";
import { useToast } from "../../../../src/components/Toast";
import type { ThemeTokens } from "../../../../src/theme/tokens";
import { useThemedStyles } from "../../../../src/theme/useThemedStyles";

export default function TecScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const [toast, toastElement] = useToast();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TecForm
        patientId={id}
        onSubmitted={() => {
          toast.show("Avaliação de TEC registrada.");
          router.back();
        }}
      />
      {toastElement}
    </ScrollView>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.surface },
    content: { padding: 16 },
  });
}
