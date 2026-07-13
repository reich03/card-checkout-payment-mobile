import EncryptedStorage from 'react-native-encrypted-storage';
import type { CartItem } from '../store/slices/cartSlice';
import type { SavedCard } from '../types/payment';

const PAYMENT_KEY = 'greenpay.payment.v1';
const CART_KEY = 'greenpay.cart.v1';

export type PersistedPayment = {
  savedCards: SavedCard[];
  draftSelectedCardId: string | null;
  selectedCard: SavedCard | null;
  customerEmail: string | null;
  installments: number;
};

export type PersistedCart = {
  items: CartItem[];
};

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await EncryptedStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await EncryptedStorage.setItem(key, JSON.stringify(value));
  } catch {
    //
  }
}

export async function loadPersistedPayment(): Promise<PersistedPayment | null> {
  return readJson<PersistedPayment>(PAYMENT_KEY);
}

export async function savePersistedPayment(
  payload: PersistedPayment,
): Promise<void> {
  await writeJson(PAYMENT_KEY, payload);
}

export async function loadPersistedCart(): Promise<PersistedCart | null> {
  return readJson<PersistedCart>(CART_KEY);
}

export async function savePersistedCart(payload: PersistedCart): Promise<void> {
  await writeJson(CART_KEY, payload);
}

export async function clearPersistedSession(): Promise<void> {
  try {
    await EncryptedStorage.removeItem(PAYMENT_KEY);
    await EncryptedStorage.removeItem(CART_KEY);
  } catch {
    // no-op
  }
}
