import { StyleSheet, View } from 'react-native';
import type { CardBrand } from '../types/payment';
import { colors, radii } from '../theme/colors';
import { CardBrandLogo } from './CardBrandLogo';

type Props = {
  brand: CardBrand;
  size?: 'sm' | 'md';
};

export function CardBrandBadge({ brand, size = 'md' }: Props) {
  const isVisa = brand === 'visa';
  const logoWidth = size === 'sm' ? (isVisa ? 34 : 28) : isVisa ? 42 : 36;

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.sm : styles.md,
        isVisa ? styles.visa : styles.mastercard,
      ]}
    >
      <CardBrandLogo brand={brand} width={logoWidth} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    paddingHorizontal: 6,
    backgroundColor: colors.white,
  },
  sm: {
    minWidth: 40,
    height: 24,
  },
  md: {
    minWidth: 48,
    height: 32,
  },
  visa: {
    backgroundColor: colors.white,
  },
  mastercard: {
    backgroundColor: colors.white,
  },
});
