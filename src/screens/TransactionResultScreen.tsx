import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCart } from '../store/slices/cartSlice';
import {
  clearLastTransaction,
  paymentSucceeded,
  selectLastTransaction,
  selectPaymentError,
} from '../store/slices/paymentSlice';
import { fetchTransaction } from '../services/transactionsApi';
import type { RootStackParamList } from '../types/navigation';
import { formatCop } from '../utils/formatCurrency';
import { colors, radii, spacing } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'TransactionResult'>;

type ResultVariant = 'success' | 'error' | 'pending';
type IoniconName = ComponentProps<typeof Ionicons>['name'];

function formatResultDate(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function TransactionResultScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const transaction = useAppSelector(selectLastTransaction);
  const paymentError = useAppSelector(selectPaymentError);
  const [refreshing, setRefreshing] = useState(false);

  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const variant: ResultVariant = useMemo(() => {
    if (!transaction) {
      return paymentError ? 'error' : 'success';
    }
    if (transaction.status === 'APPROVED') {
      return 'success';
    }
    if (transaction.status === 'PENDING') {
      return 'pending';
    }
    return 'error';
  }, [paymentError, transaction]);

  useEffect(() => {
    scale.setValue(0);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, variant]);

  const amount = transaction?.amount ?? 0;
  const reference = transaction?.id ?? '—';
  const dateLabel = formatResultDate(transaction?.createdAt);

  const copy: Record<
    ResultVariant,
    {
      title: string;
      subtitle: string;
      titleColor: string;
      iconBg: string;
      icon: IoniconName;
      iconColor: string;
      primaryLabel: string;
      primaryIcon?: IoniconName;
      secondaryLabel: string;
      footer: string;
    }
  > = {
    success: {
      title: '¡Pago exitoso!',
      subtitle: 'Tu transacción ha sido procesada con éxito.',
      titleColor: colors.brand,
      iconBg: 'rgba(97, 249, 187, 0.2)',
      icon: 'checkmark',
      iconColor: colors.brandBright,
      primaryLabel: 'Descargar Recibo',
      primaryIcon: 'download-outline',
      secondaryLabel: 'Volver a la tienda',
      footer: 'Recibirás un correo electrónico con los detalles del pago.',
    },
    error: {
      title: 'Pago rechazado',
      subtitle:
        transaction?.message ??
        paymentError ??
        'No pudimos procesar tu pago. Por favor, intenta de nuevo.',
      titleColor: colors.error,
      iconBg: 'rgba(186, 26, 26, 0.12)',
      icon: 'close',
      iconColor: colors.error,
      primaryLabel: 'Reintentar pago',
      secondaryLabel: 'Volver a la tienda',
      footer: 'Ningún cargo fue aplicado a tu tarjeta.',
    },
    pending: {
      title: 'Pago en proceso',
      subtitle:
        transaction?.message ??
        'Estamos confirmando tu pago. Esto puede tomar unos minutos.',
      titleColor: '#c47a00',
      iconBg: 'rgba(196, 122, 0, 0.12)',
      icon: 'time-outline',
      iconColor: '#c47a00',
      primaryLabel: 'Consultar estado',
      primaryIcon: 'refresh-outline',
      secondaryLabel: 'Volver a la tienda',
      footer: 'Consulta de nuevo para ver si Wompi ya confirmó el pago.',
    },
  };
  const current = copy[variant];

  const goHome = () => {
    if (variant === 'success' || variant === 'pending') {
      dispatch(clearCart());
    }
    dispatch(clearLastTransaction());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const refreshStatus = async () => {
    if (!transaction?.id || refreshing) {
      return;
    }

    setRefreshing(true);
    try {
      const latest = await fetchTransaction(transaction.id);
      dispatch(
        paymentSucceeded({
          ...latest,
          message: latest.message ?? transaction.message,
        }),
      );

      if (latest.status === 'PENDING') {
        Alert.alert(
          'Aún en proceso',
          'Wompi todavía no confirmó el pago. Intenta de nuevo en unos segundos.',
        );
      }
    } catch (error) {
      Alert.alert(
        'No se pudo consultar',
        error instanceof Error
          ? error.message
          : 'Error al consultar la transacción',
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handlePrimary = () => {
    if (variant === 'success') {
      Alert.alert(
        'Recibo',
        'La descarga del recibo estará disponible pronto.',
      );
      return;
    }
    if (variant === 'error') {
      dispatch(clearLastTransaction());
      navigation.navigate('Checkout');
      return;
    }
    void refreshStatus();
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + spacing.xl,
          paddingBottom: Math.max(insets.bottom, spacing.lg),
        },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={[styles.iconRing, { backgroundColor: current.iconBg }]}>
          <View
            style={[
              styles.iconCircle,
              {
                borderColor: current.iconColor,
                backgroundColor:
                  variant === 'success' ? colors.brandBright : 'transparent',
              },
            ]}
          >
            <Ionicons
              name={current.icon}
              size={40}
              color={variant === 'success' ? colors.white : current.iconColor}
            />
          </View>
        </View>

        <View style={styles.heading}>
          <Text style={[styles.title, { color: current.titleColor }]}>
            {current.title}
          </Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Monto</Text>
            <Text style={styles.amountValue}>{formatCop(amount)} COP</Text>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>
                {variant === 'error' ? 'Estado' : 'Referencia'}
              </Text>
              <Text style={styles.metaValue}>
                {variant === 'error' ? 'Rechazado' : reference}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Fecha</Text>
              <Text style={styles.metaValue}>{dateLabel}</Text>
            </View>
          </View>

          {variant === 'success' ? (
            <View style={styles.secureBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={colors.onSecondaryContainer}
              />
              <Text style={styles.secureText}>
                Transacción segura por GreenPay
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={variant === 'pending' && refreshing}
            onPress={handlePrimary}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              variant === 'pending' && refreshing && styles.primaryDisabled,
            ]}
          >
            {variant === 'pending' && refreshing ? (
              <View style={styles.primaryBusy}>
                <ActivityIndicator color={colors.white} />
                <Text style={styles.primaryText}>Consultando…</Text>
              </View>
            ) : (
              <View style={styles.primaryBusy}>
                {current.primaryIcon ? (
                  <Ionicons
                    name={current.primaryIcon}
                    size={18}
                    color={colors.white}
                  />
                ) : null}
                <Text style={styles.primaryText}>{current.primaryLabel}</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={refreshing}
            onPress={goHome}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryText}>{current.secondaryLabel}</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>{current.footer}</Text>
      </Animated.View>

      <View style={styles.bottomAccent} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.marginMobile,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  iconRing: {
    width: 128,
    height: 128,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(196, 199, 199, 0.5)',
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  amountLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.onSurfaceVariant,
  },
  amountValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: colors.onSurface,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  metaCol: {
    flex: 1,
    gap: 4,
  },
  metaLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  metaValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  secureText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.onSecondaryContainer,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabled: {
    opacity: 0.75,
  },
  primaryBusy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 48,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.brand,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  footer: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.outline,
    textAlign: 'center',
  },
  bottomAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: colors.brand,
    opacity: 0.35,
  },
});
