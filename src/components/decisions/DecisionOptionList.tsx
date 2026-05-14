// DecisionOptionList — Display and manage list of options
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CreateOptionInput } from '@/features/decisions/decisionTypes';

interface DecisionOptionListProps {
  options: CreateOptionInput[];
  onAddOption: () => void;
  onEditOption: (index: number) => void;
  onRemoveOption: (index: number) => void;
  maxOptions?: number;
}

export function DecisionOptionList({
  options,
  onAddOption,
  onEditOption,
  onRemoveOption,
  maxOptions = 5,
}: DecisionOptionListProps): JSX.Element {
  const canAddMore = options.length < maxOptions;
  const hasMinimum = options.length >= 2;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Options</Text>
          <Text style={styles.subtitle}>
            {options.length} of {maxOptions} — minimum 2 required
          </Text>
        </View>
        <Badge
          title={hasMinimum ? 'Ready' : 'Need 2+'}
          variant={hasMinimum ? 'success' : 'warning'}
          size="small"
        />
      </View>

      {options.length === 0 && (
        <Card variant="outlined" style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No options yet. Add at least 2 alternatives to compare.
          </Text>
        </Card>
      )}

      {options.map((option, index) => (
        <Card key={index} variant="default" style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionNumber}>Option {index + 1}</Text>
            <View style={styles.optionActions}>
              <Pressable
                onPress={() => onEditOption(index)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => onRemoveOption(index)}
                style={styles.actionButton}
              >
                <Text style={[styles.actionText, styles.deleteText]}>Remove</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.optionTitle}>{option.title}</Text>
          {option.description && (
            <Text style={styles.optionDescription}>{option.description}</Text>
          )}
          {(option.pros?.length || option.cons?.length) && (
            <View style={styles.prosCons}>
              {option.pros && option.pros.length > 0 && (
                <Text style={styles.prosText}>
                  + {option.pros.length} pro{option.pros.length !== 1 ? 's' : ''}
                </Text>
              )}
              {option.cons && option.cons.length > 0 && (
                <Text style={styles.consText}>
                  - {option.cons.length} con{option.cons.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          )}
        </Card>
      ))}

      {canAddMore && (
        <Button
          title="+ Add Option"
          variant="secondary"
          onPress={onAddOption}
        />
      )}

      {!canAddMore && (
        <Text style={styles.maxText}>
          Maximum {maxOptions} options reached
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  optionCard: {
    gap: spacing.xs,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionNumber: {
    fontSize: typography.size.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    padding: spacing.xs,
  },
  actionText: {
    fontSize: typography.size.sm,
    color: colors.accent.primary,
    fontWeight: typography.weight.medium,
  },
  deleteText: {
    color: colors.status.error,
  },
  optionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  optionDescription: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
  },
  prosCons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  prosText: {
    fontSize: typography.size.xs,
    color: colors.status.success,
  },
  consText: {
    fontSize: typography.size.xs,
    color: colors.status.error,
  },
  maxText: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
