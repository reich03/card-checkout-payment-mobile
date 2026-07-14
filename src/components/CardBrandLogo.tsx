import { Image, StyleSheet, View } from 'react-native';
import type { CardBrand } from '../types/payment';

const visaLogo = require('../../assets/visa.png');
const mastercardLogo = require('../../assets/mastercard.png');

type Props = {
  brand: CardBrand;
  width?: number;
};

/** Visa / Mastercard logos from `mobile/assets/*.png` (exported from the SVG assets). */
export function CardBrandLogo({ brand, width = 56 }: Props) {
  if (brand === 'visa') {
    const height = Math.round(width * 0.324);
    return (
      <View style={[styles.wrap, { width, height }]}>
        <Image
          source={visaLogo}
          style={{ width, height }}
          resizeMode="contain"
          accessibilityLabel="Visa"
        />
      </View>
    );
  }

  const height = Math.round(width * 0.708);
  return (
    <View style={[styles.wrap, { width, height }]}>
      <Image
        source={mastercardLogo}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityLabel="Mastercard"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
