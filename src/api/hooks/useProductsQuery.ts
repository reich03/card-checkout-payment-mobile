import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../services/productsApi';
import type { Product } from '../../types/product';
import { queryKeys } from '../queryClient';

export function useProductsQuery() {
  return useQuery<Product[], Error>({
    queryKey: queryKeys.products,
    queryFn: fetchProducts,
  });
}
