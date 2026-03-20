import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetProps
} from '@gorhom/bottom-sheet';
import { useSegments } from 'expo-router';
import { View as TamaguiView } from 'tamagui';

export type BottomSheetShellProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  testID?: string;
};

const accentColorByRouteSegment = {
  home: '#5AC8FA',
  explore: '#A78BFA',
  activity: '#FFB020',
  ai: '#FF2D55',
  profile: '#0A84FF'
} as const;

function useAccentColor() {
  const segments = useSegments();
  const routeSegment =
    segments.find(s => s in accentColorByRouteSegment)?.toString() ?? 'home';
  return accentColorByRouteSegment[routeSegment as keyof typeof accentColorByRouteSegment];
}

export function BottomSheet({ open, onOpenChange, children, testID }: BottomSheetShellProps) {
  const accentColor = useAccentColor();

  const backgroundComponent = useMemo(() => {
    // Wraps gorhom's expected signature.
    const Background = ({
      pointerEvents,
      style
    }: {
      pointerEvents?: 'auto' | 'none';
      style?: any;
    }) => (
      <View
        pointerEvents={pointerEvents}
        accessible={true}
        accessibilityRole="dialog"
        accessibilityLabel="Bottom Sheet"
        style={[
          {
            backgroundColor: '#0A0F2B',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: 'hidden'
          },
          style
        ]}
      />
    );

    return Background;
  }, []);

  const handleIndicatorStyle: BottomSheetProps['handleIndicatorStyle'] = useMemo(
    () => ({
      backgroundColor: accentColor,
      width: 44,
      height: 5,
      borderRadius: 999,
      opacity: 0.6
    }),
    [accentColor]
  );

  const onChange = useCallback(
    (index: number) => {
      if (index < 0) onOpenChange?.(false);
      else onOpenChange?.(true);
    },
    [onOpenChange]
  );

  return (
    <GorhomBottomSheet
      testID={testID}
      index={open ? 0 : -1}
      snapPoints={['60%']}
      enablePanDownToClose={true}
      enableHandlePanningGesture={true}
      enableContentPanningGesture={true}
      animateOnMount={false}
      onChange={onChange}
      backgroundComponent={backgroundComponent as any}
      handleIndicatorStyle={handleIndicatorStyle}
      backgroundStyle={{ backgroundColor: 'transparent' }}
      backdropComponent={p => (
        <BottomSheetBackdrop
          {...p}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.35}
        />
      )}
      accessible={open}
    >
      <TamaguiView padding="$2">{children}</TamaguiView>
    </GorhomBottomSheet>
  );
}

