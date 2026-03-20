import React from 'react';
import { Input, Text, YStack } from 'tamagui';

export type TextFieldProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (next: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  testID?: string;
};

export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
  testID
}: TextFieldProps) {
  const accessibilityLabel = label ?? placeholder ?? 'Text field';

  return (
    <YStack gap="$1">
      {label ? (
        <Text color="$textSecondary" fontSize="$2" fontWeight="$500" testID={testID ? `${testID}-label` : undefined}>
          {label}
        </Text>
      ) : null}

      <Input
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={error}
        backgroundColor="$bg2"
        borderRadius="$2"
        paddingHorizontal="$2"
        paddingVertical="$2"
        color="$textPrimary"
        placeholderTextColor="#7F8AAE"
        fontSize="$3"
        fontWeight="$500"
      />

      {error ? (
        <Text
          color="$danger"
          fontSize="$2"
          fontWeight="$500"
          accessibilityLiveRegion="polite"
          testID={testID ? `${testID}-error` : undefined}
        >
          {error}
        </Text>
      ) : null}
    </YStack>
  );
}

