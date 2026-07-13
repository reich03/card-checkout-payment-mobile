import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNavBar } from '../components/BottomNavBar';
import { CartItemCard } from '../components/CartItemCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
  selectCartCount,
  selectCartItems,
  selectCartSubtotal,
  selectCartTotal,
} from '../store/slices/cartSlice';
import type { RootStackParamList } from '../types/navigation';
import { formatCop } from '../utils/formatCurrency';
import { colors, radii, spacing } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const items = useAppSelector(selectCartItems);
  const cartCount = useAppSelector(selectCartCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const total = useAppSelector(selectCartTotal);

  const goHome = () => navigation.navigate('Home');
  const goCheckout = () => navigation.navigate('Checkout');

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={goHome}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Carrito</Text>
        <View style={styles.headerButton}>
          <Ionicons name="cart-outline" size={22} color={colors.onSurface} />
          {cartCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 9 ? '9+' : cartCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 180 + insets.bottom },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
            <Text style={styles.emptySubtitle}>
              Agrega productos desde el catálogo para continuar.
            </Text>
            <Pressable onPress={goHome} style={styles.emptyCta}>
              <Text style={styles.emptyCtaText}>Ir al catálogo</Text>
            </Pressable>
          </View>
        }
        ListFooterComponent={
          items.length > 0 ? (
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCop(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Envío</Text>
                <Text style={styles.shippingValue}>Gratis</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCop(total)}</Text>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <CartItemCard
              item={item}
              onIncrement={(id) => dispatch(incrementQuantity(id))}
              onDecrement={(id) => dispatch(decrementQuantity(id))}
              onRemove={(id) => dispatch(removeFromCart(id))}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {items.length > 0 ? (
        <View
          style={[
            styles.checkoutWrap,
            { bottom: 72 + Math.max(insets.bottom, spacing.sm) },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continuar al pago"
            onPress={goCheckout}
            style={({ pressed }) => [
              styles.checkoutButton,
              pressed && styles.checkoutPressed,
            ]}
          >
            <Ionicons name="card-outline" size={20} color={colors.white} />
            <Text style={styles.checkoutText}>Continuar al pago</Text>
          </Pressable>
        </View>
      ) : null}

      <BottomNavBar active="cart" onHome={goHome} onCart={() => undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surface,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.onSurface,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  listContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.lg,
  },
  itemWrap: {
    marginBottom: spacing.md,
  },
  summary: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
  },
  summaryValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurface,
  },
  shippingValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.brand,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.xs,
  },
  totalLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: colors.onSurface,
  },
  totalValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: colors.brand,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyCta: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  emptyCtaText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  checkoutWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.marginMobile,
    zIndex: 40,
  },
  checkoutButton: {
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  checkoutPressed: {
    transform: [{ scale: 0.97 }],
  },
  checkoutText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
});
