// DecisionCategorySelector — Category selection with safety check
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { DecisionCategory, CATEGORY_LABELS, UNSAFE_CATEGORIES } from '@/features/decisions/decisionRules';

interface DecisionCategorySelectorProps {
  selectedCategory: DecisionCategory | null;
  onSelectCategory: (category: DecisionCategory) => void;
}

export function DecisionCategorySelector({
  selectedCategory,
  onSelectCategory,
}: DecisionCategorySelectorProps): JSX.Element {
  const categories = Object.keys(CATEGORY_LABELS) as DecisionCategory[];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>What category best fits this decision?</Text>
      <View style={styles.grid}>
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const isUnsafe = UNSAFE_CATEGORIES.includes(category as typeof UNSAFE_CATEGORIES[number]);

          return (
            <Pressable
              key={category}
              style={[
                styles.categoryButton,
                isSelected && styles.selectedButton,
                isUnsafe && styles.unsafeButton,
              ]}
              onPress={() => onSelectCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.selectedText,
                  isUnsafe && styles.unsafeText,
                ]}
              >
                {CATEGORY_LABELS[category]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.text.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  selectedButton: {
    backgroundColor: colors.accent.muted,
    borderColor: colors.accent.primary,
  },
  unsafeButton: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.status.error,
  },
  categoryText: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  },
  selectedText: {
    color: colors.accent.primary,
    fontWeight: typography.weight.semibold,
  },
  unsafeText: {
    color: colors.status.error,
  },
});
