import paymentReducer, {
  confirmPaymentMethod,
  removeSavedCard,
  selectDraftCard,
  selectSelectedCard,
} from '../src/store/slices/paymentSlice';

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
