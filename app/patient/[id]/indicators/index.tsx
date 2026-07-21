import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { IndicatorsSummary } from "../../../../src/components/IndicatorsSummary";
import { PatientSectionNav } from "../../../../src/components/PatientSectionNav";
import { colors } from "../../../../src/constants/theme";

export default function IndicatorsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <PatientSectionNav patientId={id} />
      <ScrollView contentContainerStyle={styles.content}>
        <IndicatorsSummary patientId={id} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: 16 },
});
