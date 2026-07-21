import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { HealthCard } from "../../../src/components/HealthCard";
import { PatientBadgesSection } from "../../../src/components/PatientBadgesSection";
import { PatientProfileView } from "../../../src/components/PatientProfileView";
import { PatientSectionNav } from "../../../src/components/PatientSectionNav";
import { RemovePatientDialog } from "../../../src/components/RemovePatientDialog";
import { Timeline } from "../../../src/components/Timeline";
import { useToast } from "../../../src/components/Toast";
import { spacing } from "../../../src/constants/theme";
import { MOCK_ADMIN_USER_ID, MOCK_ADMIN_USER_ROLE } from "../../../src/constants/mockSession";
import { usePatientStore } from "../../../src/store/patientStore";
import { PermissionDeniedError } from "../../../src/services/permissionGuard";
import { useTheme } from "../../../src/theme/ThemeContext";
import type { ThemeTokens } from "../../../src/theme/tokens";
import { useThemedStyles } from "../../../src/theme/useThemedStyles";

/** Perfil do Paciente (seção 2.2, redesign v2): health card + timeline + badges + dados read-only. */
export default function PatientProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
  const patient = usePatientStore((s) => s.getById(id));
  const removePatient = usePatientStore((s) => s.removePatient);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [toast, toastElement] = useToast();

  if (!patient) {
    return (
      <View style={styles.container}>
        <Text>Paciente não encontrado.</Text>
      </View>
    );
  }

  function handleConfirmRemove() {
    try {
      removePatient(MOCK_ADMIN_USER_ID, MOCK_ADMIN_USER_ROLE, id);
      setDialogVisible(false);
      router.replace("/");
    } catch (error) {
      setDialogVisible(false);
      toast.show(error instanceof PermissionDeniedError ? "Você não tem permissão para remover pacientes." : "Não foi possível remover o paciente.");
    }
  }

  return (
    <View style={styles.container}>
      <PatientSectionNav patientId={id} />
      <ScrollView contentContainerStyle={styles.content}>
        <HealthCard patientId={id} />
        <PatientBadgesSection patientId={id} />
        <Timeline patientId={id} />
        <PatientProfileView patient={patient} />
        <Button
          mode="outlined"
          textColor={tokens.statusDanger}
          onPress={() => setDialogVisible(true)}
          testID="remove-patient-button"
        >
          Remover paciente
        </Button>
      </ScrollView>
      <RemovePatientDialog
        visible={dialogVisible}
        patientName={patient.name}
        onDismiss={() => setDialogVisible(false)}
        onConfirm={handleConfirmRemove}
      />
      {toastElement}
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.surface },
    content: { padding: spacing.md, gap: spacing.md },
  });
}
