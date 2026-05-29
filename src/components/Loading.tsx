import { ActivityIndicator, View } from 'react-native';

export function Loading() {
  return (
    <View>
      <ActivityIndicator color={'#7F00FF'} />
    </View>
  );
}
