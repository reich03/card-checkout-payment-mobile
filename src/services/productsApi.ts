import { apiUrl } from '../config/env';
import type { Product } from '../types/product';

type ApiProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
};

function toProduct(item: ApiProduct): Product {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    stock: Number(item.stock),
    imageUrl: item.imageUrl,
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 15000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** GET /api/products */
export async function fetchProducts(): Promise<Product[]> {
  const url = apiUrl('/api/products');

  let response: Response;
  try {
    response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Tiempo de espera agotado al cargar productos'
        : error instanceof Error
          ? error.message
          : 'No se pudo conectar con la API';
    throw new Error(message);
  }

  if (!response.ok) {
    throw new Error(`No se pudieron cargar los productos (${response.status})`);
  }

  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error('Respuesta de productos inválida');
  }

  return (data as ApiProduct[]).map(toProduct);
}
