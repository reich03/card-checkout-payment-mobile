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
import { colors, radii } from '../theme/colors';

type Props = {
  product: Product;
  onAdd: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: Props) {
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) {
      return;
    }

    const timer = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const handleAdd = () => {
    onAdd(product);
    setJustAdded(true);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.name}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formatCop(product.price)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Agregar ${product.name}`}
          onPress={handleAdd}
          style={[styles.button, justAdded && styles.buttonAdded]}
        >
          <Text style={[styles.buttonText, justAdded && styles.buttonTextAdded]}>
            {justAdded ? 'Agregado!' : 'Agregar'}
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
  image: {
    width: '100%',
    height: 140,
    backgroundColor: colors.placeholder,
  },
  body: {
    padding: 12,
    flexGrow: 1,
  },
  name: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurface,
    marginBottom: 4,
  },
  price: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.brand,
    marginBottom: 12,
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
  buttonText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
  },
  buttonTextAdded: {
    color: '#09a880',
  },
});
