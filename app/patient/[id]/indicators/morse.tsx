import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { MorseForm } from "../../../../src/components/MorseForm";
import { useToast } from "../../../../src/components/Toast";
import { colors } from "../../../../src/constants/theme";

export default function MorseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: 16 },
});
