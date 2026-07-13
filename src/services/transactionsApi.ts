import { apiUrl } from '../config/env';

export type TransactionStatus = 'APPROVED' | 'DECLINED' | 'PENDING';

export interface TransactionResult {
  id: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  paymentRef: string | null;
  cardLast4: string;
  createdAt: string;
  updatedAt?: string;
  message?: string;
}

export interface CreateTransactionPayload {
  products: Array<{ productId: string; quantity: number }>;
  card: {
    number: string;
    holderName: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    installments: number;
  };
  customerEmail: string;
  currency?: string;
}

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

function extractErrorMessage(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const typed = body as ApiErrorBody;
    if (Array.isArray(typed.message)) {
      return typed.message.join(', ');
    }
    if (typeof typed.message === 'string' && typed.message.trim()) {
      return typed.message;
    }
    if (typeof typed.error === 'string' && typed.error.trim()) {
      return typed.error;
    }
  }
  return `Error al procesar el pago (${status})`;
}

export async function createTransaction(
  payload: CreateTransactionPayload,
): Promise<TransactionResult> {
  const response = await fetch(apiUrl('/api/transactions'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      products: payload.products,
      card: payload.card,
      customerEmail: payload.customerEmail,
      currency: payload.currency ?? 'COP',
    }),
  });

  const body = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, response.status));
  }

  const result = body as TransactionResult;
  if (!result?.id || !result?.status) {
    throw new Error('Respuesta de transacción inválida');
  }

  return {
    ...result,
    paymentRef: result.paymentRef ?? result.id,
    createdAt: result.createdAt ?? new Date().toISOString(),
  };
}
