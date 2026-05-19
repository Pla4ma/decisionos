import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import type { FutureSelfMessage } from '@/features/ai/futureSelfTypes';

interface FutureSelfMessageCardProps {
  messages: FutureSelfMessage[];
  unreadCount: number;
  onRead: (message: FutureSelfMessage) => void;
  onDismiss: (id: string) => void;
}

const TONE_COLORS: Record<string, string> = {
  wise: colors.status.info,
  stern: colors.status.warning,
  encouraging: colors.status.success,
  philosophical: colors.accent.secondary,
};

export function FutureSelfMessageCard({ messages, unreadCount, onRead, onDismiss }: FutureSelfMessageCardProps): JSX.Element | null {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (messages.length === 0) return null;

  const toggleExpand = (msg: FutureSelfMessage) => {
    if (expandedId === msg.id) {
      setExpandedId(null);
    } else {
      setExpandedId(msg.id);
      if (!msg.is_read) onRead(msg);
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>📜</Text>
          <View>
            <Text style={styles.title}>Future Self</Text>
            <Text style={styles.subtitle}>Letters from the person you are becoming</Text>
          </View>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {messages.slice(0, 3).map((msg) => {
        const isExpanded = expandedId === msg.id;
        return (
          <TouchableOpacity
            key={msg.id}
            style={[styles.messageRow, isExpanded && styles.messageRowExpanded]}
            onPress={() => toggleExpand(msg)}
            activeOpacity={0.7}
          >
            <View style={styles.messageHeader}>
              <View style={[styles.toneDot, { backgroundColor: TONE_COLORS[msg.context?.triggered_by || 'wise'] || colors.text.tertiary }]} />
              <View style={styles.messageInfo}>
                <Text style={styles.messageSubject}>{msg.subject}</Text>
                <Text style={styles.messageDate}>
                  {new Date(msg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              {!msg.is_read && <View style={styles.unreadDot} />}
              <TouchableOpacity onPress={() => onDismiss(msg.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.dismissIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            {isExpanded && (
              <View style={styles.bodySection}>
                <Text style={styles.bodyText}>{msg.body}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', gap: spacing.md, flex: 1 },
  icon: { fontSize: 28 },
  title: { fontSize: typography.size.md, fontWeight: '700', color: colors.text.primary },
  subtitle: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 1 },
  unreadBadge: { backgroundColor: colors.accent.primary, borderRadius: 9999, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 11, fontWeight: '700', color: colors.text.inverse },
  messageRow: { backgroundColor: colors.background.tertiary, borderRadius: 10, padding: spacing.md, marginBottom: spacing.sm },
  messageRowExpanded: { borderWidth: 1, borderColor: colors.border.accent },
  messageHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toneDot: { width: 8, height: 8, borderRadius: 4 },
  messageInfo: { flex: 1 },
  messageSubject: { fontSize: typography.size.sm, fontWeight: '600', color: colors.text.primary },
  messageDate: { fontSize: typography.size.xs, color: colors.text.tertiary, marginTop: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent.primary },
  dismissIcon: { fontSize: 12, color: colors.text.disabled, padding: 4 },
  bodySection: { borderTopWidth: 1, borderTopColor: colors.border.primary, marginTop: spacing.md, paddingTop: spacing.md },
  bodyText: { fontSize: typography.size.sm, color: colors.text.secondary, lineHeight: 22, fontStyle: 'italic' },
});