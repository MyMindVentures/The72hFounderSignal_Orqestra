import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'tamagui';

export type AppScreenProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  testID?: string;
};

export function AppScreen({ children, scrollable = true, testID }: AppScreenProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }} testID={testID}>
      <View flex={1} backgroundColor="$bg0" paddingHorizontal="$2">
        <View
          flex={1}
          backgroundColor="$bg1"
          borderRadius="$2"
          overflow="hidden"
        >
          {scrollable ? (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ flex: 1 }}>{children}</View>
            </ScrollView>
          ) : (
            children
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

