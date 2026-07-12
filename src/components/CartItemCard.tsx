import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CartItem } from '../store/slices/cartSlice';
import { formatCop } from '../utils/formatCurrency';
import { colors, radii, spacing } from '../theme/colors';

type Props = {
  item: CartItem;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
};

export function CartItemCard({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: Props) {
  const lineTotal = item.product.price * item.quantity;

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.product.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text numberOfLines={2} style={styles.name}>
            {item.product.name}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${item.product.name}`}
            hitSlop={8}
            onPress={() => onRemove(item.product.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteIcon}>🗑</Text>
          </Pressable>
        </View>

        <Text style={styles.unitPrice}>{formatCop(item.product.price)}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.qtyControl}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Disminuir cantidad"
              onPress={() => onDecrement(item.product.id)}
              style={styles.qtyMinus}
            >
              <Text style={styles.qtySymbol}>−</Text>
            </Pressable>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aumentar cantidad"
              onPress={() => onIncrement(item.product.id)}
              style={styles.qtyPlus}
            >
              <Text style={styles.qtyPlusSymbol}>+</Text>
            </Pressable>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.onSurface,
  },
  deleteButton: {
    padding: 4,
    borderRadius: radii.full,
  },
  deleteIcon: {
    fontSize: 16,
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
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  qtyMinus: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyPlus: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtySymbol: {
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: '600',
  },
  qtyPlusSymbol: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },
  qtyValue: {
    width: 40,
    textAlign: 'center',
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
