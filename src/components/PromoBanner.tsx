import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';

const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=80';

export function PromoBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.copy}>
        <Text style={styles.title}>Cosecha de Origen</Text>
        <Text style={styles.subtitle}>
          Descubre granos premium seleccionados.
        </Text>
        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>Ver Más</Text>
        </Pressable>
      </View>
      <Image source={{ uri: BANNER_IMAGE }} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 176,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.secondaryContainer,
    flexDirection: 'row',
  },
  copy: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.onSecondaryContainer,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: colors.onSecondaryFixedVariant,
  },
  cta: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  ctaText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
  },
  image: {
    width: '50%',
    height: '100%',
  },
});
