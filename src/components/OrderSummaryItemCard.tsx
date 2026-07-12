import { Image, StyleSheet, Text, View } from 'react-native';
import type { CartItem } from '../store/slices/cartSlice';
import { formatCop } from '../utils/formatCurrency';
import { colors, radii, spacing } from '../theme/colors';

type Props = {
  item: CartItem;
};

/** Read-only cart-style card for checkout order details (no qty controls). */
export function OrderSummaryItemCard({ item }: Props) {
  const lineTotal = item.product.price * item.quantity;

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.product.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.name}>
          {item.product.name}
        </Text>
        <Text style={styles.unitPrice}>{formatCop(item.product.price)}</Text>
        <View style={styles.bottomRow}>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyLabel}>Cant.</Text>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
          </View>
          <Text style={styles.lineTotal}>{formatCop(lineTotal)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainer,
  },
  content: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.onSurface,
  },
  unitPrice: {
    marginTop: 4,
    marginBottom: spacing.sm,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  qtyLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  qtyValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  lineTotal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
});
