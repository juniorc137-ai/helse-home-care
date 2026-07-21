import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { TecForm } from "../../../../src/components/TecForm";
import { useToast } from "../../../../src/components/Toast";
import { colors } from "../../../../src/constants/theme";

export default function TecScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16 },
});
