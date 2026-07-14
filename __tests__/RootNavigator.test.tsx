import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '../src/navigation/RootNavigator';
import { createTestStore } from '../testUtils';
import { queryClient } from '../src/api/queryClient';

test('boots into the Splash screen by default', async () => {
  const store = createTestStore();
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <SafeAreaProvider>
            <RootNavigator />
          </SafeAreaProvider>
        </Provider>
      </QueryClientProvider>,
    );
  });

  expect(tree!.toJSON()).not.toBeNull();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
