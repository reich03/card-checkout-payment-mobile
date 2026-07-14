import { useMutation } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import {
  fetchTransactionReceipt,
  receiptHtmlUrl,
  type TransactionReceipt,
} from '../../services/transactionsApi';

export function useOpenReceiptMutation() {
  return useMutation({
    mutationFn: async (transactionId: string): Promise<TransactionReceipt> => {
      const receipt = await fetchTransactionReceipt(transactionId);
      await WebBrowser.openBrowserAsync(receiptHtmlUrl(transactionId), {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        controlsColor: '#006c4a',
      });
      return receipt;
    },
  });
}
