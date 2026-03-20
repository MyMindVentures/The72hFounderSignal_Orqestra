import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { Pressable, Text, View, XStack, YStack } from 'tamagui';
import { useSegments } from 'expo-router';
import { motionDurations, motionEasing } from '../../motion';

export type CollapsibleSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
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

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  testID
}: CollapsibleSectionProps) {
  const accentToken = useAccentToken();
  const renderedChildren = useMemo(() => children, [children]);
  const [open, setOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState(0);

  // Shared values animate the visible panel.
  const heightSv = useSharedValue(0);
  const opacitySv = useSharedValue(defaultOpen ? 1 : 0);

  const animateTo = useCallback(
    (nextOpen: boolean, measuredHeight: number) => {
      const targetHeight = nextOpen ? measuredHeight : 0;
      heightSv.value = withTiming(targetHeight, {
        duration: motionDurations.default,
        easing: motionEasing.outCubic
      });
      opacitySv.value = withTiming(nextOpen ? 1 : 0, {
        duration: motionDurations.default,
        easing: motionEasing.outCubic
      });
    },
    [heightSv, opacitySv]
  );

  useEffect(() => {
    // When content height changes (initial measurement), animate again to the correct target.
    animateTo(open, contentHeight);
  }, [open, contentHeight, animateTo]);

  const animatedBodyStyle = useAnimatedStyle(() => ({
    height: heightSv.value,
    opacity: opacitySv.value
  }));

  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotateZ: `${interpolate(opacitySv.value, [0, 1], [0, 180])}deg`
      }
    ]
  }));

  const onMeasureLayout = useCallback((e: { nativeEvent: { layout: { height: number } } }) => {
    setContentHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <View testID={testID}>
      <Pressable
        onPress={() => setOpen(prev => !prev)}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: open }}
      >
        <XStack alignItems="center" justifyContent="space-between" padding="$2" gap="$2">
          <Text color="$textPrimary" fontSize="$3" fontWeight="$600" numberOfLines={1}>
            {title}
          </Text>

          <YStack
            width={28}
            height={28}
            borderRadius="$2"
            backgroundColor="$bg2"
            alignItems="center"
            justifyContent="center"
          >
            <Animated.View style={animatedChevronStyle}>
              <Text color={accentToken as any} fontSize="$3" lineHeight="$3">
                v
              </Text>
            </Animated.View>
          </YStack>
        </XStack>
      </Pressable>

      {/* Hidden measurement pass so height animation has a stable target even when closed. */}
      <View
        position="absolute"
        left={-10000}
        right={0}
        opacity={0}
        pointerEvents="none"
        onLayout={onMeasureLayout}
      >
        <View>{renderedChildren}</View>
      </View>

      <Animated.View style={[{ overflow: 'hidden' }, animatedBodyStyle]}>
        {/* Keep children stable; panel handles visibility via animated height/opacity. */}
        {renderedChildren}
      </Animated.View>
    </View>
  );
}

