import {
  hydrateStoreFromSecureStorage,
  subscribeSecurePersistence,
} from '../src/store/persist';
import * as secureStorage from '../src/services/secureStorage';
import { hydrateCart } from '../src/store/slices/cartSlice';
import { hydratePayment } from '../src/store/slices/paymentSlice';
import type { RootState } from '../src/store';

jest.mock('../src/services/secureStorage');

const mockedSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

function buildState(overrides: Partial<RootState> = {}): RootState {
  return {
    cart: { items: [] },
    payment: {
      savedCards: [],
      draftSelectedCardId: null,
      selectedCard: null,
      chargeableCard: null,
      customerEmail: null,
      installments: 1,
      lastTransaction: null,
      status: 'idle',
      error: null,
    },
    ...overrides,
  } as RootState;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('hydrateStoreFromSecureStorage', () => {
  it('dispatches hydration actions when persisted data exists', async () => {
    const payment = {
      savedCards: [],
      draftSelectedCardId: null,
      selectedCard: null,
      customerEmail: 'user@example.com',
      installments: 2,
    };
    const cart = { items: [] };
    mockedSecureStorage.loadPersistedPayment.mockResolvedValue(payment);
    mockedSecureStorage.loadPersistedCart.mockResolvedValue(cart);

    const dispatch = jest.fn();
    await hydrateStoreFromSecureStorage(dispatch as never);

    expect(dispatch).toHaveBeenCalledWith(hydratePayment(payment));
    expect(dispatch).toHaveBeenCalledWith(hydrateCart(cart));
  });

  it('does not dispatch when nothing is persisted', async () => {
    mockedSecureStorage.loadPersistedPayment.mockResolvedValue(null);
    mockedSecureStorage.loadPersistedCart.mockResolvedValue(null);

    const dispatch = jest.fn();
    await hydrateStoreFromSecureStorage(dispatch as never);

    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe('subscribeSecurePersistence', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces and persists only changed slices', () => {
    let state = buildState();
    const getState = () => state;
    const onChange = subscribeSecurePersistence(getState);

    // No changes yet: trigger without mutating state.
    onChange();
    jest.advanceTimersByTime(400);
    expect(mockedSecureStorage.savePersistedPayment).not.toHaveBeenCalled();
    expect(mockedSecureStorage.savePersistedCart).not.toHaveBeenCalled();

    state = buildState({
      payment: { ...state.payment, customerEmail: 'new@example.com' },
    });
    onChange();
    jest.advanceTimersByTime(400);

    expect(mockedSecureStorage.savePersistedPayment).toHaveBeenCalledTimes(1);
    expect(mockedSecureStorage.savePersistedCart).not.toHaveBeenCalled();
  });

  it('clears the pending timer and only persists once for rapid changes', () => {
    let state = buildState();
    const getState = () => state;
    const onChange = subscribeSecurePersistence(getState);

    state = buildState({
      cart: { items: [{ product: { id: 'p1' } as never, quantity: 1 }] },
    });
    onChange();
    jest.advanceTimersByTime(100);

    state = buildState({
      cart: { items: [{ product: { id: 'p1' } as never, quantity: 2 }] },
    });
    onChange();
    jest.advanceTimersByTime(350);

    expect(mockedSecureStorage.savePersistedCart).toHaveBeenCalledTimes(1);
    expect(mockedSecureStorage.savePersistedCart).toHaveBeenCalledWith(
      state.cart,
    );
  });
});
