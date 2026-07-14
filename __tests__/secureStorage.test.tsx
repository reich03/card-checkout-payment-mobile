import EncryptedStorage from 'react-native-encrypted-storage';
import {
  clearPersistedSession,
  loadPersistedCart,
  loadPersistedPayment,
  savePersistedCart,
  savePersistedPayment,
} from '../src/services/secureStorage';

const mockedStorage = EncryptedStorage as jest.Mocked<typeof EncryptedStorage>;

beforeEach(() => {
  mockedStorage.getItem.mockReset();
  mockedStorage.setItem.mockReset();
  mockedStorage.removeItem.mockReset();
});

describe('loadPersistedPayment / loadPersistedCart', () => {
  it('returns parsed JSON when a value is stored', async () => {
    const payment = {
      savedCards: [],
      draftSelectedCardId: null,
      selectedCard: null,
      customerEmail: null,
      installments: 1,
    };
    mockedStorage.getItem.mockResolvedValue(JSON.stringify(payment));

    await expect(loadPersistedPayment()).resolves.toEqual(payment);
  });

  it('returns null when nothing is stored', async () => {
    mockedStorage.getItem.mockResolvedValue(null);

    await expect(loadPersistedCart()).resolves.toBeNull();
  });

  it('returns null when the stored value is corrupt JSON', async () => {
    mockedStorage.getItem.mockResolvedValue('{not-json');

    await expect(loadPersistedPayment()).resolves.toBeNull();
  });

  it('returns null when the underlying storage throws', async () => {
    mockedStorage.getItem.mockRejectedValue(new Error('boom'));

    await expect(loadPersistedCart()).resolves.toBeNull();
  });
});

describe('savePersistedPayment / savePersistedCart', () => {
  it('writes serialized JSON to storage', async () => {
    await savePersistedPayment({
      savedCards: [],
      draftSelectedCardId: null,
      selectedCard: null,
      customerEmail: 'a@b.com',
      installments: 1,
    });

    expect(mockedStorage.setItem).toHaveBeenCalledWith(
      'greenpay.payment.v1',
      expect.stringContaining('a@b.com'),
    );
  });

  it('writes cart snapshots to storage', async () => {
    await savePersistedCart({ items: [] });

    expect(mockedStorage.setItem).toHaveBeenCalledWith(
      'greenpay.cart.v1',
      JSON.stringify({ items: [] }),
    );
  });

  it('swallows storage write errors', async () => {
    mockedStorage.setItem.mockRejectedValue(new Error('disk full'));

    await expect(
      savePersistedCart({ items: [] }),
    ).resolves.toBeUndefined();
  });
});

describe('clearPersistedSession', () => {
  it('removes both persisted keys', async () => {
    await clearPersistedSession();

    expect(mockedStorage.removeItem).toHaveBeenCalledWith('greenpay.payment.v1');
    expect(mockedStorage.removeItem).toHaveBeenCalledWith('greenpay.cart.v1');
  });

  it('swallows errors while clearing', async () => {
    mockedStorage.removeItem.mockRejectedValue(new Error('nope'));

    await expect(clearPersistedSession()).resolves.toBeUndefined();
  });
});
