import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Product } from '../types/product';
import { formatCop } from '../utils/formatCurrency';
import { colors, radii, spacing } from '../theme/colors';

type Props = {
  product: Product;
  onAdd: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: Props) {
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  useEffect(() => {
    if (!justAdded) {
      return;
    }

    const timer = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const handleAdd = () => {
    if (outOfStock) {
      return;
    }
    onAdd(product);
    setJustAdded(true);
  };

  const stockLabel =
    product.stock === 1
      ? '1 disponible'
      : `${product.stock} disponibles`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && !outOfStock && styles.cardPressed,
        outOfStock && styles.cardMuted,
      ]}
    >
      <View>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
        {outOfStock ? (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>Agotado</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.name}>
          {product.name}
        </Text>
        <Text numberOfLines={2} style={styles.description}>
          {product.description}
        </Text>
        <Text style={styles.stock}>
          {outOfStock ? 'Sin stock' : stockLabel}
        </Text>
        <Text style={styles.price}>{formatCop(product.price)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            outOfStock
              ? `${product.name} agotado`
              : `Agregar ${product.name}`
          }
          accessibilityState={{ disabled: outOfStock }}
          disabled={outOfStock}
          onPress={handleAdd}
          style={[
            styles.button,
            justAdded && styles.buttonAdded,
            outOfStock && styles.buttonDisabled,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              justAdded && styles.buttonTextAdded,
              outOfStock && styles.buttonTextDisabled,
            ]}
          >
            {outOfStock ? 'Agotado' : justAdded ? 'Agregado!' : 'Agregar'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
  },
  cardMuted: {
    opacity: 0.88,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: colors.placeholder,
  },
  soldOutBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  soldOutText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: 12,
    flexGrow: 1,
  },
  name: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: colors.onSurface,
    marginBottom: 2,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
    minHeight: 32,
  },
  stock: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: colors.outline,
    marginBottom: 6,
  },
  price: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.brand,
    marginBottom: 10,
  },
  button: {
    marginTop: 'auto',
    backgroundColor: colors.brand,
    borderRadius: radii.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonAdded: {
    backgroundColor: '#003425',
  },
  buttonDisabled: {
    backgroundColor: colors.outlineVariant,
  },
  buttonText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
  },
  buttonTextAdded: {
    color: '#09a880',
  },
  buttonTextDisabled: {
    color: colors.onSurfaceVariant,
  },
});
