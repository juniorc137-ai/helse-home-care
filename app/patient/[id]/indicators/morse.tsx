import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { MorseForm } from "../../../../src/components/MorseForm";
import { useToast } from "../../../../src/components/Toast";
import type { ThemeTokens } from "../../../../src/theme/tokens";
import { useThemedStyles } from "../../../../src/theme/useThemedStyles";

export default function MorseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const [toast, toastElement] = useToast();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MorseForm
          patientId={id}
          onSubmitted={() => {
            toast.show("Avaliação de Morse registrada.");
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
