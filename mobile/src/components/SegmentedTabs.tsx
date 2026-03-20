import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export type SegmentedTabItem<T extends string> = {
  key: T;
  label: string;
};

type Props<T extends string> = {
  tabs: Array<SegmentedTabItem<T>>;
  activeKey: T;
  onChange: (key: T) => void;
};

export function SegmentedTabs<T extends string>({ tabs, activeKey, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {tabs.map((t) => {
        const active = t.key === activeKey;
        return (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabButton, active ? styles.tabButtonActive : undefined]}
            onPress={() => onChange(t.key)}
          >
            <Text style={[styles.tabButtonText, active ? styles.tabButtonTextActive : undefined]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 8 },
  tabButton: {
    flex: 1,
    backgroundColor: '#0B1020',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  tabButtonActive: {
    borderColor: '#60A5FA',
    backgroundColor: '#0A1730'
  },
  tabButtonText: { color: '#E5E7EB', fontWeight: '600', fontSize: 12 },
  tabButtonTextActive: { color: '#FFFFFF' }
});

