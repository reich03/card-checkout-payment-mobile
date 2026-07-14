import {
  createTransaction,
  fetchTransaction,
  fetchTransactionReceipt,
  receiptHtmlUrl,
  type CreateTransactionPayload,
} from '../src/services/transactionsApi';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

const payload: CreateTransactionPayload = {
  products: [{ productId: 'prod-1', quantity: 2 }],
  card: {
    number: '4242424242424242',
    holderName: 'APPROVED',
    expMonth: '12',
    expYear: '30',
    cvv: '123',
    installments: 1,
  },
  customerEmail: 'user@example.com',
};

describe('createTransaction', () => {
  afterEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockReset?.();
  });

  it('returns a normalized transaction on success', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        id: 'txn-1',
        status: 'APPROVED',
        amount: 90000,
        currency: 'COP',
        paymentRef: null,
        cardLast4: '4242',
      }),
    );

    const result = await createTransaction(payload);

    expect(result.id).toBe('txn-1');
    expect(result.paymentRef).toBe('txn-1');
    expect(result.createdAt).toBeTruthy();
  });

  it('throws using the API message array when the response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(
        { message: ['Tarjeta inválida', 'CVV incorrecto'] },
        false,
        400,
      ),
    );

    await expect(createTransaction(payload)).rejects.toThrow(
      'Tarjeta inválida, CVV incorrecto',
    );
  });

  it('throws using the API error field when message is absent', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ error: 'Bad request' }, false, 400),
    );

    await expect(createTransaction(payload)).rejects.toThrow('Bad request');
  });

  it('falls back to a generic message when the body has no message/error', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(null, false, 500));

    await expect(createTransaction(payload)).rejects.toThrow(
      'Error al procesar el pago (500)',
    );
  });

  it('throws when the response body is missing id/status', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({}));

    await expect(createTransaction(payload)).rejects.toThrow(
      'Respuesta de transacción inválida',
    );
  });

  it('surfaces a timeout message when the request aborts', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    global.fetch = jest.fn().mockRejectedValue(abortError);

    await expect(createTransaction(payload)).rejects.toThrow(
      'Tiempo de espera agotado al procesar el pago',
    );
  });

  it('surfaces the underlying error message on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network down'));

    await expect(createTransaction(payload)).rejects.toThrow('Network down');
  });

  it('surfaces a generic message for non-Error network failures', async () => {
    global.fetch = jest.fn().mockRejectedValue('nope');

    await expect(createTransaction(payload)).rejects.toThrow(
      'No se pudo conectar con la API',
    );
  });
});

describe('fetchTransaction', () => {
  afterEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockReset?.();
  });

  it('returns a normalized transaction on success', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        id: 'txn-2',
        status: 'PENDING',
        amount: 5000,
        currency: 'COP',
        paymentRef: 'ref-2',
        cardLast4: '8812',
      }),
    );

    const result = await fetchTransaction('txn-2');
    expect(result.status).toBe('PENDING');
  });

  it('throws when the response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({}, false, 404));

    await expect(fetchTransaction('missing')).rejects.toThrow(
      'Error al procesar el pago (404)',
    );
  });

  it('throws when the response body is invalid', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(null));

    await expect(fetchTransaction('txn-3')).rejects.toThrow(
      'Respuesta de transacción inválida',
    );
  });

  it('surfaces a timeout message when the request aborts', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    global.fetch = jest.fn().mockRejectedValue(abortError);

    await expect(fetchTransaction('txn-4')).rejects.toThrow(
      'Tiempo de espera agotado al consultar la transacción',
    );
  });

  it('surfaces a generic message for non-Error network failures', async () => {
    global.fetch = jest.fn().mockRejectedValue('nope');

    await expect(fetchTransaction('txn-5')).rejects.toThrow(
      'No se pudo conectar con la API',
    );
  });
});

describe('receiptHtmlUrl', () => {
  it('builds an absolute receipt URL', () => {
    expect(receiptHtmlUrl('txn-1')).toContain(
      '/api/transactions/txn-1/receipt?format=html',
    );
  });
});

describe('fetchTransactionReceipt', () => {
  afterEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockReset?.();
  });

  it('returns the receipt on success', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
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
      }),
    );

    const receipt = await fetchTransactionReceipt('txn-1');
    expect(receipt.receiptNumber).toBe('R-1');
  });

  it('throws when the response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({}, false, 404));

    await expect(fetchTransactionReceipt('missing')).rejects.toThrow(
      'Error al procesar el pago (404)',
    );
  });

  it('throws when the receipt body is invalid', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({}));

    await expect(fetchTransactionReceipt('txn-1')).rejects.toThrow(
      'Respuesta de recibo inválida',
    );
  });

  it('surfaces a timeout message when the request aborts', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    global.fetch = jest.fn().mockRejectedValue(abortError);

    await expect(fetchTransactionReceipt('txn-1')).rejects.toThrow(
      'Tiempo de espera agotado al obtener el recibo',
    );
  });

  it('rejects when the response json body cannot be parsed', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: jest.fn().mockRejectedValue(new Error('bad json')),
    } as unknown as Response);

    await expect(fetchTransactionReceipt('txn-1')).rejects.toThrow(
      'Error al procesar el pago (502)',
    );
  });
});
