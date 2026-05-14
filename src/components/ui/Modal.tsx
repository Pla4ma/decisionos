// Modal — Reusable modal component with overlay and close functionality
import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export function Modal({ visible, onClose, title, children, size = 'medium' }: ModalProps): JSX.Element {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { maxWidth: 300 };
      case 'large':
        return { maxWidth: 500 };
      default:
        return { maxWidth: 400 };
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, getSizeStyles()]}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.background.secondary,
  },
  closeText: {
    fontSize: typography.size.md,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  },
  content: {
    padding: spacing.md,
  },
});
