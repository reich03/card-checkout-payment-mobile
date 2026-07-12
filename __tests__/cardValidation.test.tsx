import {
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  isEmailValid,
  isExpiryValid,
  luhnCheck,
} from '../src/utils/cardValidation';

describe('cardValidation', () => {
  it('formats card number in groups of 4', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('formats expiry as MM/YY', () => {
    expect(formatExpiry('0828')).toBe('08/28');
  });

  it('detects Visa and Mastercard by BIN', () => {
    expect(detectCardBrand('4242424242424242')).toBe('visa');
    expect(detectCardBrand('5555555555554444')).toBe('mastercard');
    expect(detectCardBrand('1234')).toBeNull();
  });

  it('validates numbers with Luhn', () => {
    expect(luhnCheck('4242424242424242')).toBe(true);
    expect(luhnCheck('4242424242424243')).toBe(false);
  });

  it('validates expiry against a reference date', () => {
    expect(isExpiryValid('12/26', new Date(2026, 6, 12))).toBe(true);
    expect(isExpiryValid('01/20', new Date(2026, 6, 12))).toBe(false);
    expect(isExpiryValid('13/26')).toBe(false);
  });

  it('validates emails', () => {
    expect(isEmailValid('user@example.com')).toBe(true);
    expect(isEmailValid('camilo.gomez@invalid')).toBe(false);
  });
});
