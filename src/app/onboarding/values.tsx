// Onboarding Values — Personal values setup
// Full implementation with values selection and memory preference
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useState } from 'react';
import { ROUTES } from '@/config/routes';

const AVAILABLE_VALUES = [
  { key: 'stability', label: 'Stability' },
  { key: 'growth', label: 'Growth' },
  { key: 'freedom', label: 'Freedom' },
  { key: 'money', label: 'Money' },
  { key: 'family', label: 'Family' },
  { key: 'health', label: 'Health' },
  { key: 'learning', label: 'Learning' },
  { key: 'peace', label: 'Peace' },
  { key: 'achievement', label: 'Achievement' },
  { key: 'creativity', label: 'Creativity' },
];

export default function ValuesScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [enableMemory, setEnableMemory] = useState<boolean | null>(null);

  const toggleValue = (key: string) => {
    setSelectedValues((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    );
  };

  const canProceed = selectedValues.length > 0 && enableMemory !== null;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>✨</Text>
        <Text style={styles.title}>What Guides You?</Text>
        <Text style={styles.description}>
          Select the values that guide your biggest decisions. You can change these later.
        </Text>

        <Card variant="elevated" style={styles.valuesCard}>
          <Text style={styles.sectionLabel}>Your Values</Text>
          <View style={styles.valuesGrid}>
            {AVAILABLE_VALUES.map((value) => {
              const isSelected = selectedValues.includes(value.key);
              return (
                <TouchableOpacity
                  key={value.key}
                  style={[styles.valueButton, isSelected && styles.valueButtonSelected]}
                  onPress={() => toggleValue(value.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.valueButtonText,
                      isSelected && styles.valueButtonTextSelected,
                    ]}
                  >
                    {value.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Card variant="elevated" style={styles.memoryCard}>
          <Text style={styles.sectionLabel}>Memory Preference</Text>
          <Text style={styles.memoryDescription}>
            Allow DecisionOS to learn from your past reviewed decisions to personalize future analysis?
          </Text>

          <View style={styles.memoryOptions}>
            <TouchableOpacity
              style={[styles.memoryOption, enableMemory === true && styles.memoryOptionSelected]}
              onPress={() => setEnableMemory(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.memoryOptionText,
                  enableMemory === true && styles.memoryOptionTextSelected,
                ]}
              >
                Yes, personalize future analysis
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.memoryOption, enableMemory === false && styles.memoryOptionSelected]}
              onPress={() => setEnableMemory(false)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.memoryOptionText,
                  enableMemory === false && styles.memoryOptionTextSelected,
                ]}
              >
                Not now
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      <View style={styles.actions}>
        <Link href={ROUTES.SIGN_UP} asChild>
          <Button title="Create Account" variant="primary" disabled={!canProceed} />
        </Link>
        <Link href={ROUTES.SIGN_IN} asChild>
          <Button title="I Already Have an Account" variant="ghost" />
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.size.md,
    marginBottom: spacing.lg,
  },
  valuesCard: {
    alignSelf: 'stretch',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  valueButton: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  valueButtonSelected: {
    backgroundColor: colors.accent.muted,
    borderColor: colors.accent.primary,
  },
  valueButtonText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  valueButtonTextSelected: {
    color: colors.accent.primary,
    fontWeight: typography.weight.medium,
  },
  memoryCard: {
    alignSelf: 'stretch',
  },
  memoryDescription: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: typography.lineHeight.normal * typography.size.sm,
  },
  memoryOptions: {
    gap: spacing.sm,
  },
  memoryOption: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  memoryOptionSelected: {
    backgroundColor: colors.accent.muted,
    borderColor: colors.accent.primary,
  },
  memoryOptionText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
  },
  memoryOptionTextSelected: {
    color: colors.accent.primary,
    fontWeight: typography.weight.medium,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
});
