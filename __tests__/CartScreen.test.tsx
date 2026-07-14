import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartScreen } from '../src/screens/CartScreen';
import { addToCart } from '../src/store/slices/cartSlice';
import { createTestStore, findTextNodes, pressByText } from '../testUtils';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 667 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const coffee = {
  id: 'prod-1',
  name: 'Café Especial',
  description: 'Tueste medio',
  price: 45000,
  stock: 10,
  imageUrl: 'https://example.com/coffee.jpg',
};

function renderCart(navigation: { navigate: jest.Mock }, store: ReturnType<typeof createTestStore>) {
  return ReactTestRenderer.create(
    <Provider store={store}>
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <CartScreen
          navigation={navigation as never}
          route={{ key: 'Cart', name: 'Cart' } as never}
        />
      </SafeAreaProvider>
    </Provider>,
  );
}

test('shows the empty state and navigates home from the CTA', async () => {
  const store = createTestStore();
  const navigation = { navigate: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderCart(navigation, store);
  });

  const emptyTexts = findTextNodes(tree!.root, 'Tu carrito está vacío');
  expect(emptyTexts.length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Ir al catálogo');
  });
  expect(navigation.navigate).toHaveBeenCalledWith('Home');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('lists items, updates quantities and totals, and proceeds to checkout', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  const navigation = { navigate: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderCart(navigation, store);
  });

  expect(findTextNodes(tree!.root, 'Café Especial').length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    tree!.root
      .findByProps({ accessibilityLabel: 'Aumentar cantidad' })
      .props.onPress();
  });
  expect(store.getState().cart.items[0].quantity).toBe(2);

  await ReactTestRenderer.act(() => {
    tree!.root
      .findByProps({ accessibilityLabel: 'Continuar al pago' })
      .props.onPress();
  });
  expect(navigation.navigate).toHaveBeenCalledWith('Checkout');

  await ReactTestRenderer.act(() => {
    tree!.root
      .findByProps({ accessibilityLabel: 'Disminuir cantidad' })
      .props.onPress();
  });
  expect(store.getState().cart.items[0].quantity).toBe(1);

  await ReactTestRenderer.act(() => {
    tree!.root
      .findByProps({ accessibilityLabel: 'Eliminar Café Especial' })
      .props.onPress();
  });
  expect(store.getState().cart.items).toHaveLength(0);

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('navigates back home from the header back button', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  const navigation = { navigate: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderCart(navigation, store);
  });

  await ReactTestRenderer.act(() => {
    tree!.root.findByProps({ accessibilityLabel: 'Volver' }).props.onPress();
  });
  expect(navigation.navigate).toHaveBeenCalledWith('Home');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
