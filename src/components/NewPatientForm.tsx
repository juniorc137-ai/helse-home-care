import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Checkbox, HelperText, RadioButton, TextInput } from "react-native-paper";
import { MOCK_CURRENT_USER_ID } from "../constants/mockSession";
import { usePatientStore } from "../store/patientStore";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";
import { newPatientFormSchema, type NewPatientFormValues } from "../types/zodSchemas";
import { formatCPF } from "../utils/cpf";
import { parseCommaSeparatedList } from "../utils/textList";

interface NewPatientFormProps {
  onCreated?: (patientId: string) => void;
}

const DEFAULT_VALUES: NewPatientFormValues = {
  name: "",
  cpf: "",
  birthDate: "",
  sex: "feminino",
  mainDiagnosis: "",
  comorbidities: "",
  allergies: "",
  activeMedications: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  caregiverName: "",
  caregiverRelationship: "",
  caregiverAvailability: "",
  consentGiven: false,
};

/** Formulário "Novo Paciente" (seção 2.1/2.2, ADR-005 revisado): validação via Zod, criação na store de pacientes. */
export function NewPatientForm({ onCreated }: NewPatientFormProps) {
  const styles = useThemedStyles(createStyles);
  const addPatient = usePatientStore((s) => s.addPatient);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPatientFormValues>({
    resolver: zodResolver(newPatientFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  function onSubmit(values: NewPatientFormValues) {
    const created = addPatient(MOCK_CURRENT_USER_ID, {
      name: values.name,
      cpf: values.cpf,
      birthDate: values.birthDate,
      sex: values.sex,
      mainDiagnosis: values.mainDiagnosis,
      comorbidities: parseCommaSeparatedList(values.comorbidities),
      allergies: parseCommaSeparatedList(values.allergies),
      activeMedications: parseCommaSeparatedList(values.activeMedications),
      primaryEmergencyContact: {
        name: values.emergencyContactName,
        relationship: values.emergencyContactRelationship,
        phone: values.emergencyContactPhone,
      },
      responsibleCaregiver: {
        name: values.caregiverName,
        relationship: values.caregiverRelationship,
        availability: values.caregiverAvailability,
      },
      consentGiven: values.consentGiven,
    });
    onCreated?.(created.id);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <View>
            <TextInput mode="outlined" label="Nome" value={field.value} onChangeText={field.onChange} testID="new-patient-name" />
            {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="cpf"
        render={({ field }) => (
          <View>
            <TextInput
              mode="outlined"
              label="CPF"
              value={field.value}
              onChangeText={(text) => field.onChange(formatCPF(text))}
              keyboardType="numeric"
              testID="new-patient-cpf"
            />
            {errors.cpf && <HelperText type="error">{errors.cpf.message}</HelperText>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="birthDate"
        render={({ field }) => (
          <View>
            <TextInput
              mode="outlined"
              label="Data de nascimento (AAAA-MM-DD)"
              placeholder="1950-01-31"
              value={field.value}
              onChangeText={field.onChange}
              testID="new-patient-birthdate"
            />
            {errors.birthDate && <HelperText type="error">{errors.birthDate.message}</HelperText>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="sex"
        render={({ field }) => (
          <View>
            <Text style={styles.label}>Sexo</Text>
            <RadioButton.Group onValueChange={field.onChange} value={field.value}>
              <RadioButton.Item label="Feminino" value="feminino" testID="new-patient-sex-feminino" />
              <RadioButton.Item label="Masculino" value="masculino" testID="new-patient-sex-masculino" />
              <RadioButton.Item label="Outro" value="outro" testID="new-patient-sex-outro" />
            </RadioButton.Group>
            {errors.sex && <HelperText type="error">{errors.sex.message}</HelperText>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="mainDiagnosis"
        render={({ field }) => (
          <View>
            <TextInput
              mode="outlined"
              label="Diagnóstico principal"
              value={field.value}
              onChangeText={field.onChange}
              testID="new-patient-diagnosis"
            />
            {errors.mainDiagnosis && <HelperText type="error">{errors.mainDiagnosis.message}</HelperText>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="comorbidities"
        render={({ field }) => (
          <TextInput
            mode="outlined"
            label="Comorbidades (separadas por vírgula)"
            value={field.value}
            onChangeText={field.onChange}
            multiline
            testID="new-patient-comorbidities"
          />
        )}
      />

      <Controller
        control={control}
        name="allergies"
        render={({ field }) => (
          <TextInput
            mode="outlined"
            label="Alergias (separadas por vírgula)"
            value={field.value}
            onChangeText={field.onChange}
            multiline
            testID="new-patient-allergies"
          />
        )}
      />

      <Controller
        control={control}
        name="activeMedications"
        render={({ field }) => (
          <TextInput
            mode="outlined"
            label="Medicações ativas (separadas por vírgula)"
            value={field.value}
            onChangeText={field.onChange}
            multiline
            testID="new-patient-medications"
          />
        )}
      />

      <Text style={styles.sectionTitle}>Contato de emergência</Text>
      <Controller
        control={control}
        name="emergencyContactName"
        render={({ field }) => (
          <View>
            <TextInput mode="outlined" label="Nome" value={field.value} onChangeText={field.onChange} testID="new-patient-emergency-name" />
            {errors.emergencyContactName && <HelperText type="error">{errors.emergencyContactName.message}</HelperText>}
          </View>
        )}
      />
      <Controller
        control={control}
        name="emergencyContactRelationship"
        render={({ field }) => (
          <View>
            <TextInput mode="outlined" label="Relação com o paciente" value={field.value} onChangeText={field.onChange} testID="new-patient-emergency-relationship" />
            {errors.emergencyContactRelationship && <HelperText type="error">{errors.emergencyContactRelationship.message}</HelperText>}
          </View>
        )}
      />
      <Controller
        control={control}
        name="emergencyContactPhone"
        render={({ field }) => (
          <View>
            <TextInput
              mode="outlined"
              label="Telefone"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="phone-pad"
              testID="new-patient-emergency-phone"
            />
            {errors.emergencyContactPhone && <HelperText type="error">{errors.emergencyContactPhone.message}</HelperText>}
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Cuidador responsável</Text>
      <Controller
        control={control}
        name="caregiverName"
        render={({ field }) => (
          <View>
            <TextInput mode="outlined" label="Nome" value={field.value} onChangeText={field.onChange} testID="new-patient-caregiver-name" />
            {errors.caregiverName && <HelperText type="error">{errors.caregiverName.message}</HelperText>}
          </View>
        )}
      />
      <Controller
        control={control}
        name="caregiverRelationship"
        render={({ field }) => (
          <View>
            <TextInput mode="outlined" label="Relação com o paciente" value={field.value} onChangeText={field.onChange} testID="new-patient-caregiver-relationship" />
            {errors.caregiverRelationship && <HelperText type="error">{errors.caregiverRelationship.message}</HelperText>}
          </View>
        )}
      />
      <Controller
        control={control}
        name="caregiverAvailability"
        render={({ field }) => (
          <View>
            <TextInput mode="outlined" label="Disponibilidade" value={field.value} onChangeText={field.onChange} testID="new-patient-caregiver-availability" />
            {errors.caregiverAvailability && <HelperText type="error">{errors.caregiverAvailability.message}</HelperText>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="consentGiven"
        render={({ field }) => (
          <Checkbox.Item
            label="Consentimento LGPD dado pelo paciente/responsável"
            status={field.value ? "checked" : "unchecked"}
            onPress={() => field.onChange(!field.value)}
            testID="new-patient-consent"
          />
        )}
      />

      <Button mode="contained" onPress={handleSubmit(onSubmit)} testID="new-patient-submit">
        Cadastrar paciente
      </Button>
    </ScrollView>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { gap: 12, paddingBottom: 32 },
    label: { fontSize: 14, fontWeight: "700", color: tokens.ink, marginTop: 8 },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: tokens.ink, marginTop: 16 },
  });
}
