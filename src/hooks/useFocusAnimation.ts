import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';

export function useFocusAnimation(delay = 0) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    if (isFocused) {
      opacity.value = withDelay(
        delay,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) })
      );
      translateY.value = withDelay(
        delay,
        withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) })
      );
    } else {
      opacity.value = 0;
      translateY.value = 12;
    }
  }, [isFocused, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  return animatedStyle;
}

export default useFocusAnimation;
