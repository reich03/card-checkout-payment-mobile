import { PlaceholderScreen } from './PlaceholderScreen';

/** Full-screen route kept for navigation typing; UI lives in PaymentSummarySheet (M-07). */
export function PaymentSummaryScreen() {
  return (
    <PlaceholderScreen
      title="Payment Summary"
      subtitle="Se abre como bottom sheet desde Checkout"
    />
  );
}
