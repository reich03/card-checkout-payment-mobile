export type MockTransactionStatus = 'APPROVED' | 'DECLINED' | 'PENDING';

export interface MockTransactionResult {
  id: string;
  status: MockTransactionStatus;
  amount: number;
  currency: string;
  paymentRef: string;
  cardLast4: string;
  createdAt: string;
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
  options?: {
    /** Network-style failure → toast on Payment Summary */
    fail?: boolean;
    /** Terminal status when the mock “API” responds */
    outcome?: MockTransactionStatus;
  },
): Promise<MockTransactionResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  if (options?.fail) {
    throw new Error('El pago fue rechazado por el emisor (simulación).');
  }

  const status = options?.outcome ?? 'APPROVED';
  const id = `tx-mock-${Date.now()}`;
  const paymentRef = String(100000 + Math.floor(Math.random() * 900000));

  const messages: Record<MockTransactionStatus, string> = {
    APPROVED: 'Pago aprobado (mock)',
    DECLINED: 'El banco rechazó la transacción (mock)',
    PENDING: 'El pago está en proceso (mock)',
  };

  return {
    id,
    status,
    amount: input.amount,
    currency: input.currency,
    paymentRef,
    cardLast4: input.cardLast4,
    createdAt: new Date().toISOString(),
    message: messages[status],
  };
}
