// OutcomeCelebration — Positive reinforcement on review completion
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface OutcomeCelebrationProps {
  onContinue: () => void;
  analysisEarnings: number;
}

export function OutcomeCelebration({ onContinue, analysisEarnings }: OutcomeCelebrationProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎉</Text>
      <Text style={styles.title}>Review Complete</Text>
      <Text style={styles.description}>
        Great job capturing your insights. You have earned {analysisEarnings} extra AI analysis! Your decision playbook is one step closer to updating.
      </Text>
      <Button title="Continue" variant="primary" onPress={onContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, alignItems: 'center', backgroundColor: colors.background.primary },
  icon: { fontSize: 64, marginBottom: spacing.md },
  title: { fontSize: typography.size.xl, fontWeight: '700', marginBottom: spacing.sm },
  description: { fontSize: typography.size.md, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl },
});
