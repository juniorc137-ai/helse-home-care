import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { IndicatorsSummary } from "../../../../src/components/IndicatorsSummary";
import { PatientSectionNav } from "../../../../src/components/PatientSectionNav";
import type { ThemeTokens } from "../../../../src/theme/tokens";
import { useThemedStyles } from "../../../../src/theme/useThemedStyles";

export default function IndicatorsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <PatientSectionNav patientId={id} />
      <ScrollView contentContainerStyle={styles.content}>
        <IndicatorsSummary patientId={id} />
      </ScrollView>
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.surface },
    content: { padding: 16 },
  });
}
