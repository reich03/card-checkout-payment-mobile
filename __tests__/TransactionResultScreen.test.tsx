import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { TransactionResultScreen } from '../src/screens/TransactionResultScreen';
import * as transactionsApi from '../src/services/transactionsApi';
import { addToCart } from '../src/store/slices/cartSlice';
import { paymentFailed, paymentSucceeded } from '../src/store/slices/paymentSlice';
import { createTestStore, findTextNodes, pressByText } from '../testUtils';

jest.mock('../src/services/transactionsApi');
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn().mockResolvedValue({}),
  WebBrowserPresentationStyle: { PAGE_SHEET: 'pageSheet' },
}));

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

function renderResult(
  navigation: { navigate: jest.Mock; reset: jest.Mock },
  store: ReturnType<typeof createTestStore>,
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ReactTestRenderer.create(
    <QueryClientProvider client={client}>
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <TransactionResultScreen
            navigation={navigation as never}
            route={{ key: 'TransactionResult', name: 'TransactionResult' } as never}
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

test('shows the success state and opens the receipt on primary press', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  store.dispatch(
    paymentSucceeded({
      id: 'txn-1',
      status: 'APPROVED',
      amount: 45000,
      currency: 'COP',
      paymentRef: 'ref-1',
      cardLast4: '4242',
      createdAt: new Date().toISOString(),
    }),
  );
  mockedTransactionsApi.fetchTransactionReceipt.mockResolvedValue({
    html: '<html></html>',
  } as never);
  mockedTransactionsApi.receiptHtmlUrl.mockReturnValue(
    'https://example.com/receipt/txn-1',
  );

  const navigation = { navigate: jest.fn(), reset: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderResult(navigation, store);
  });

  expect(findTextNodes(tree!.root, '¡Pago exitoso!').length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Ver Recibo');
  });
  await flush();
  await flush();

  expect(mockedTransactionsApi.fetchTransactionReceipt).toHaveBeenCalledWith(
    'txn-1',
  );

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('goes home and clears cart plus last transaction from the secondary CTA', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  store.dispatch(
    paymentSucceeded({
      id: 'txn-2',
      status: 'APPROVED',
      amount: 45000,
      currency: 'COP',
      paymentRef: 'ref-2',
      cardLast4: '4242',
      createdAt: new Date().toISOString(),
    }),
  );

  const navigation = { navigate: jest.fn(), reset: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderResult(navigation, store);
  });

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Volver a la tienda');
  });

  expect(navigation.reset).toHaveBeenCalledWith({
    index: 0,
    routes: [{ name: 'Home' }],
  });
  expect(store.getState().cart.items).toHaveLength(0);
  expect(store.getState().payment.lastTransaction).toBeNull();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('shows the pending state and refreshes the transaction status', async () => {
  const store = createTestStore();
  store.dispatch(
    paymentSucceeded({
      id: 'txn-3',
      status: 'PENDING',
      amount: 45000,
      currency: 'COP',
      paymentRef: 'ref-3',
      cardLast4: '4242',
      createdAt: new Date().toISOString(),
    }),
  );
  mockedTransactionsApi.fetchTransaction.mockResolvedValue({
    id: 'txn-3',
    status: 'PENDING',
    amount: 45000,
    currency: 'COP',
    paymentRef: 'ref-3',
    cardLast4: '4242',
    createdAt: new Date().toISOString(),
  });

  const navigation = { navigate: jest.fn(), reset: jest.fn() };
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderResult(navigation, store);
  });

  expect(findTextNodes(tree!.root, 'Pago en proceso').length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Consultar estado');
  });
  await flush();
  await flush();

  expect(mockedTransactionsApi.fetchTransaction).toHaveBeenCalledWith('txn-3');
  expect(alertSpy).toHaveBeenCalledWith(
    'Aún en proceso',
    expect.stringContaining('Wompi'),
  );

  alertSpy.mockRestore();
  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('shows the error state, informs of no charge, and retries from Checkout', async () => {
  const store = createTestStore();
  store.dispatch(paymentFailed('Fondos insuficientes'));

  const navigation = { navigate: jest.fn(), reset: jest.fn() };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderResult(navigation, store);
  });

  expect(findTextNodes(tree!.root, 'Pago rechazado').length).toBeGreaterThan(0);
  expect(
    findTextNodes(tree!.root, 'Ningún cargo fue aplicado a tu tarjeta.').length,
  ).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Reintentar pago');
  });

  expect(navigation.navigate).toHaveBeenCalledWith('Checkout');
  expect(store.getState().payment.lastTransaction).toBeNull();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('surfaces an alert when refreshing the transaction status fails', async () => {
  const store = createTestStore();
  store.dispatch(
    paymentSucceeded({
      id: 'txn-4',
      status: 'PENDING',
      amount: 45000,
      currency: 'COP',
      paymentRef: 'ref-4',
      cardLast4: '4242',
      createdAt: new Date().toISOString(),
    }),
  );
  mockedTransactionsApi.fetchTransaction.mockRejectedValue(
    new Error('Timeout de red'),
  );

  const navigation = { navigate: jest.fn(), reset: jest.fn() };
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = renderResult(navigation, store);
  });

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Consultar estado');
  });
  await flush();
  await flush();

  expect(alertSpy).toHaveBeenCalledWith('No se pudo consultar', 'Timeout de red');

  alertSpy.mockRestore();
  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
