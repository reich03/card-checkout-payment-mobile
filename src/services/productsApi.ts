import type { Product } from '../types/product';

/** Mock catalog used until the backend is deployed on AWS. */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-cafe-especial',
    name: 'Café Especial',
    description: 'Granos premium de origen colombiano',
    price: 45000,
    stock: 40,
    imageUrl:
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
  },
  {
    id: 'prod-taza-artesanal',
    name: 'Taza Artesanal',
    description: 'Cerámica hecha a mano',
    price: 32500,
    stock: 25,
    imageUrl:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80',
  },
  {
    id: 'prod-prensa-francesa',
    name: 'Prensa Francesa',
    description: 'Acero inoxidable con acentos green',
    price: 89900,
    stock: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
  },
  {
    id: 'prod-filtros-organicos',
    name: 'Filtros Orgánicos',
    description: 'Algodón orgánico reutilizable',
    price: 18000,
    stock: 60,
    imageUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  },
];

const MOCK_LATENCY_MS = 1400;

/**
 * Simulates GET /api/products until the Nest API is live.
 * Swap the body for a real fetch when AWS is ready.
 */
export async function fetchProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  return MOCK_PRODUCTS.map((product) => ({ ...product }));
}
