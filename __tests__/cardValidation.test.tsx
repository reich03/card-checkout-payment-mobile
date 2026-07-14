import {
  brandLabel,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  isCvvValid,
  isEmailValid,
  isExpiryValid,
  luhnCheck,
  onlyDigits,
} from '../src/utils/cardValidation';

describe('cardValidation', () => {
  it('formats card number in groups of 4', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('formats expiry as MM/YY', () => {
    expect(formatExpiry('0828')).toBe('08/28');
  });

  it('leaves expiry unformatted while under 3 digits', () => {
    expect(formatExpiry('0')).toBe('0');
    expect(formatExpiry('08')).toBe('08');
  });

  it('strips non-digits with onlyDigits', () => {
    expect(onlyDigits('42-42 42/42')).toBe('42424242');
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

  it('rejects Luhn numbers with an invalid length', () => {
    expect(luhnCheck('123')).toBe(false);
    expect(luhnCheck('12345678901234567890')).toBe(false);
  });

  it('doubles digits above 9 by subtracting 9 in Luhn', () => {
    // Luhn-valid 16-digit number whose doubled digits exceed 9.
    expect(luhnCheck('4532015112830366')).toBe(true);
  });

  it('validates expiry against a reference date', () => {
    expect(isExpiryValid('12/26', new Date(2026, 6, 12))).toBe(true);
    expect(isExpiryValid('01/20', new Date(2026, 6, 12))).toBe(false);
    expect(isExpiryValid('13/26')).toBe(false);
  });

  it('rejects expiry strings that do not match MM/YY', () => {
    expect(isExpiryValid('not-a-date')).toBe(false);
    expect(isExpiryValid('')).toBe(false);
  });

  it('validates emails', () => {
    expect(isEmailValid('user@example.com')).toBe(true);
    expect(isEmailValid('camilo.gomez@invalid')).toBe(false);
  });

  it('validates cvv length based on brand', () => {
    expect(isCvvValid('123', 'visa')).toBe(true);
    expect(isCvvValid('1234', 'visa')).toBe(false);
    expect(isCvvValid('123', 'mastercard')).toBe(true);
    expect(isCvvValid('1234', 'mastercard')).toBe(false);
    expect(isCvvValid('123', null)).toBe(true);
    expect(isCvvValid('1234', null)).toBe(true);
    expect(isCvvValid('12', null)).toBe(false);
  });

  it('labels brands in Spanish-friendly display text', () => {
    expect(brandLabel('visa')).toBe('Visa');
    expect(brandLabel('mastercard')).toBe('Mastercard');
  });
});
