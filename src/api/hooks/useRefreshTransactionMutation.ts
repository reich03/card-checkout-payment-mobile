import { useMutation } from '@tanstack/react-query';
import {
  fetchTransaction,
  type TransactionResult,
} from '../../services/transactionsApi';
import { queryClient, queryKeys, refetchProductsCatalog } from '../queryClient';

export function useRefreshTransactionMutation() {
  return useMutation({
    mutationFn: (id: string) => fetchTransaction(id),
    onSuccess: async (result: TransactionResult) => {
      queryClient.setQueryData(queryKeys.transaction(result.id), result);
      if (result.status === 'APPROVED' || result.status === 'DECLINED') {
        await refetchProductsCatalog();
      }
    },
  });
}
