// DecisionActions — Handles status-aware actions and reflection check-ins
import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Link } from 'expo-router';
import { Decision } from '@/features/decisions/decisionTypes';
import { spacing } from '@/theme/spacing';

interface DecisionActionsProps {
  decision: Decision;
  id: string;
  onAnalyze: () => void;
  onEdit: () => void;
  onCheckIn: () => void;
}

export function DecisionActions({ decision, id, onAnalyze, onEdit, onCheckIn }: DecisionActionsProps) {
  return (
    <View style={styles.actions}>
      {decision.status === 'draft' && <Button title="Continue Setup" variant="primary" onPress={onEdit} />}
      {decision.status === 'ready_for_analysis' && <Button title="Get AI Analysis" variant="primary" onPress={onAnalyze} />}
      {decision.status === 'analyzed' && (
        <>
          <Button title="View Analysis" variant="primary" onPress={onAnalyze} />
          <Link href={`/decisions/${id}/commit`} asChild><Button title="Choose Option" variant="secondary" /></Link>
        </>
      )}
      {decision.status === 'chosen' && (
        <Link href={`/decisions/${id}/review`} asChild><Button title="Schedule Review" variant="primary" /></Link>
      )}
      {decision.status === 'chosen' && <Button title="Check In" variant="secondary" onPress={onCheckIn} />}
      {decision.scheduled_review_at && new Date(decision.scheduled_review_at) <= new Date() && (
        <Link href={`/decisions/${id}/review`} asChild><Button title="Review Outcome" variant="primary" /></Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ actions: { gap: spacing.md, marginTop: spacing.lg } });
