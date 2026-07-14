import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CardBrand } from '../types/payment';
import { colors, radii, spacing } from '../theme/colors';
import { CardBrandLogo } from './CardBrandLogo';

type Props = {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
  brand: CardBrand | null;
  showBack?: boolean;
};

function groupNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  const padded = digits.padEnd(16, '•');
  return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`;
}

export function CardPreview({
  number,
  holderName,
  expiry,
  cvv,
  brand,
  showBack = false,
}: Props) {
  const flip = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flip, {
      toValue: showBack ? 1 : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [flip, showBack]);

  const frontRotate = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const brandTone =
    brand === 'visa'
      ? styles.toneVisa
      : brand === 'mastercard'
        ? styles.toneMastercard
        : styles.toneDefault;

  return (
    <View style={styles.scene}>
      <Animated.View
        style={[
          styles.face,
          brandTone,
          styles.faceFront,
          { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
        ]}
      >
        <View style={styles.sheen} pointerEvents="none" />
        <View style={styles.topRow}>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <View style={styles.chipLineH} />
              <View style={[styles.chipLineH, styles.chipLineH2]} />
              <View style={styles.chipLineV} />
            </View>
            <Ionicons
              name="wifi"
              size={22}
              color="rgba(255,255,255,0.85)"
              style={styles.contactless}
            />
          </View>
          {brand ? (
            <View style={styles.logoPlate}>
              <CardBrandLogo brand={brand} width={brand === 'visa' ? 54 : 44} />
            </View>
          ) : (
            <Text style={styles.placeholderBrand}>CARD</Text>
          )}
        </View>

        <Text style={styles.number}>{groupNumber(number)}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>TITULAR</Text>
            <Text numberOfLines={1} style={styles.metaValue}>
              {holderName.trim().toUpperCase() || 'NOMBRE APELLIDO'}
            </Text>
          </View>
          <View style={styles.metaColRight}>
            <Text style={styles.metaLabel}>VENCE</Text>
            <Text style={styles.metaValue}>{expiry || 'MM/AA'}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.face,
          brandTone,
          styles.faceBack,
          { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
        ]}
      >
        <View style={styles.magStripe} />
        <View style={styles.signatureStrip}>
          <Text style={styles.signatureHint}>Authorized signature</Text>
          <View style={styles.cvvBox}>
            <Text style={styles.cvvText}>{cvv || '•••'}</Text>
          </View>
        </View>
        <View style={styles.backFooter}>
          <Text style={styles.backHint}>GreenPay · datos encriptados</Text>
          {brand ? (
            <View style={styles.logoPlateBack}>
              <CardBrandLogo brand={brand} width={brand === 'visa' ? 36 : 30} />
            </View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    height: 200,
    marginBottom: spacing.lg,
  },
  face: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: radii.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  faceFront: {
    zIndex: 2,
  },
  faceBack: {
    zIndex: 1,
  },
  sheen: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 160,
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.07)',
    transform: [{ rotate: '28deg' }],
  },
  toneDefault: {
    backgroundColor: '#1c2428',
  },
  toneVisa: {
    backgroundColor: '#1A1F71',
  },
  toneMastercard: {
    backgroundColor: '#1a1a1a',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    minHeight: 36,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chip: {
    width: 44,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#e8c56a',
    borderWidth: 1,
    borderColor: 'rgba(180,140,50,0.55)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  chipLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 10,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,90,20,0.45)',
  },
  chipLineH2: {
    top: 21,
  },
  chipLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 14,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(120,90,20,0.45)',
  },
  contactless: {
    transform: [{ rotate: '90deg' }],
  },
  logoPlate: {
    backgroundColor: colors.white,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlateBack: {
    backgroundColor: colors.white,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  placeholderBrand: {
    color: 'rgba(255,255,255,0.45)',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 4,
  },
  number: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    letterSpacing: 2.5,
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: 'auto',
  },
  metaCol: {
    flex: 1,
  },
  metaColRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  metaValue: {
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  magStripe: {
    height: 44,
    marginHorizontal: -spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: '#0d0d0d',
  },
  signatureStrip: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
  },
  signatureHint: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: 'rgba(0,0,0,0.35)',
    fontStyle: 'italic',
  },
  cvvBox: {
    minWidth: 48,
    backgroundColor: colors.white,
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  cvvText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: 2,
  },
  backFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backHint: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
  },
});
