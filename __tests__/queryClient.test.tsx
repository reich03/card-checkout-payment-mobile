import { queryClient, queryKeys, refetchProductsCatalog } from '../src/api/queryClient';

test('exposes stable query keys', () => {
  expect(queryKeys.products).toEqual(['products']);
  expect(queryKeys.transaction('txn-1')).toEqual(['transactions', 'txn-1']);
});

test('refetchProductsCatalog invalidates and refetches the products query', async () => {
  const invalidateSpy = jest
    .spyOn(queryClient, 'invalidateQueries')
    .mockResolvedValue(undefined);
  const refetchSpy = jest
    .spyOn(queryClient, 'refetchQueries')
    .mockResolvedValue(undefined);

  await refetchProductsCatalog();

  expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.products });
  expect(refetchSpy).toHaveBeenCalledWith({ queryKey: queryKeys.products });

  invalidateSpy.mockRestore();
  refetchSpy.mockRestore();
});
