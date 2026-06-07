import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

interface SkeletonProps extends ViewProps {
  customClass?: string;
}

export function Skeleton({ customClass, ...props }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 900 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`bg-zinc-200 dark:bg-zinc-800 rounded-2xl ${customClass ?? ''}`}
      {...props}
    />
  );
}
export default Skeleton;
