import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/colors';

/**
 * Card form lives as a BottomSheet on Checkout (M-06).
 * This route is kept for stack completeness / deep links.
 */
export function CardInfoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Datos de tarjeta</Text>
      <Text style={styles.subtitle}>
        Usa “Añadir nueva” desde Checkout para abrir el formulario.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
