import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { BradenForm } from "../../../../src/components/BradenForm";
import { useToast } from "../../../../src/components/Toast";
import type { ThemeTokens } from "../../../../src/theme/tokens";
import { useThemedStyles } from "../../../../src/theme/useThemedStyles";

export default function BradenScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const [toast, toastElement] = useToast();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <BradenForm
          patientId={id}
          onSubmitted={() => {
            toast.show("Avaliação de Braden registrada.");
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
