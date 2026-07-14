import { fetchProducts } from '../src/services/productsApi';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('fetchProducts', () => {
  afterEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockReset?.();
  });

  it('maps API products into the Product shape', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse([
        {
          id: 'prod-1',
          name: 'Café',
          description: 'Tueste medio',
          price: '45000',
          stock: '10',
          imageUrl: 'https://example.com/coffee.jpg',
        },
      ]),
    );

    const products = await fetchProducts();

    expect(products).toEqual([
      {
        id: 'prod-1',
        name: 'Café',
        description: 'Tueste medio',
        price: 45000,
        stock: 10,
        imageUrl: 'https://example.com/coffee.jpg',
      },
    ]);
  });

  it('throws when the response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse([], false, 500));

    await expect(fetchProducts()).rejects.toThrow(
      'No se pudieron cargar los productos (500)',
    );
  });

  it('throws when the response body is not an array', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ not: 'array' }));

    await expect(fetchProducts()).rejects.toThrow(
      'Respuesta de productos inválida',
    );
  });

  it('surfaces a timeout message when the request aborts', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    global.fetch = jest.fn().mockRejectedValue(abortError);

    await expect(fetchProducts()).rejects.toThrow(
      'Tiempo de espera agotado al cargar productos',
    );
  });

  it('surfaces the underlying error message on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    await expect(fetchProducts()).rejects.toThrow('offline');
  });

  it('surfaces a generic message for non-Error network failures', async () => {
    global.fetch = jest.fn().mockRejectedValue('nope');

    await expect(fetchProducts()).rejects.toThrow(
      'No se pudo conectar con la API',
    );
  });
});
