import paymentReducer, {
  addSavedCard,
  clearLastTransaction,
  clearPaymentMethod,
  confirmPaymentMethod,
  hydratePayment,
  paymentFailed,
  paymentResetStatus,
  paymentStarted,
  paymentSucceeded,
  removeSavedCard,
  selectChargeableCard,
  selectCustomerEmail,
  selectDraftCard,
  selectDraftSelectedCardId,
  selectInstallments,
  selectLastTransaction,
  selectPaymentError,
  selectPaymentStatus,
  selectSavedCards,
  selectSelectedCard,
} from '../src/store/slices/paymentSlice';
import type { TransactionResult } from '../src/services/transactionsApi';

test('selects draft card and confirms payment method', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  expect(state.savedCards.length).toBeGreaterThan(0);

  const secondId = state.savedCards[1].id;
  state = paymentReducer(state, selectDraftCard(secondId));
  expect(state.draftSelectedCardId).toBe(secondId);

  state = paymentReducer(state, confirmPaymentMethod());
  expect(selectSelectedCard({ payment: state })?.id).toBe(secondId);
  expect(selectSelectedCard({ payment: state })?.last4).toBe('8812');
});

test('removes a saved card and clears selection if needed', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  const first = state.savedCards[0];
  const second = state.savedCards[1];

  state = paymentReducer(state, selectDraftCard(first.id));
  state = paymentReducer(state, confirmPaymentMethod());
  expect(state.selectedCard?.id).toBe(first.id);

  state = paymentReducer(state, removeSavedCard(first.id));

  expect(state.savedCards.find((card) => card.id === first.id)).toBeUndefined();
  expect(state.selectedCard).toBeNull();
  expect(state.chargeableCard).toBeNull();
  expect(state.draftSelectedCardId).toBe(second.id);
});

test('confirmPaymentMethod clears chargeable card when draft card is missing', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  state = paymentReducer(state, selectDraftCard('does-not-exist'));
  state = paymentReducer(state, confirmPaymentMethod());

  expect(state.selectedCard).toBeNull();
  expect(state.chargeableCard).toBeNull();
});

test('confirmPaymentMethod keeps chargeable card when re-confirming same last4', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  const visaId = state.savedCards[0].id;
  state = paymentReducer(state, selectDraftCard(visaId));
  state = paymentReducer(state, confirmPaymentMethod());
  const chargeableAfterFirst = state.chargeableCard;

  state = paymentReducer(state, confirmPaymentMethod());

  expect(state.chargeableCard).toBe(chargeableAfterFirst);
});

test('confirmPaymentMethod nulls chargeable card for non-sandbox cards', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  const mastercardId = state.savedCards[1].id;
  state = paymentReducer(state, selectDraftCard(mastercardId));
  state = paymentReducer(state, confirmPaymentMethod());

  expect(state.selectedCard?.id).toBe(mastercardId);
  expect(state.chargeableCard).toBeNull();
});

test('addSavedCard prepends a new card and sets it as selected', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  const newCard = {
    id: 'card-visa-9999',
    brand: 'visa' as const,
    label: 'Visa',
    last4: '9999',
    expMonth: '01',
    expYear: '30',
  };

  state = paymentReducer(
    state,
    addSavedCard({
      card: newCard,
      email: 'user@example.com',
      installments: 3,
      chargeable: {
        number: '4000000000009999',
        holderName: 'TEST USER',
        expMonth: '01',
        expYear: '30',
        cvv: '123',
        installments: 3,
      },
    }),
  );

  expect(state.savedCards[0]).toEqual(newCard);
  expect(state.draftSelectedCardId).toBe(newCard.id);
  expect(state.selectedCard).toEqual(newCard);
  expect(selectCustomerEmail({ payment: state })).toBe('user@example.com');
  expect(selectInstallments({ payment: state })).toBe(3);
  expect(selectChargeableCard({ payment: state })?.number).toBe(
    '4000000000009999',
  );
});

test('clearPaymentMethod resets selected and chargeable card', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  state = paymentReducer(state, selectDraftCard(state.savedCards[0].id));
  state = paymentReducer(state, confirmPaymentMethod());

  state = paymentReducer(state, clearPaymentMethod());

  expect(state.selectedCard).toBeNull();
  expect(state.chargeableCard).toBeNull();
});

test('paymentStarted marks status processing and clears error', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  state = paymentReducer(state, paymentFailed('boom'));
  state = paymentReducer(state, paymentStarted());

  expect(selectPaymentStatus({ payment: state })).toBe('processing');
  expect(selectPaymentError({ payment: state })).toBeNull();
});

test('paymentSucceeded handles APPROVED, PENDING and DECLINED statuses', () => {
  const base: TransactionResult = {
    id: 'txn-1',
    status: 'APPROVED',
    amount: 1000,
    currency: 'COP',
    paymentRef: 'ref-1',
    cardLast4: '4242',
    createdAt: new Date().toISOString(),
  };

  let state = paymentReducer(undefined, { type: 'unknown' });
  state = paymentReducer(state, paymentSucceeded(base));
  expect(selectPaymentStatus({ payment: state })).toBe('succeeded');
  expect(selectLastTransaction({ payment: state })).toEqual(base);

  state = paymentReducer(
    state,
    paymentSucceeded({ ...base, status: 'PENDING' }),
  );
  expect(selectPaymentStatus({ payment: state })).toBe('pending');

  state = paymentReducer(
    state,
    paymentSucceeded({ ...base, status: 'DECLINED', message: 'Fondos insuficientes' }),
  );
  expect(selectPaymentStatus({ payment: state })).toBe('failed');
  expect(selectPaymentError({ payment: state })).toBe('Fondos insuficientes');

  state = paymentReducer(
    state,
    paymentSucceeded({ ...base, status: 'DECLINED', message: undefined }),
  );
  expect(selectPaymentError({ payment: state })).toBe(
    'No se pudo completar el pago',
  );
});

test('paymentFailed sets failed status with a message', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  state = paymentReducer(state, paymentFailed('Tarjeta rechazada'));

  expect(selectPaymentStatus({ payment: state })).toBe('failed');
  expect(selectPaymentError({ payment: state })).toBe('Tarjeta rechazada');
});

test('paymentResetStatus and clearLastTransaction reset flow state', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  state = paymentReducer(state, paymentFailed('error'));
  state = paymentReducer(state, paymentResetStatus());
  expect(selectPaymentStatus({ payment: state })).toBe('idle');
  expect(selectPaymentError({ payment: state })).toBeNull();

  state = paymentReducer(
    state,
    paymentSucceeded({
      id: 'txn-2',
      status: 'APPROVED',
      amount: 500,
      currency: 'COP',
      paymentRef: null,
      cardLast4: '4242',
      createdAt: new Date().toISOString(),
    }),
  );
  state = paymentReducer(state, clearLastTransaction());
  expect(selectLastTransaction({ payment: state })).toBeNull();
  expect(selectPaymentStatus({ payment: state })).toBe('idle');
});

test('hydratePayment restores persisted data but never the chargeable card', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  const persistedCard = state.savedCards[1];

  state = paymentReducer(
    state,
    hydratePayment({
      savedCards: [persistedCard],
      draftSelectedCardId: persistedCard.id,
      selectedCard: persistedCard,
      customerEmail: 'saved@example.com',
      installments: 6,
    }),
  );

  expect(selectSavedCards({ payment: state })).toEqual([persistedCard]);
  expect(selectDraftSelectedCardId({ payment: state })).toBe(persistedCard.id);
  expect(selectSelectedCard({ payment: state })).toEqual(persistedCard);
  expect(selectCustomerEmail({ payment: state })).toBe('saved@example.com');
  expect(selectInstallments({ payment: state })).toBe(6);
  expect(selectChargeableCard({ payment: state })).toBeNull();
});

test('hydratePayment falls back to defaults when fields are missing', () => {
  let state = paymentReducer(undefined, { type: 'unknown' });
  const previousDraftId = state.draftSelectedCardId;

  state = paymentReducer(
    state,
    hydratePayment({
      savedCards: [],
      draftSelectedCardId: null,
      selectedCard: null,
      customerEmail: null,
      installments: undefined as unknown as number,
    }),
  );

  expect(selectSavedCards({ payment: state }).length).toBeGreaterThan(0);
  expect(selectDraftSelectedCardId({ payment: state })).toBe(previousDraftId);
  expect(selectInstallments({ payment: state })).toBe(1);
});
