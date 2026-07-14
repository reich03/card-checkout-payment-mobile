import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { CheckoutScreen } from '../src/screens/CheckoutScreen';
import * as transactionsApi from '../src/services/transactionsApi';
import { addToCart } from '../src/store/slices/cartSlice';
import {
  confirmPaymentMethod,
  removeSavedCard,
  selectDraftCard,
} from '../src/store/slices/paymentSlice';
import { formatCop } from '../src/utils/formatCurrency';
import { createTestStore, findTextNodes, pressByText } from '../testUtils';

jest.mock('../src/services/transactionsApi');

const mockedTransactionsApi = transactionsApi as jest.Mocked<
  typeof transactionsApi
>;

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

// Built from the real formatter so we match the exact (locale-specific,
// possibly non-breaking) whitespace the component renders.
const payCta = `Pagar ${formatCop(coffee.price)} COP`;

function renderCheckout(
  navigation: { navigate: jest.Mock },
  store: ReturnType<typeof createTestStore>,
) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ReactTestRenderer.create(
    <QueryClientProvider client={client}>
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <CheckoutScreen
            navigation={navigation as never}
            route={{ key: 'Checkout', name: 'Checkout' } as never}
          />
        </SafeAreaProvider>
      </Provider>
    </QueryClientProvider>,
  );
}

async function flush() {
  await ReactTestRenderer.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

test('toggles order details and shows the default payment prompt', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  const navigation = { navigate: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderCheckout(navigation, store);
  });

  expect(findTextNodes(tree!.root, '1 producto').length).toBeGreaterThan(0);
  expect(
    findTextNodes(tree!.root, 'Pagar con tarjeta de crédito').length,
  ).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Detalles');
  });
  expect(findTextNodes(tree!.root, 'Café Especial').length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('disables paying without a confirmed card and navigates back from the header', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  const navigation = { navigate: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderCheckout(navigation, store);
  });

  const payButton = tree!.root
    .findAllByProps({ accessibilityRole: 'button' })
    .find((node) =>
      findTextNodesWithin(node, 'Pagar').length > 0 &&
      typeof node.props.disabled === 'boolean',
    );
  expect(payButton?.props.disabled).toBe(true);

  await ReactTestRenderer.act(() => {
    tree!.root.findByProps({ accessibilityLabel: 'Volver' }).props.onPress();
  });
  expect(navigation.navigate).toHaveBeenCalledWith('Cart');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

function findTextNodesWithin(
  node: ReactTestRenderer.ReactTestInstance,
  text: string,
) {
  return node.findAll(
    (n) =>
      n.type === require('react-native').Text &&
      String(n.props.children).includes(text),
  );
}

test('selects a saved card, confirms it, and completes payment', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  mockedTransactionsApi.createTransaction.mockResolvedValue({
    id: 'txn-1',
    status: 'APPROVED',
    amount: 45000,
    currency: 'COP',
    paymentRef: 'ref-1',
    cardLast4: '4242',
    createdAt: new Date().toISOString(),
  });

  const navigation = { navigate: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderCheckout(navigation, store);
  });

  // Select the sandbox Visa **** 4242 card and confirm the method.
  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Visa Debito');
  });
  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Confirmar método');
  });

  expect(store.getState().payment.selectedCard?.last4).toBe('4242');
  expect(store.getState().payment.chargeableCard).not.toBeNull();

  // Open the payment summary sheet from the bottom bar (1st "Pagar ..."
  // CTA in tree order), then pay from inside the sheet itself (2nd CTA).
  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, payCta, 0);
  });
  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, payCta, 1);
  });
  await flush();
  await flush();

  expect(mockedTransactionsApi.createTransaction).toHaveBeenCalled();
  expect(navigation.navigate).toHaveBeenCalledWith('TransactionResult');
  expect(store.getState().payment.status).toBe('succeeded');
  expect(store.getState().cart.items).toHaveLength(0);

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('shows an alert when confirming without selecting a card', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  // Remove every saved card so the draft selection is null.
  for (const card of store.getState().payment.savedCards) {
    store.dispatch(removeSavedCard(card.id));
  }
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const navigation = { navigate: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderCheckout(navigation, store);
  });

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Pagar con tarjeta de crédito');
  });
  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Confirmar método');
  });

  expect(alertSpy).toHaveBeenCalledWith(
    'Sin tarjeta',
    expect.stringContaining('Selecciona'),
  );

  alertSpy.mockRestore();
  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('shows a payment error toast when the API rejects the charge', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  store.dispatch(selectDraftCard(store.getState().payment.savedCards[0].id));
  store.dispatch(confirmPaymentMethod());
  mockedTransactionsApi.createTransaction.mockRejectedValue(
    new Error('Fondos insuficientes'),
  );

  const navigation = { navigate: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderCheckout(navigation, store);
  });

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, payCta, 0);
  });
  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, payCta, 1);
  });
  await flush();
  await flush();

  expect(store.getState().payment.status).toBe('failed');
  expect(store.getState().payment.error).toBe('Fondos insuficientes');
  expect(findTextNodes(tree!.root, 'Fondos insuficientes').length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
