// DailyClarityCard — Prompt for daily decision reflection
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface DailyClarityCardProps {
  onNewDecision: () => void;
}

export function DailyClarityCard({
  onNewDecision,
}: DailyClarityCardProps): JSX.Element {
  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.question}>What needs clarity today?</Text>
        <Text style={styles.hint}>
          Big or small, every decision becomes clearer with structured thinking.
        </Text>
        <Button
          title="New Decision"
          onPress={onNewDecision}
          variant="primary"
          size="large"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  content: {
    alignItems: 'flex-start',
  },
  question: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    lineHeight: typography.lineHeight.tight * typography.size.xl,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.size.sm,
    marginBottom: spacing.lg,
  },
});
