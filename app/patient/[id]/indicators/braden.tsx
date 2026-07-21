import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { BradenForm } from "../../../../src/components/BradenForm";
import { useToast } from "../../../../src/components/Toast";
import { colors } from "../../../../src/constants/theme";

export default function BradenScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: 16 },
});
