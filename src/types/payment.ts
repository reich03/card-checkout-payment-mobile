export type CardBrand = 'visa' | 'mastercard';

export interface SavedCard {
  id: string;
  brand: CardBrand;
  label: string;
  last4: string;
  expMonth: string;
  expYear: string;
}
