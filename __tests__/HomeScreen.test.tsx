import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from '../src/screens/HomeScreen';
import * as productsApi from '../src/services/productsApi';
import { createTestStore, findTextNodes, pressByText } from '../testUtils';

jest.mock('../src/services/productsApi');

// HomeScreen calls `useFocusEffect`, which normally requires a real
// NavigationContainer. For a plain screen-level render test we treat it as a
// regular mount effect instead of standing up the whole navigation tree.
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const { useEffect } = jest.requireActual('react');
  return {
    ...actual,
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
  };
});

const mockedProductsApi = productsApi as jest.Mocked<typeof productsApi>;

const initialMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 667 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const products = [
  {
    id: 'prod-1',
    name: 'Café Especial',
    description: 'Tueste medio',
    price: 45000,
    stock: 10,
    imageUrl: 'https://example.com/coffee.jpg',
  },
  {
    id: 'prod-2',
    name: 'Taza Artesanal',
    description: 'Cerámica',
    price: 32500,
    stock: 0,
    imageUrl: 'https://example.com/mug.jpg',
  },
];

function renderHome(navigation: { navigate: jest.Mock }) {
  const store = createTestStore();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    store,
    tree: ReactTestRenderer.create(
      <QueryClientProvider client={client}>
        <Provider store={store}>
          <SafeAreaProvider initialMetrics={initialMetrics}>
            <HomeScreen
              navigation={navigation as never}
              route={{ key: 'Home', name: 'Home' } as never}
            />
          </SafeAreaProvider>
        </Provider>
      </QueryClientProvider>,
    ),
  };
}

async function flush() {
  // react-query batches subscriber notifications via a macrotask
  // (setTimeout), so a microtask-only flush isn't enough here.
  await ReactTestRenderer.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

test('shows a skeleton while loading, then the product catalog', async () => {
  let resolveFetch: (value: typeof products) => void = () => {};
  mockedProductsApi.fetchProducts.mockReturnValue(
    new Promise((resolve) => {
      resolveFetch = resolve;
    }),
  );

  const navigation = { navigate: jest.fn() };
  let harness: ReturnType<typeof renderHome>;

  await ReactTestRenderer.act(() => {
    harness = renderHome(navigation);
  });

  expect(harness!.tree.toJSON()).not.toBeNull();

  await ReactTestRenderer.act(async () => {
    resolveFetch(products);
    await Promise.resolve();
  });
  await flush();
  await flush();

  const texts = findTextNodes(harness!.tree.root, 'Café Especial');
  expect(texts.length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    harness!.tree.unmount();
  });
});

test('adds an in-stock product to the cart and filters the catalog by search', async () => {
  mockedProductsApi.fetchProducts.mockResolvedValue(products);
  const navigation = { navigate: jest.fn() };
  let harness: ReturnType<typeof renderHome>;

  await ReactTestRenderer.act(() => {
    harness = renderHome(navigation);
  });
  await flush();

  await ReactTestRenderer.act(() => {
    pressByText(harness!.tree.root, 'Agregar');
  });
  expect(harness!.store.getState().cart.items).toHaveLength(1);
  expect(harness!.store.getState().cart.items[0].product.id).toBe('prod-1');

  const searchInput = harness!.tree.root.findByProps({
    placeholder: 'Buscar café, tazas o accesorios...',
  });
  await ReactTestRenderer.act(() => {
    searchInput.props.onChangeText('taza');
  });

  const filteredTexts = findTextNodes(harness!.tree.root, 'Café Especial');
  expect(filteredTexts).toHaveLength(0);

  await ReactTestRenderer.act(() => {
    harness!.tree.unmount();
  });
});

test('navigates to Cart when the header cart button is pressed', async () => {
  mockedProductsApi.fetchProducts.mockResolvedValue(products);
  const navigation = { navigate: jest.fn() };
  let harness: ReturnType<typeof renderHome>;

  await ReactTestRenderer.act(() => {
    harness = renderHome(navigation);
  });
  await flush();

  await ReactTestRenderer.act(() => {
    harness!.tree.root
      .findByProps({ accessibilityLabel: 'Abrir carrito' })
      .props.onPress();
  });

  expect(navigation.navigate).toHaveBeenCalledWith('Cart');

  await ReactTestRenderer.act(() => {
    harness!.tree.unmount();
  });
});

test('shows an error state and allows retrying', async () => {
  mockedProductsApi.fetchProducts.mockRejectedValue(
    new Error('No se pudieron cargar los productos'),
  );
  const navigation = { navigate: jest.fn() };
  let harness: ReturnType<typeof renderHome>;

  await ReactTestRenderer.act(() => {
    harness = renderHome(navigation);
  });
  await flush();
  await flush();

  const errorTexts = findTextNodes(
    harness!.tree.root,
    'No se pudieron cargar los productos',
  );
  expect(errorTexts.length).toBeGreaterThan(0);

  mockedProductsApi.fetchProducts.mockResolvedValue(products);
  await ReactTestRenderer.act(() => {
    pressByText(harness!.tree.root, 'Reintentar');
  });
  await flush();

  await ReactTestRenderer.act(() => {
    harness!.tree.unmount();
  });
});
