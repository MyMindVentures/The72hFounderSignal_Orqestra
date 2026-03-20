import React from 'react';
import { View, StyleSheet } from 'react-native';

type Props = {
  done: number;
  running: number;
  todo: number;
};

export function ProgressRail({ done, running, todo }: Props) {
  return (
    <View style={styles.rail}>
      <View style={[styles.seg, styles.done, { flex: Math.max(1, done) }]} />
      <View style={[styles.seg, styles.running, { flex: Math.max(1, running) }]} />
      <View style={[styles.seg, styles.todo, { flex: Math.max(1, todo) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    marginTop: 8,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#111827'
  },
  seg: { flex: 1 },
  done: { backgroundColor: '#22C55E' },
  running: { backgroundColor: '#FACC15' },
  todo: { backgroundColor: '#1F2937' }
});

