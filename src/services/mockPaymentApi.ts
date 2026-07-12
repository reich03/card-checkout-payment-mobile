export type MockTransactionStatus = 'APPROVED' | 'DECLINED' | 'PENDING';

export interface MockTransactionResult {
  id: string;
  status: MockTransactionStatus;
  amount: number;
  currency: string;
  paymentRef: string;
  cardLast4: string;
  message?: string;
}

export interface MockCreateTransactionInput {
  amount: number;
  currency: string;
  customerEmail: string;
  cardLast4: string;
  installments: number;
  products: Array<{ productId: string; quantity: number; unitPrice: number }>;
}

const MOCK_LATENCY_MS = 2200;

/**
 * Simulates POST /api/transactions until the Nest API is deployed on AWS.
 * Swap this for a real fetch later.
 */
export async function mockCreateTransaction(
  input: MockCreateTransactionInput,
  options?: { fail?: boolean },
): Promise<MockTransactionResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  if (options?.fail) {
    throw new Error('El pago fue rechazado por el emisor (simulación).');
  }

  const id = `tx-mock-${Date.now()}`;
  return {
    id,
    status: 'APPROVED',
    amount: input.amount,
    currency: input.currency,
    paymentRef: `pay_${id}`,
    cardLast4: input.cardLast4,
    message: 'Pago aprobado (mock)',
  };
}
