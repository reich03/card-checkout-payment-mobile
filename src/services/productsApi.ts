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
    price: item.price,
    stock: item.stock,
    imageUrl: item.imageUrl,
  };
}

/** GET /api/products */
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(apiUrl('/api/products'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`No se pudieron cargar los productos (${response.status})`);
  }

  const data = (await response.json()) as ApiProduct[];
  if (!Array.isArray(data)) {
    throw new Error('Respuesta de productos inválida');
  }

  return data.map(toProduct);
}
