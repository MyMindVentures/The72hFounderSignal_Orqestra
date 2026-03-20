import React from 'react';
import { useSegments } from 'expo-router';
import { LinearGradient, View } from 'tamagui';

export type GradientBackgroundProps = {
  children?: React.ReactNode;
  testID?: string;
};

const accentTokenByRoute = {
  home: '$accentHome',
  explore: '$accentExplore',
  activity: '$accentActivity',
  ai: '$accentAi',
  profile: '$accentProfile'
} as const;

export function GradientBackground({ children, testID }: GradientBackgroundProps) {
  const segments = useSegments();
  const accentRouteSegment =
    segments.find(s => s in accentTokenByRoute)?.toString() ?? 'home';
  const accentToken = accentTokenByRoute[accentRouteSegment as keyof typeof accentTokenByRoute];

  return (
    <View
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      backgroundColor="$bg0"
      testID={testID}
      pointerEvents="none"
    >
      <LinearGradient
        colors={['$bg0', '$bg1', '$bg2']}
        start={[0, 0]}
        end={[0, 1]}
        style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
      />

      {/* Soft accent glows (radial-ish circles via large rounded layers). */}
      <View
        position="absolute"
        width={340}
        height={340}
        borderRadius={170}
        left={-120}
        top={-160}
        backgroundColor={accentToken as any}
        opacity={0.18}
      />
      <View
        position="absolute"
        width={420}
        height={420}
        borderRadius={210}
        right={-160}
        bottom={-220}
        backgroundColor={accentToken as any}
        opacity={0.14}
      />

      {children}
    </View>
  );
}

