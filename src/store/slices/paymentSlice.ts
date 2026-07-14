import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_SAVED_CARDS } from '../../services/mockCards';
import type { TransactionResult } from '../../services/transactionsApi';
import type { PersistedPayment } from '../../services/secureStorage';
import type { ChargeableCard, SavedCard } from '../../types/payment';

export type PaymentFlowStatus =
  | 'idle'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'pending';

export interface PaymentState {
  savedCards: SavedCard[];
  draftSelectedCardId: string | null;
  selectedCard: SavedCard | null;
  chargeableCard: ChargeableCard | null;
  customerEmail: string | null;
  installments: number;
  lastTransaction: TransactionResult | null;
  status: PaymentFlowStatus;
  error: string | null;
}

const SANDBOX_VISA_CHARGEABLE: ChargeableCard = {
  number: '4242424242424242',
  holderName: 'APPROVED',
  expMonth: '12',
  expYear: '30',
  cvv: '123',
  installments: 1,
};

const initialState: PaymentState = {
  savedCards: MOCK_SAVED_CARDS,
  draftSelectedCardId: MOCK_SAVED_CARDS[0]?.id ?? null,
  selectedCard: null,
  chargeableCard: null,
  customerEmail: null,
  installments: 1,
  lastTransaction: null,
  status: 'idle',
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    selectDraftCard(state, action: PayloadAction<string>) {
      state.draftSelectedCardId = action.payload;
    },
    confirmPaymentMethod(state) {
      const card = state.savedCards.find(
        (entry) => entry.id === state.draftSelectedCardId,
      );
      state.selectedCard = card ?? null;

      if (!card) {
        state.chargeableCard = null;
        return;
      }

      if (state.chargeableCard?.number.slice(-4) === card.last4) {
        return;
      }

      if (card.last4 === '4242') {
        state.chargeableCard = {
          ...SANDBOX_VISA_CHARGEABLE,
          installments: state.installments || 1,
        };
        return;
      }

      state.chargeableCard = null;
    },
    addSavedCard(
      state,
      action: PayloadAction<{
        card: SavedCard;
        email: string;
        installments: number;
        chargeable: ChargeableCard;
      }>,
    ) {
      state.savedCards.unshift(action.payload.card);
      state.draftSelectedCardId = action.payload.card.id;
      state.selectedCard = action.payload.card;
      state.customerEmail = action.payload.email;
      state.installments = action.payload.installments;
      state.chargeableCard = action.payload.chargeable;
    },
    removeSavedCard(state, action: PayloadAction<string>) {
      const cardId = action.payload;
      state.savedCards = state.savedCards.filter((card) => card.id !== cardId);

      if (state.draftSelectedCardId === cardId) {
        state.draftSelectedCardId = state.savedCards[0]?.id ?? null;
      }

      if (state.selectedCard?.id === cardId) {
        state.selectedCard = null;
        state.chargeableCard = null;
      }
    },
    clearPaymentMethod(state) {
      state.selectedCard = null;
      state.chargeableCard = null;
    },
    paymentStarted(state) {
      state.status = 'processing';
      state.error = null;
    },
    paymentSucceeded(state, action: PayloadAction<TransactionResult>) {
      state.lastTransaction = action.payload;
      if (action.payload.status === 'APPROVED') {
        state.status = 'succeeded';
        state.error = null;
        return;
      }
      if (action.payload.status === 'PENDING') {
        state.status = 'pending';
        state.error = null;
        return;
      }
      state.status = 'failed';
      state.error =
        action.payload.message ?? 'No se pudo completar el pago';
    },
    paymentFailed(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
    paymentResetStatus(state) {
      state.status = 'idle';
      state.error = null;
    },
    clearLastTransaction(state) {
      state.lastTransaction = null;
      state.status = 'idle';
      state.error = null;
    },
    hydratePayment(state, action: PayloadAction<PersistedPayment>) {
      const payload = action.payload;
      if (payload.savedCards?.length) {
        state.savedCards = payload.savedCards;
      }
      state.draftSelectedCardId =
        payload.draftSelectedCardId ?? state.draftSelectedCardId;
      state.selectedCard = payload.selectedCard ?? null;
      state.customerEmail = payload.customerEmail ?? null;
      state.installments = payload.installments ?? 1;
      state.chargeableCard = null;
    },
  },
});

export const {
  selectDraftCard,
  confirmPaymentMethod,
  addSavedCard,
  removeSavedCard,
  clearPaymentMethod,
  paymentStarted,
  paymentSucceeded,
  paymentFailed,
  paymentResetStatus,
  clearLastTransaction,
  hydratePayment,
} = paymentSlice.actions;

export const selectSelectedCard = (state: { payment: PaymentState }) =>
  state.payment.selectedCard;

export const selectDraftSelectedCardId = (state: { payment: PaymentState }) =>
  state.payment.draftSelectedCardId;

export const selectSavedCards = (state: { payment: PaymentState }) =>
  state.payment.savedCards;

export const selectCustomerEmail = (state: { payment: PaymentState }) =>
  state.payment.customerEmail;

export const selectInstallments = (state: { payment: PaymentState }) =>
  state.payment.installments;

export const selectChargeableCard = (state: { payment: PaymentState }) =>
  state.payment.chargeableCard;

export const selectLastTransaction = (state: { payment: PaymentState }) =>
  state.payment.lastTransaction;

export const selectPaymentStatus = (state: { payment: PaymentState }) =>
  state.payment.status;

export const selectPaymentError = (state: { payment: PaymentState }) =>
  state.payment.error;

export default paymentSlice.reducer;
