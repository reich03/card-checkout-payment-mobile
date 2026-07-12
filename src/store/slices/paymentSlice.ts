import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MOCK_SAVED_CARDS } from '../../services/mockCards';
import type { SavedCard } from '../../types/payment';

export interface PaymentState {
  savedCards: SavedCard[];
  draftSelectedCardId: string | null;
  selectedCard: SavedCard | null;
  customerEmail: string | null;
  installments: number;
  transaction: unknown | null;
  status: 'idle' | 'processing' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PaymentState = {
  savedCards: MOCK_SAVED_CARDS,
  draftSelectedCardId: MOCK_SAVED_CARDS[0]?.id ?? null,
  selectedCard: null,
  customerEmail: null,
  installments: 1,
  transaction: null,
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
    },
    addSavedCard(
      state,
      action: PayloadAction<{
        card: SavedCard;
        email: string;
        installments: number;
      }>,
    ) {
      state.savedCards.unshift(action.payload.card);
      state.draftSelectedCardId = action.payload.card.id;
      state.selectedCard = action.payload.card;
      state.customerEmail = action.payload.email;
      state.installments = action.payload.installments;
    },
    clearPaymentMethod(state) {
      state.selectedCard = null;
    },
  },
});

export const {
  selectDraftCard,
  confirmPaymentMethod,
  addSavedCard,
  clearPaymentMethod,
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

export default paymentSlice.reducer;
