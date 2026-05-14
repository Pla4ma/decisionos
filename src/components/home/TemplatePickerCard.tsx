// TemplatePickerCard — Start a decision from a template
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { DecisionTemplate } from '@/features/decisions/templateTypes';
import { CATEGORY_LABELS } from '@/features/decisions/decisionRules';

interface TemplatePickerCardProps {
  templates: DecisionTemplate[];
  onSelectTemplate: (template: DecisionTemplate) => void;
}

export function TemplatePickerCard({ templates, onSelectTemplate }: TemplatePickerCardProps): JSX.Element {
  if (templates.length === 0) return <></>;

  return (
    <Card variant="elevated" style={styles.container}>
      <Text style={styles.sectionTitle}>Start from a Template</Text>
      <FlatList
        data={templates.slice(0, 4)}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.templateCard}
            onPress={() => onSelectTemplate(item)}
            activeOpacity={0.7}
          >
            <Badge text={CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] || item.category} variant="secondary" />
            <Text style={styles.templateTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.templateDesc} numberOfLines={2}>{item.description}</Text>
            {item.tier === 'plus' && (
              <Badge text="Plus" variant="warning" style={styles.plusBadge} />
            )}
          </TouchableOpacity>
        )}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  sectionTitle: {
    fontSize: typography.size.sm, fontWeight: '600', color: colors.text.secondary,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md,
  },
  listContent: { gap: spacing.sm },
  templateCard: {
    width: 160,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.secondary,
  },
  templateTitle: {
    fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary,
    marginTop: spacing.sm, marginBottom: spacing.xs,
  },
  templateDesc: {
    fontSize: typography.size.xs, color: colors.text.tertiary, lineHeight: 16,
  },
  plusBadge: { marginTop: spacing.sm, alignSelf: 'flex-start' },
});
