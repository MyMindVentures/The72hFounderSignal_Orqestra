import React from 'react';
import { Input, Text, XStack, YStack } from 'tamagui';

export type SearchFieldProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (next: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  onSubmitEditing?: () => void;
  testID?: string;
};

export function SearchField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
  onSubmitEditing,
  testID
}: SearchFieldProps) {
  const accessibilityLabel = label ?? placeholder ?? 'Search field';

  return (
    <YStack gap="$1">
      {label ? (
        <Text
          color="$textSecondary"
          fontSize="$2"
          fontWeight="$500"
          testID={testID ? `${testID}-label` : undefined}
        >
          {label}
        </Text>
      ) : null}

      <XStack
        alignItems="center"
        backgroundColor="$bg2"
        borderRadius="$2"
        paddingHorizontal="$2"
        paddingVertical="$2"
        gap="$2"
      >
        <Text color="$textMuted" fontSize="$3" lineHeight="$3">
          ⌕
        </Text>

        <Input
          flex={1}
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={error}
          backgroundColor="transparent"
          borderRadius="$0"
          paddingHorizontal="$0"
          paddingVertical="$0"
          color="$textPrimary"
          placeholderTextColor="#7F8AAE"
          fontSize="$3"
          fontWeight="$500"
        />
      </XStack>

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

