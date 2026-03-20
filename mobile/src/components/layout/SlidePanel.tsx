import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { View as TamaguiView } from 'tamagui';
import { motionDurations, motionEasing } from '../../motion';

export type SlidePanelProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  testID?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SlidePanel({ open, onOpenChange, children, testID }: SlidePanelProps) {
  const { width } = useWindowDimensions();

  const panelWidth = useMemo(() => {
    // Keep it iOS-feeling: not full width, still usable.
    return Math.min(340, Math.max(280, Math.round(width * 0.82)));
  }, [width]);

  const translateXSv = useSharedValue(open ? 0 : panelWidth);
  const opacitySv = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    translateXSv.value = withTiming(open ? 0 : panelWidth, {
      duration: motionDurations.default,
      easing: motionEasing.outCubic
    });
    opacitySv.value = withTiming(open ? 1 : 0, {
      duration: motionDurations.default,
      easing: motionEasing.outCubic
    });
  }, [open, panelWidth, opacitySv, translateXSv]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacitySv.value
  }));

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateXSv.value }],
    opacity: opacitySv.value
  }));

  return (
    <>
      <AnimatedPressable
        pointerEvents={open ? 'auto' : 'none'}
        accessibilityLabel="Slide Panel Backdrop"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.45)' }, backdropAnimatedStyle]}
        onPress={() => onOpenChange?.(false)}
      />

      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[
          styles.panel,
          { width: panelWidth },
          panelAnimatedStyle,
        ]}
        accessible={open}
        accessibilityRole="dialog"
        accessibilityLabel="Slide Panel"
        testID={testID}
      >
        <TamaguiView flex={1} padding="$2" backgroundColor="$bg2" borderTopLeftRadius={28} borderBottomLeftRadius={28}>
          {children}
        </TamaguiView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0
  }
});

