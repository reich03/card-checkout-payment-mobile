import { useMutation } from '@tanstack/react-query';
import {
  createTransaction,
  type CreateTransactionPayload,
  type TransactionResult,
} from '../../services/transactionsApi';
import { queryClient, queryKeys } from '../queryClient';

export function useCreateTransactionMutation() {
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      createTransaction(payload),
    onSuccess: (result: TransactionResult) => {
      queryClient.setQueryData(queryKeys.transaction(result.id), result);
      void queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}
