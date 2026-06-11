import '@testing-library/jest-native/extend-expect';

import { setUpTests } from 'react-native-reanimated';

// Mock Reanimated
setUpTests();

// Mock Vector Icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
  Ionicons: 'Ionicons'
}));
