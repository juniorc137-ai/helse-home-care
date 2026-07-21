import { Pressable, StyleSheet, Text, View } from "react-native";
import { minTouchTarget } from "../constants/theme";
import type { ThemeTokens } from "../theme/tokens";
import { useThemedStyles } from "../theme/useThemedStyles";

export interface SubscaleOption {
  score: number;
  label: string;
  helperText?: string;
}

interface SubscalePickerProps {
  title: string;
  options: SubscaleOption[];
  selected: number | null;
  onSelect: (score: number) => void;
  testID?: string;
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { gap: 6, marginBottom: 12 },
    title: { fontSize: 14, fontWeight: "700", color: tokens.ink },
    option: {
      minHeight: minTouchTarget.android,
      justifyContent: "center",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: tokens.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    optionSelected: {
      borderColor: tokens.primary,
      backgroundColor: tokens.statusOkBg,
    },
    optionText: { fontSize: 14, color: tokens.ink },
    optionTextSelected: { fontWeight: "700" },
    helperText: { fontSize: 12, color: tokens.inkSecondary, marginTop: 4 },
  });
}

/** Seletor de nível de uma subescala (Braden/Morse); zona de toque ≥ 48dp (seção 4.1). */
export function SubscalePicker({ title, options, selected, onSelect, testID }: SubscalePickerProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      {options.map((option) => {
        const isSelected = selected === option.score;
        return (
          <Pressable
            key={option.score}
            onPress={() => onSelect(option.score)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={`${option.label}, ${option.score} pontos`}
            style={[styles.option, isSelected && styles.optionSelected]}
          >
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
              {option.score} — {option.label}
            </Text>
            {isSelected && option.helperText && <Text style={styles.helperText}>{option.helperText}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}
