import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SafeAreaViewProps } from 'react-native-safe-area-context';

export type SafeAreaLayoutProps = {
  children: React.ReactNode;
  edges?: SafeAreaViewProps['edges'];
  testID?: string;
};

// Applies safe-area insets only once; do not add token-based padding/styling here.
export function SafeAreaLayout({ children, edges, testID }: SafeAreaLayoutProps) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1 }} testID={testID}>
      {children}
    </SafeAreaView>
  );
}

