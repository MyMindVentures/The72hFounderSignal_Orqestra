import React from 'react';
import { useSegments } from 'expo-router';
import { Pressable, View } from 'tamagui';

export type GlassCardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'compact';
  testID?: string;
};

const accentTokenByRoute = {
  home: '$accentHome',
  explore: '$accentExplore',
  activity: '$accentActivity',
  ai: '$accentAi',
  profile: '$accentProfile'
} as const;

function useAccentToken() {
  const segments = useSegments();
  const accentRouteSegment =
    segments.find(s => s in accentTokenByRoute)?.toString() ?? 'home';
  return accentTokenByRoute[accentRouteSegment as keyof typeof accentTokenByRoute];
}

export function GlassCard({ children, onPress, variant = 'default', testID }: GlassCardProps) {
  const accentToken = useAccentToken();
  const paddingToken = variant === 'compact' ? '$1' : '$2';

  const content = (
    <View
      backgroundColor="$bg2"
      borderRadius="$2"
      padding={paddingToken}
      overflow="hidden"
      // Subtle "glass" rim via shadow; avoid hard borders.
      shadowColor={accentToken as any}
      shadowOpacity={0.14}
      shadowRadius={16}
      shadowOffset={{ width: 0, height: 8 }}
      testID={testID}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <View>
      <View
        position="absolute"
        left={-40}
        top={-40}
        width={120}
        height={120}
        borderRadius={60}
        backgroundColor={accentToken as any}
        opacity={0.14}
        pointerEvents="none"
      />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={typeof testID === 'string' ? testID : 'Glass card'}
        // @tamagui/typography compatibility: make Pressable size-to-content.
      >
        {content}
      </Pressable>
    </View>
  );
}

