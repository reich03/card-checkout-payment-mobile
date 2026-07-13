import type { SavedCard } from '../types/payment';

export const MOCK_SAVED_CARDS: SavedCard[] = [
  {
    id: 'card-visa-4242',
    brand: 'visa',
    label: 'Visa Debito',
    last4: '4242',
    expMonth: '08',
    expYear: '26',
  },
  {
    id: 'card-mc-8812',
    brand: 'mastercard',
    label: 'Mastercard',
    last4: '8812',
    expMonth: '12',
    expYear: '27',
  },
];
