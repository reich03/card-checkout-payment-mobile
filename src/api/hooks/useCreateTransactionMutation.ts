import { useMutation } from '@tanstack/react-query';
import {
  createTransaction,
  type CreateTransactionPayload,
  type TransactionResult,
} from '../../services/transactionsApi';
import { queryKeys, refetchProductsCatalog } from '../queryClient';
import { queryClient } from '../queryClient';

export function useCreateTransactionMutation() {
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      createTransaction(payload),
    onSuccess: async (result: TransactionResult) => {
      queryClient.setQueryData(queryKeys.transaction(result.id), result);
      // Stock only changes on APPROVED; still refresh so Home shows latest.
      if (
        result.status === 'APPROVED' ||
        result.status === 'PENDING' ||
        result.status === 'DECLINED'
      ) {
        await refetchProductsCatalog();
      }
    },
  });
}
