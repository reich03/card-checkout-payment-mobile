import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from '../src/screens/SplashScreen';

jest.useFakeTimers();

const initialMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 667 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderSplash(navigation: { replace: jest.Mock }) {
  return ReactTestRenderer.create(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <SplashScreen
        navigation={navigation as never}
        route={{ key: 'Splash', name: 'Splash' } as never}
      />
    </SafeAreaProvider>,
  );
}

test('renders GreenPay splash branding', async () => {
  const navigation = {
    replace: jest.fn(),
  };

  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderSplash(navigation);
  });

  const textNodes = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);

  expect(textNodes).toContain('GreenPay');
  expect(textNodes).toContain('Pagos simples y seguros');
  expect(textNodes).toContain('Encriptación de grado bancario');
});

test('navigates to Home after 2 seconds', async () => {
  const navigation = {
    replace: jest.fn(),
  };

  await ReactTestRenderer.act(() => {
    renderSplash(navigation);
  });

  await ReactTestRenderer.act(() => {
    jest.advanceTimersByTime(2000);
  });

  expect(navigation.replace).toHaveBeenCalledWith('Home');
});
