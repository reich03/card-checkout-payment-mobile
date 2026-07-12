module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@reduxjs/toolkit|react-redux|immer|react-native-safe-area-context|react-native-screens|react-native-reanimated|react-native-gesture-handler|@gorhom/bottom-sheet|react-native-encrypted-storage)',
  ],
};
