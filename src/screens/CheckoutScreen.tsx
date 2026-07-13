import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CardBrandBadge } from '../components/CardBrandBadge';
import { CardFormSheet } from '../components/CardFormSheet';
import { CardSelectionSheet } from '../components/CardSelectionSheet';
import { OrderSummaryItemCard } from '../components/OrderSummaryItemCard';
import { PaymentSummarySheet } from '../components/PaymentSummarySheet';
import { useAppSelector } from '../store/hooks';
import { selectCartCount, selectCartItems, selectCartTotal } from '../store/slices/cartSlice';
import { selectSelectedCard } from '../store/slices/paymentSlice';
import type { RootStackParamList } from '../types/navigation';
import { formatCop } from '../utils/formatCurrency';
import { colors, radii, spacing } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const selectionSheetRef = useRef<BottomSheetModal>(null);
  const formSheetRef = useRef<BottomSheetModal>(null);
  const summarySheetRef = useRef<BottomSheetModal>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const items = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const total = useAppSelector(selectCartTotal);
  const selectedCard = useAppSelector(selectSelectedCard);

  const productLabel = useMemo(() => {
    if (cartCount === 1) {
      return '1 producto';
    }
    return `${cartCount} productos`;
  }, [cartCount]);

  const openSelectionSheet = useCallback(() => {
    setSheetOpen(true);
    selectionSheetRef.current?.present();
  }, []);

  const closeSelectionSheet = useCallback(() => {
    selectionSheetRef.current?.dismiss();
  }, []);

  const openFormSheet = useCallback(() => {
    setSheetOpen(true);
    formSheetRef.current?.present();
  }, []);

  const closeFormSheet = useCallback(() => {
    formSheetRef.current?.dismiss();
  }, []);

  const handleConfirmed = () => {
    closeSelectionSheet();
    setSheetOpen(false);
  };

  const handleAddNew = () => {
    closeSelectionSheet();
    setTimeout(() => {
      openFormSheet();
    }, 280);
  };

  const handleFormCompleted = () => {
    closeFormSheet();
    setSheetOpen(false);
  };

  const openSummarySheet = useCallback(() => {
    setSheetOpen(true);
    summarySheetRef.current?.present();
  }, []);

  const handlePaid = useCallback(() => {
    summarySheetRef.current?.dismiss();
    setSheetOpen(false);
    navigation.navigate('TransactionResult');
  }, [navigation]);

  const canPay = Boolean(selectedCard) && cartCount > 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => navigation.navigate('Cart')}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Cart')}
          style={styles.headerButton}
        >
          <Ionicons name="cart-outline" size={22} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 120 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        pointerEvents={sheetOpen ? 'none' : 'auto'}
        style={sheetOpen ? styles.contentDimmed : undefined}
      >
        <Pressable
          onPress={() => setDetailsOpen((value) => !value)}
          style={styles.summaryCard}
        >
          <View>
            <Text style={styles.summaryEyebrow}>Tu pedido</Text>
            <Text style={styles.summaryProducts}>{productLabel}</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryTotal}>{formatCop(total)} COP</Text>
            <View style={styles.detailsLinkRow}>
              <Text style={styles.detailsLink}>Detalles</Text>
              <Ionicons
                name={detailsOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.brand}
              />
            </View>
          </View>
        </Pressable>

        {detailsOpen ? (
          <View style={styles.detailsList}>
            {items.map((item) => (
              <OrderSummaryItemCard key={item.product.id} item={item} />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MÉTODO DE PAGO</Text>
          <Pressable onPress={openSelectionSheet} style={styles.methodCard}>
            <View style={styles.methodLeft}>
              <View style={styles.methodIconBox}>
                <Ionicons name="card-outline" size={22} color={colors.brand} />
              </View>
              <View style={styles.methodCopy}>
                {selectedCard ? (
                  <>
                    <Text style={styles.methodTitle}>
                      {selectedCard.label} •••• {selectedCard.last4}
                    </Text>
                    <Text style={styles.methodSubtitle}>
                      Expira {selectedCard.expMonth}/{selectedCard.expYear}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.methodTitle}>
                      Pagar con tarjeta de crédito
                    </Text>
                    <View style={styles.brandRow}>
                      <CardBrandBadge brand="visa" size="sm" />
                      <CardBrandBadge brand="mastercard" size="sm" />
                    </View>
                  </>
                )}
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        </View>

        <View style={styles.securityBox}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={colors.brand}
          />
          <Text style={styles.securityText}>
            Tu transacción está protegida por encriptación de grado bancario.
            GreenPay asegura tus datos.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.payBar,
          {
            paddingBottom: Math.max(insets.bottom, spacing.md),
            opacity: sheetOpen ? 0.45 : 1,
          },
        ]}
        pointerEvents={sheetOpen || !canPay ? 'none' : 'auto'}
      >
        <Pressable
          accessibilityRole="button"
          disabled={!canPay}
          onPress={openSummarySheet}
          style={[styles.payButton, !canPay && styles.payButtonDisabled]}
        >
          <Text style={styles.payText}>
            Pagar {formatCop(total)} COP
          </Text>
        </Pressable>
      </View>

      <CardSelectionSheet
        ref={selectionSheetRef}
        onConfirmed={handleConfirmed}
        onAddNew={handleAddNew}
        onDismiss={() => setSheetOpen(false)}
      />
      <CardFormSheet
        ref={formSheetRef}
        onCompleted={handleFormCompleted}
        onRequestClose={closeFormSheet}
        onDismiss={() => setSheetOpen(false)}
      />
      <PaymentSummarySheet
        ref={summarySheetRef}
        onPaid={handlePaid}
        onDismiss={() => setSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surface,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.onSurface,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  contentDimmed: {
    opacity: 0.4,
  },
  summaryCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryEyebrow: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  summaryProducts: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.onSurface,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryTotal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.brand,
  },
  detailsLinkRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsLink: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.brand,
  },
  detailsList: {
    marginTop: -spacing.sm,
    gap: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    marginLeft: spacing.xs,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
  },
  methodCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  methodIconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodCopy: {
    flex: 1,
  },
  methodTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurface,
  },
  methodSubtitle: {
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  brandRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(97, 249, 187, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 108, 74, 0.2)',
  },
  securityText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
  },
  payBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  payButton: {
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    backgroundColor: colors.outline,
  },
  payText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    fontWeight: '700',
  },
});
