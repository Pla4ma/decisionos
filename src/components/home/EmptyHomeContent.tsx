import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { InstantInsightPrompt } from './InstantInsightPrompt';

interface EmptyHomeContentProps {
  exampleDecisions: string[];
  onStartFull: () => void;
  onStartQuick: (title: string) => void;
  onInsightGenerated: (insight: any) => void;
}

export function EmptyHomeContent({ exampleDecisions, onStartFull, onStartQuick, onInsightGenerated }: EmptyHomeContentProps): JSX.Element {
  return (
    <View style={styles.container}>
      <InstantInsightPrompt
        onInsightGenerated={onInsightGenerated}
        onStartFullAnalysis={(text) => onStartQuick(text)}
      />
      <View style={styles.orDivider}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>or try an example</Text>
        <View style={styles.orLine} />
      </View>
      <View style={styles.examples}>
        {exampleDecisions.slice(0, 4).map((example, i) => (
          <TouchableOpacity
            key={i}
            style={styles.exampleChip}
            onPress={() => onStartQuick(example)}
            activeOpacity={0.7}
          >
            <Text style={styles.exampleChipText}>{example}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.fullAnalysisBtn} onPress={onStartFull} activeOpacity={0.7}>
        <Text style={styles.fullAnalysisLabel}>Skip insight — go straight to structured analysis</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.primary,
  },
  orText: {
    fontSize: typography.size.xs,
    color: colors.text.disabled,
    marginHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  examples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  exampleChip: {
    backgroundColor: colors.background.secondary,
    borderRadius: 9999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  exampleChipText: {
    fontSize: typography.size.sm,
    color: colors.accent.primary,
  },
  fullAnalysisBtn: {
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  fullAnalysisLabel: {
    fontSize: typography.size.sm,
    color: colors.text.tertiary,
  },
});