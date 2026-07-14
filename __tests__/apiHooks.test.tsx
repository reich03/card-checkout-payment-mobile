import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useProductsQuery } from '../src/api/hooks/useProductsQuery';
import { useCreateTransactionMutation } from '../src/api/hooks/useCreateTransactionMutation';
import { useRefreshTransactionMutation } from '../src/api/hooks/useRefreshTransactionMutation';
import { useOpenReceiptMutation } from '../src/api/hooks/useOpenReceiptMutation';
import * as productsApi from '../src/services/productsApi';
import * as transactionsApi from '../src/services/transactionsApi';
import { queryClient as appQueryClient, queryKeys } from '../src/api/queryClient';

jest.mock('../src/services/productsApi');
jest.mock('../src/services/transactionsApi');
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn().mockResolvedValue({}),
  WebBrowserPresentationStyle: { PAGE_SHEET: 'pageSheet' },
}));

const mockedProductsApi = productsApi as jest.Mocked<typeof productsApi>;
const mockedTransactionsApi = transactionsApi as jest.Mocked<
  typeof transactionsApi
>;

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function HookHarness<T>({
  useHook,
  onResult,
}: {
  useHook: () => T;
  onResult: (result: T) => void;
}) {
  const result = useHook();
  onResult(result);
  return null;
}

async function renderHook<T>(useHook: () => T, client: QueryClient) {
  let latest: T;
  const capture = (result: T) => {
    latest = result;
  };

  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <QueryClientProvider client={client}>
        <HookHarness useHook={useHook} onResult={capture} />
      </QueryClientProvider>,
    );
  });

  return {
    get result() {
      return latest;
    },
    rerender: async () => {
      await ReactTestRenderer.act(() => {
        tree.update(
          <QueryClientProvider client={client}>
            <HookHarness useHook={useHook} onResult={capture} />
          </QueryClientProvider>,
        );
      });
    },
    unmount: async () => {
      await ReactTestRenderer.act(() => {
        tree.unmount();
      });
    },
  };
}

const product = {
  id: 'prod-1',
  name: 'Café',
  description: 'Tueste',
  price: 45000,
  stock: 10,
  imageUrl: 'https://example.com/coffee.jpg',
};

const transaction: transactionsApi.TransactionResult = {
  id: 'txn-1',
  status: 'APPROVED',
  amount: 90000,
  currency: 'COP',
  paymentRef: 'ref-1',
  cardLast4: '4242',
  createdAt: new Date().toISOString(),
};

describe('useProductsQuery', () => {
  it('fetches and returns products', async () => {
    mockedProductsApi.fetchProducts.mockResolvedValue([product]);
    const client = makeClient();

    const harness = await renderHook(() => useProductsQuery(), client);
    for (let i = 0; i < 5 && harness.result?.isPending; i += 1) {
      await ReactTestRenderer.act(async () => {
        await Promise.resolve();
      });
      await harness.rerender();
    }

    expect(harness.result?.data).toEqual([product]);
    await harness.unmount();
  });
});

describe('useCreateTransactionMutation', () => {
  it('caches the transaction and refetches the catalog on APPROVED', async () => {
    mockedTransactionsApi.createTransaction.mockResolvedValue(transaction);
    const setQuerySpy = jest.spyOn(appQueryClient, 'setQueryData');
    const invalidateSpy = jest
      .spyOn(appQueryClient, 'invalidateQueries')
      .mockResolvedValue(undefined);
    const refetchSpy = jest
      .spyOn(appQueryClient, 'refetchQueries')
      .mockResolvedValue(undefined);
    const client = makeClient();

    const harness = await renderHook(
      () => useCreateTransactionMutation(),
      client,
    );

    await ReactTestRenderer.act(async () => {
      await harness.result!.mutateAsync({
        products: [{ productId: 'prod-1', quantity: 1 }],
        card: {
          number: '4242424242424242',
          holderName: 'APPROVED',
          expMonth: '12',
          expYear: '30',
          cvv: '123',
          installments: 1,
        },
        customerEmail: 'user@example.com',
      });
    });

    expect(setQuerySpy).toHaveBeenCalledWith(
      queryKeys.transaction(transaction.id),
      transaction,
    );
    expect(invalidateSpy).toHaveBeenCalled();
    expect(refetchSpy).toHaveBeenCalled();

    setQuerySpy.mockRestore();
    invalidateSpy.mockRestore();
    refetchSpy.mockRestore();
    await harness.unmount();
  });
});

describe('useRefreshTransactionMutation', () => {
  it('caches the latest status and refetches on terminal status', async () => {
    mockedTransactionsApi.fetchTransaction.mockResolvedValue({
      ...transaction,
      status: 'DECLINED',
    });
    const refetchSpy = jest
      .spyOn(appQueryClient, 'refetchQueries')
      .mockResolvedValue(undefined);
    const client = makeClient();

    const harness = await renderHook(
      () => useRefreshTransactionMutation(),
      client,
    );

    await ReactTestRenderer.act(async () => {
      await harness.result!.mutateAsync('txn-1');
    });

    expect(mockedTransactionsApi.fetchTransaction).toHaveBeenCalledWith(
      'txn-1',
    );
    expect(refetchSpy).toHaveBeenCalled();

    refetchSpy.mockRestore();
    await harness.unmount();
  });

  it('does not refetch the catalog while still PENDING', async () => {
    mockedTransactionsApi.fetchTransaction.mockResolvedValue({
      ...transaction,
      status: 'PENDING',
    });
    const refetchSpy = jest
      .spyOn(appQueryClient, 'refetchQueries')
      .mockResolvedValue(undefined);
    const client = makeClient();

    const harness = await renderHook(
      () => useRefreshTransactionMutation(),
      client,
    );

    await ReactTestRenderer.act(async () => {
      await harness.result!.mutateAsync('txn-1');
    });

    expect(refetchSpy).not.toHaveBeenCalled();

    refetchSpy.mockRestore();
    await harness.unmount();
  });
});

describe('useOpenReceiptMutation', () => {
  it('fetches the receipt and opens the printable HTML', async () => {
    mockedTransactionsApi.fetchTransactionReceipt.mockResolvedValue({
      receiptNumber: 'R-1',
      transactionId: 'txn-1',
      paymentRef: 'ref-1',
      status: 'APPROVED',
      issuedAt: new Date().toISOString(),
      currency: 'COP',
      amount: 90000,
      cardLast4: '4242',
      merchant: { name: 'GreenPay', tagline: 'Coffee' },
      items: [],
    });
    mockedTransactionsApi.receiptHtmlUrl.mockReturnValue(
      'https://api.example.com/receipt',
    );
    const client = makeClient();

    const harness = await renderHook(() => useOpenReceiptMutation(), client);

    await ReactTestRenderer.act(async () => {
      await harness.result!.mutateAsync('txn-1');
    });

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://api.example.com/receipt',
      expect.objectContaining({ controlsColor: expect.any(String) }),
    );

    await harness.unmount();
  });
});
