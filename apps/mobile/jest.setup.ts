jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-mmkv', () => {
  const values = new Map();
  return {
    createMMKV: () => ({
      getString: (key: string) => values.get(key),
      getNumber: (key: string) => values.get(key),
      set: (key: string, value: unknown) => values.set(key, value),
      remove: (key: string) => values.delete(key),
      clearAll: () => values.clear(),
    }),
  };
});
