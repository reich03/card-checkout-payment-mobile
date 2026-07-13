import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../theme/colors';

type Tab = 'home' | 'cart';

type Props = {
  active: Tab;
  onHome: () => void;
  onCart: () => void;
};

export function BottomNavBar({ active, onHome, onCart }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <Pressable
        onPress={onHome}
        style={[styles.item, active === 'home' && styles.itemActive]}
      >
        <Ionicons
          name={active === 'home' ? 'home' : 'home-outline'}
          size={22}
          color={active === 'home' ? colors.brand : colors.onSurfaceVariant}
        />
        <Text style={[styles.label, active === 'home' && styles.labelActive]}>
          Inicio
        </Text>
      </Pressable>

      <Pressable
        onPress={onCart}
        style={[styles.item, active === 'cart' && styles.itemActive]}
      >
        <Ionicons
          name={active === 'cart' ? 'cart' : 'cart-outline'}
          size={22}
          color={active === 'cart' ? colors.brand : colors.onSurfaceVariant}
        />
        <Text style={[styles.label, active === 'cart' && styles.labelActive]}>
          Carrito
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    minWidth: 88,
  },
  itemActive: {
    backgroundColor: colors.secondaryContainer,
    transform: [{ scale: 0.94 }],
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: colors.onSurfaceVariant,
  },
  labelActive: {
    color: colors.brand,
    fontWeight: '600',
  },
});
