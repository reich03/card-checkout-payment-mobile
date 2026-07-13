import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  products: ['products'] as const,
  transaction: (id: string) => ['transactions', id] as const,
};

export async function refetchProductsCatalog(): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.products });
  await queryClient.refetchQueries({ queryKey: queryKeys.products });
}
