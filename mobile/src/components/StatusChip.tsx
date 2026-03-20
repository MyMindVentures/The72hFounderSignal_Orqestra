import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

type Variant = 'neutral' | 'active' | 'alert';

type Props = {
  label: string;
  variant?: Variant;
  onPress?: () => void;
  style?: ViewStyle;
};

export function StatusChip({ label, variant = 'neutral', onPress, style }: Props) {
  const content = (
    <Text
      style={[
        styles.text,
        variant === 'active' ? styles.textActive : undefined,
        variant === 'alert' ? styles.textAlert : undefined
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={[styles.chip, styles[variant], style]} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.chip, styles[variant], style]}>{content}</View>;
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#111827'
  },
  neutral: {},
  active: {
    borderColor: '#60A5FA',
    backgroundColor: '#0A1730'
  },
  alert: {
    borderColor: '#EF4444',
    backgroundColor: '#2A0B0B'
  },
  text: { fontSize: 11, fontWeight: '700', color: '#E5E7EB' },
  textActive: { color: '#FFFFFF' },
  textAlert: { color: '#F87171' }
});

