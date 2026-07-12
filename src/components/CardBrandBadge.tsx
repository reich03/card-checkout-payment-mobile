import { StyleSheet, Text, View } from 'react-native';
import type { CardBrand } from '../types/payment';
import { colors, radii } from '../theme/colors';

type Props = {
  brand: CardBrand;
  size?: 'sm' | 'md';
};

export function CardBrandBadge({ brand, size = 'md' }: Props) {
  const isVisa = brand === 'visa';

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.sm : styles.md,
        isVisa ? styles.visa : styles.mastercard,
      ]}
    >
      <Text style={[styles.text, size === 'sm' && styles.textSm]}>
        {isVisa ? 'VISA' : 'MC'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.white,
  },
  sm: {
    width: 32,
    height: 20,
  },
  md: {
    width: 40,
    height: 28,
  },
  visa: {
    backgroundColor: '#1A1F71',
    borderColor: '#1A1F71',
  },
  mastercard: {
    backgroundColor: '#EB001B',
    borderColor: '#EB001B',
  },
  text: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  textSm: {
    fontSize: 8,
  },
});
