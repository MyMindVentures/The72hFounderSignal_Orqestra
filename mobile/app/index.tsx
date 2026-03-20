import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050816',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16
  }
});

