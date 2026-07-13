import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorToast } from './ErrorToast';
import { OrderSummaryItemCard } from './OrderSummaryItemCard';
import { createTransaction } from '../services/transactionsApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearCart,
  selectCartItems,
  selectCartTotal,
} from '../store/slices/cartSlice';
import {
  paymentFailed,
  paymentResetStatus,
  paymentStarted,
  paymentSucceeded,
  selectChargeableCard,
  selectCustomerEmail,
  selectInstallments,
  selectSelectedCard,
} from '../store/slices/paymentSlice';
import { formatCop } from '../utils/formatCurrency';
import { colors, radii, spacing } from '../theme/colors';

type Props = {
  onPaid: () => void;
  onDismiss?: () => void;
};

export const PaymentSummarySheet = forwardRef<BottomSheetModal, Props>(
  function PaymentSummarySheet({ onPaid, onDismiss }, ref) {
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['88%'], []);

    const items = useAppSelector(selectCartItems);
    const total = useAppSelector(selectCartTotal);
    const selectedCard = useAppSelector(selectSelectedCard);
    const chargeableCard = useAppSelector(selectChargeableCard);
    const installments = useAppSelector(selectInstallments);
    const customerEmail = useAppSelector(selectCustomerEmail);

    const [processing, setProcessing] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.45}
          pressBehavior={processing ? 'none' : 'close'}
        />
      ),
      [processing],
    );

    const showToast = (message: string) => {
      setToastMessage(message);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3200);
    };

    const handlePay = async () => {
      if (!selectedCard || processing) {
        return;
      }

      if (!chargeableCard) {
        showToast(
          'Añade una tarjeta nueva (o elige Visa **** 4242) para pagar.',
        );
        return;
      }

      setProcessing(true);
      dispatch(paymentStarted());

      try {
        const result = await createTransaction({
          customerEmail: customerEmail ?? 'cliente@greenpay.mock',
          currency: 'COP',
          products: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          card: {
            number: chargeableCard.number,
            holderName: chargeableCard.holderName,
            expMonth: chargeableCard.expMonth,
            expYear: chargeableCard.expYear,
            cvv: chargeableCard.cvv,
            installments: chargeableCard.installments || installments || 1,
          },
        });

        dispatch(paymentSucceeded(result));
        // Clear cart once payment is accepted by the API (approved or pending).
        if (result.status === 'APPROVED' || result.status === 'PENDING') {
          dispatch(clearCart());
        }
        setProcessing(false);
        onPaid();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo procesar el pago';
        dispatch(paymentFailed(message));
        setProcessing(false);
        showToast(message);
      }
    };

    const cardLabel = selectedCard
      ? `${selectedCard.brand === 'visa' ? 'Visa' : 'Mastercard'} **** ${selectedCard.last4}`
      : 'Sin método';

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={!processing}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheet}
        onDismiss={() => {
          dispatch(paymentResetStatus());
          onDismiss?.();
        }}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
        >
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalAmount}>{formatCop(total)} COP</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Resumen de compra</Text>
            <View style={styles.cardsList}>
              {items.map((item) => (
                <OrderSummaryItemCard key={item.product.id} item={item} />
              ))}
            </View>
            <View style={styles.shippingRow}>
              <View>
                <Text style={styles.shippingTitle}>Envío</Text>
                <Text style={styles.shippingSubtitle}>Estándar</Text>
              </View>
              <Text style={styles.shippingValue}>Gratis</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>💳  Método</Text>
              <Text style={styles.metaValue}>{cardLabel}</Text>
            </View>
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>📅  Cuotas</Text>
              <Text style={styles.metaValue}>
                {installments} {installments === 1 ? 'cuota' : 'cuotas'}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={processing || !selectedCard}
            onPress={() => {
              void handlePay();
            }}
            style={({ pressed }) => [
              styles.payButton,
              (processing || !selectedCard) && styles.payDisabled,
              pressed && !processing && styles.payPressed,
            ]}
          >
            {processing ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.white} />
                <Text style={styles.payText}>Procesando...</Text>
              </View>
            ) : (
              <Text style={styles.payText}>
                Pagar {formatCop(total)} COP
              </Text>
            )}
          </Pressable>

          <Text style={styles.disclaimer}>
            Al confirmar el pago, aceptas nuestros Términos de Servicio y la
            Política de Privacidad de GreenPay. Esta transacción está protegida
            por encriptación de 256 bits.
          </Text>
        </BottomSheetScrollView>

        {processing ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={styles.processingTitle}>Procesando pago...</Text>
            <Text style={styles.processingSubtitle}>
              No cierres la aplicación
            </Text>
          </View>
        ) : null}

        <ErrorToast visible={toastVisible} message={toastMessage} />
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
  },
  totalBlock: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  totalLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  totalAmount: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.onSurface,
  },
  summaryBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(196, 199, 199, 0.35)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  cardsList: {
    gap: spacing.md,
  },
  shippingRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  shippingSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  shippingValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.brand,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  metaCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(196, 199, 199, 0.4)',
    padding: spacing.md,
    gap: spacing.xs,
  },
  metaLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  payButton: {
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  payDisabled: {
    opacity: 0.7,
  },
  payPressed: {
    transform: [{ scale: 0.97 }],
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  payText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    fontWeight: '700',
  },
  disclaimer: {
    marginTop: spacing.md,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    color: colors.onSurfaceVariant,
    paddingHorizontal: spacing.md,
    fontFamily: 'Inter_400Regular',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 248, 248, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    zIndex: 50,
    paddingBottom: spacing.lg,
  },
  processingTitle: {
    marginTop: spacing.md,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: colors.onSurface,
  },
  processingSubtitle: {
    marginTop: spacing.xs,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
});
