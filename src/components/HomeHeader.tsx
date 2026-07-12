import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';

type Props = {
  count: number;
  onPressCart: () => void;
};

export function HomeHeader({ count, onPressCart }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>GreenPay</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir carrito"
        hitSlop={8}
        onPress={onPressCart}
        style={styles.cartButton}
      >
        <Text style={styles.cartIcon}>🛒</Text>
        {count > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  logo: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.56,
    fontWeight: '700',
    color: colors.brand,
  },
  cartButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
  },
  cartIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
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
});
