import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomNavBar } from '../src/components/BottomNavBar';
import { pressByText } from '../testUtils';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 667 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderBar(props: Partial<React.ComponentProps<typeof BottomNavBar>>) {
  return ReactTestRenderer.create(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <BottomNavBar
        active="home"
        onHome={jest.fn()}
        onCart={jest.fn()}
        {...props}
      />
    </SafeAreaProvider>,
  );
}

test('invokes onHome and onCart when tapped', async () => {
  const onHome = jest.fn();
  const onCart = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderBar({ active: 'home', onHome, onCart });
  });

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Inicio');
    pressByText(tree!.root, 'Carrito');
  });

  expect(onHome).toHaveBeenCalled();
  expect(onCart).toHaveBeenCalled();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('renders the cart tab as active', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = renderBar({ active: 'cart' });
  });

  expect(tree!.toJSON()).not.toBeNull();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
