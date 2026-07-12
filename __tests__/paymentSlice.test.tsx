import paymentReducer, {
  confirmPaymentMethod,
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
