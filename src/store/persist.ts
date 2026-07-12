import type { AppDispatch, RootState } from '../store';
import { hydrateCart } from '../store/slices/cartSlice';
import { hydratePayment } from '../store/slices/paymentSlice';
import {
  loadPersistedCart,
  loadPersistedPayment,
  savePersistedCart,
  savePersistedPayment,
  type PersistedCart,
  type PersistedPayment,
} from '../services/secureStorage';

let persistTimer: ReturnType<typeof setTimeout> | null = null;

export async function hydrateStoreFromSecureStorage(
  dispatch: AppDispatch,
): Promise<void> {
  const [payment, cart] = await Promise.all([
    loadPersistedPayment(),
    loadPersistedCart(),
  ]);

  if (payment) {
    dispatch(hydratePayment(payment));
  }
  if (cart) {
    dispatch(hydrateCart(cart));
  }
}

function paymentSnapshot(state: RootState): PersistedPayment {
  return {
    savedCards: state.payment.savedCards,
    draftSelectedCardId: state.payment.draftSelectedCardId,
    selectedCard: state.payment.selectedCard,
    customerEmail: state.payment.customerEmail,
    installments: state.payment.installments,
  };
}

function cartSnapshot(state: RootState): PersistedCart {
  return { items: state.cart.items };
}

/** Debounced encrypted persistence for cart + payment method data. */
export function subscribeSecurePersistence(
  getState: () => RootState,
): () => void {
  let previousPayment = JSON.stringify(paymentSnapshot(getState()));
  let previousCart = JSON.stringify(cartSnapshot(getState()));

  return () => {
    if (persistTimer) {
      clearTimeout(persistTimer);
    }

    persistTimer = setTimeout(() => {
      const state = getState();
      const nextPayment = JSON.stringify(paymentSnapshot(state));
      const nextCart = JSON.stringify(cartSnapshot(state));

      if (nextPayment !== previousPayment) {
        previousPayment = nextPayment;
        void savePersistedPayment(paymentSnapshot(state));
      }
      if (nextCart !== previousCart) {
        previousCart = nextCart;
        void savePersistedCart(cartSnapshot(state));
      }
    }, 350);
  };
}
