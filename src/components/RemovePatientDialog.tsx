import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Button, Dialog, Portal, TextInput } from "react-native-paper";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";

const CONFIRMATION_WORD = "REMOVER";

interface RemovePatientDialogProps {
  visible: boolean;
  patientName: string;
  onDismiss: () => void;
  onConfirm: () => void;
}

/** Confirmação dupla para remoção de paciente (seção "Remover paciente"): exige digitar REMOVER. */
export function RemovePatientDialog({ visible, patientName, onDismiss, onConfirm }: RemovePatientDialogProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [confirmationText, setConfirmationText] = useState("");
  const canConfirm = confirmationText.trim().toUpperCase() === CONFIRMATION_WORD;

  function handleDismiss() {
    setConfirmationText("");
    onDismiss();
  }

  function handleConfirm() {
    if (!canConfirm) return;
    setConfirmationText("");
    onConfirm();
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss} testID="remove-patient-dialog">
        <Dialog.Title>Remover paciente</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.warning}>
            Isto removerá {patientName} da lista de pacientes ativos (soft delete auditado). Esta ação não pode ser
            desfeita pela interface.
          </Text>
          <Text style={styles.instruction}>
            Digite <Text style={styles.confirmationWord}>{CONFIRMATION_WORD}</Text> para confirmar:
          </Text>
          <TextInput
            mode="outlined"
            value={confirmationText}
            onChangeText={setConfirmationText}
            autoCapitalize="characters"
            testID="remove-patient-confirmation-input"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss} testID="remove-patient-cancel">
            Cancelar
          </Button>
          <Button textColor={tokens.statusDanger} disabled={!canConfirm} onPress={handleConfirm} testID="remove-patient-confirm">
            Remover
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    warning: { fontSize: 14, color: tokens.inkSecondary, marginBottom: 12 },
    instruction: { fontSize: 14, color: tokens.ink, marginBottom: 8 },
    confirmationWord: { fontWeight: "700" },
  });
}
