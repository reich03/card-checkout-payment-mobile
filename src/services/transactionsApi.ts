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

export interface TransactionReceipt {
  receiptNumber: string;
  transactionId: string;
  paymentRef: string | null;
  status: TransactionStatus;
  issuedAt: string;
  currency: string;
  amount: number;
  cardLast4: string;
  merchant: {
    name: string;
    tagline: string;
  };
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  htmlUrl?: string;
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

/** POST /api/transactions */
export async function createTransaction(
  payload: CreateTransactionPayload,
): Promise<TransactionResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch(apiUrl('/api/transactions'), {
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
      signal: controller.signal,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Tiempo de espera agotado al procesar el pago'
        : error instanceof Error
          ? error.message
          : 'No se pudo conectar con la API';
    throw new Error(message);
  } finally {
    clearTimeout(timer);
  }

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

/** GET /api/transactions/:id */
export async function fetchTransaction(
  id: string,
): Promise<TransactionResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(apiUrl(`/api/transactions/${encodeURIComponent(id)}`), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Tiempo de espera agotado al consultar la transacción'
        : error instanceof Error
          ? error.message
          : 'No se pudo conectar con la API';
    throw new Error(message);
  } finally {
    clearTimeout(timer);
  }

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

/** Absolute URL for printable HTML receipt. */
export function receiptHtmlUrl(transactionId: string): string {
  return apiUrl(
    `/api/transactions/${encodeURIComponent(transactionId)}/receipt?format=html`,
  );
}

/** GET /api/transactions/:id/receipt */
export async function fetchTransactionReceipt(
  id: string,
): Promise<TransactionReceipt> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(
      apiUrl(`/api/transactions/${encodeURIComponent(id)}/receipt`),
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Tiempo de espera agotado al obtener el recibo'
        : error instanceof Error
          ? error.message
          : 'No se pudo conectar con la API';
    throw new Error(message);
  } finally {
    clearTimeout(timer);
  }

  const body = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, response.status));
  }

  const receipt = body as TransactionReceipt;
  if (!receipt?.receiptNumber || !receipt?.transactionId) {
    throw new Error('Respuesta de recibo inválida');
  }

  return receipt;
}
