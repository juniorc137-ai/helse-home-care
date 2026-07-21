import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { Button, HelperText, RadioButton, TextInput } from "react-native-paper";
import { MOCK_CURRENT_USER_ID } from "../../constants/mockSession";
import { radii, shadows, spacing } from "../../constants/theme";
import { useCarePlanStore } from "../../store/carePlanStore";
import type { ThemeTokens } from "../../theme/tokens";
import { useThemedStyles } from "../../theme/useThemedStyles";
import type { CarePlanTaskType } from "../../types/entities";
import { carePlanTaskInputSchema } from "../../types/zodSchemas";
import { z } from "zod";

const TASK_TYPES: Array<{ value: CarePlanTaskType; label: string }> = [
  { value: "medicacao", label: "Medicação" },
  { value: "curativo", label: "Curativo" },
  { value: "mobilizacao", label: "Mobilização" },
  { value: "monitoramento", label: "Monitoramento" },
  { value: "outro", label: "Outro" },
];

const formSchema = carePlanTaskInputSchema
  .omit({ horarioAgendado: true, profissionalResponsavel: true })
  .extend({ horario: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use o formato HH:MM") });

type AddTaskFormValues = z.infer<typeof formSchema>;

const DEFAULT_VALUES: AddTaskFormValues = { descricao: "", tipo: "medicacao", horario: "" };

interface AddTaskFormProps {
  patientId: string;
  onAdded?: () => void;
}

/** Formulário para adicionar tarefa ao Care Plan (seção 2.3): descrição, tipo e horário (hoje). */
export function AddTaskForm({ patientId, onAdded }: AddTaskFormProps) {
  const styles = useThemedStyles(createStyles);
  const [formError, setFormError] = useState<string | null>(null);
  const addTask = useCarePlanStore((s) => s.addTask);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddTaskFormValues>({ resolver: zodResolver(formSchema), defaultValues: DEFAULT_VALUES });

  function onSubmit(values: AddTaskFormValues) {
    setFormError(null);
    const [hours, minutes] = values.horario.split(":").map(Number);
    const scheduled = new Date();
    scheduled.setHours(hours, minutes, 0, 0);

    try {
      addTask(MOCK_CURRENT_USER_ID, patientId, {
        descricao: values.descricao,
        tipo: values.tipo,
        horarioAgendado: scheduled.toISOString(),
        profissionalResponsavel: MOCK_CURRENT_USER_ID,
      });
      reset(DEFAULT_VALUES);
      onAdded?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível adicionar a tarefa.");
    }
  }

  return (
    <View style={styles.card} testID="add-task-form">
      <Text style={styles.title}>Nova tarefa</Text>

      <Controller
        control={control}
        name="descricao"
        render={({ field }) => (
          <View>
            <TextInput mode="outlined" label="Descrição" value={field.value} onChangeText={field.onChange} testID="add-task-description" />
            {errors.descricao && <HelperText type="error">{errors.descricao.message}</HelperText>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="tipo"
        render={({ field }) => (
          <RadioButton.Group onValueChange={field.onChange} value={field.value}>
            {TASK_TYPES.map((t) => (
              <RadioButton.Item key={t.value} label={t.label} value={t.value} testID={`add-task-type-${t.value}`} />
            ))}
          </RadioButton.Group>
        )}
      />

      <Controller
        control={control}
        name="horario"
        render={({ field }) => (
          <View>
            <TextInput mode="outlined" label="Horário de hoje (HH:MM)" placeholder="14:00" value={field.value} onChangeText={field.onChange} testID="add-task-time" />
            {errors.horario && <HelperText type="error">{errors.horario.message}</HelperText>}
          </View>
        )}
      />

      {formError && <HelperText type="error">{formError}</HelperText>}

      <Button mode="contained" onPress={handleSubmit(onSubmit)} testID="add-task-submit">
        Adicionar tarefa
      </Button>
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    card: {
      backgroundColor: tokens.surfaceRaised,
      borderRadius: radii.lg,
      padding: spacing.md,
      gap: 8,
      ...shadows.sm,
    },
    title: { fontSize: 16, fontWeight: "700", color: tokens.ink },
  });
}
