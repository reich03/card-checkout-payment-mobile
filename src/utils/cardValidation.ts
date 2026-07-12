import type { CardBrand } from '../types/payment';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCardNumber(value: string): string {
  const digits = onlyDigits(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function detectCardBrand(cardNumber: string): CardBrand | null {
  const digits = onlyDigits(cardNumber);
  if (digits.startsWith('4')) {
    return 'visa';
  }
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(digits)) {
    return 'mastercard';
  }
  return null;
}

/** Luhn algorithm — returns true when the number is valid. */
export function luhnCheck(cardNumber: string): boolean {
  const digits = onlyDigits(cardNumber);
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function isExpiryValid(
  expiry: string,
  referenceDate: Date = new Date(),
): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry.trim());
  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) {
    return false;
  }

  const expiryEnd = new Date(year, month, 0, 23, 59, 59, 999);
  return referenceDate <= expiryEnd;
}

export function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isCvvValid(cvv: string, brand: CardBrand | null): boolean {
  const digits = onlyDigits(cvv);
  if (brand === 'mastercard' || brand === 'visa') {
    return digits.length === 3;
  }
  return digits.length === 3 || digits.length === 4;
}

export function brandLabel(brand: CardBrand): string {
  return brand === 'visa' ? 'Visa' : 'Mastercard';
}
