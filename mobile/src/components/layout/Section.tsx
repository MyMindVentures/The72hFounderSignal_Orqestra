import React from 'react';
import { View, YStack, Text } from 'tamagui';

export type SectionProps = {
  title?: string;
  children: React.ReactNode;
  testID?: string;
};

export function Section({ title, children, testID }: SectionProps) {
  return (
    <View testID={testID}>
      <YStack padding="$3" gap="$2">
        {title ? (
          <Text
            accessibilityRole="header"
            fontSize="$4"
            fontWeight="$600"
            color="$textPrimary"
          >
            {title}
          </Text>
        ) : null}
        {children}
      </YStack>
    </View>
  );
}

