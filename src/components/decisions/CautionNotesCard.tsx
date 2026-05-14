// CautionNotesCard — Uncertainty and missing information
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';

interface CautionNotesCardProps {
  uncertaintyNotes: string[];
  missingInformation: string[];
}

export function CautionNotesCard({ uncertaintyNotes, missingInformation }: CautionNotesCardProps): JSX.Element {
  if ((!uncertaintyNotes || uncertaintyNotes.length === 0) && (!missingInformation || missingInformation.length === 0)) {
    return <></>;
  }

  return (
    <Card variant="outlined" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Important Caveats</Text>
      </View>

      {uncertaintyNotes && uncertaintyNotes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Could Change These Scores</Text>
          {uncertaintyNotes.map((note, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.uncertaintyIcon}>◊</Text>
              <Text style={styles.text}>{note}</Text>
            </View>
          ))}
        </View>
      )}

      {missingInformation && missingInformation.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Missing Information That Would Help</Text>
          {missingInformation.map((info, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.missingIcon}>+</Text>
              <Text style={styles.text}>{info}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg, borderColor: colors.status.warning },
  header: { marginBottom: spacing.md },
  title: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, color: colors.status.warning },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.size.sm, color: colors.text.secondary, fontWeight: typography.weight.medium, marginBottom: spacing.sm },
  item: { flexDirection: 'row', marginBottom: spacing.xs },
  uncertaintyIcon: { color: colors.status.warning, marginRight: spacing.xs, fontSize: typography.size.sm },
  missingIcon: { color: colors.accent.primary, marginRight: spacing.xs, fontSize: typography.size.sm, fontWeight: typography.weight.bold },
  text: { flex: 1, fontSize: typography.size.sm, color: colors.text.primary, lineHeight: 18 },
});
