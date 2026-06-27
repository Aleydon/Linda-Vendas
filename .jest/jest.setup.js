import '@testing-library/jest-native/extend-expect';

import { setUpTests } from 'react-native-reanimated';

// Mock Reanimated
setUpTests();

// Mock Vector Icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Ionicons: 'Ionicons'
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
