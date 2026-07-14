import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Controller, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CardBrandBadge } from './CardBrandBadge';
import { CardPreview } from './CardPreview';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectCartTotal } from '../store/slices/cartSlice';
import { addSavedCard } from '../store/slices/paymentSlice';
import type { SavedCard } from '../types/payment';
import {
  brandLabel,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  isCvvValid,
  isEmailValid,
  isExpiryValid,
  luhnCheck,
  onlyDigits,
} from '../utils/cardValidation';
import { formatCop } from '../utils/formatCurrency';
import { colors, radii, spacing } from '../theme/colors';

export type CardFormValues = {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
  installments: number;
  email: string;
};

type Props = {
  onCompleted: () => void;
  onDismiss?: () => void;
  onRequestClose?: () => void;
};

const INSTALLMENT_OPTIONS = [1, 3, 6, 12];

export const CardFormSheet = forwardRef<BottomSheetModal, Props>(
  function CardFormSheet({ onCompleted, onDismiss, onRequestClose }, ref) {
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets();
    const total = useAppSelector(selectCartTotal);
    const snapPoints = useMemo(() => ['92%'], []);
    const [installmentsOpen, setInstallmentsOpen] = useState(false);
    const [cvvFocused, setCvvFocused] = useState(false);

    const {
      control,
      handleSubmit,
      watch,
      setValue,
      formState: { errors, isSubmitting },
    } = useForm<CardFormValues>({
      defaultValues: {
        number: '',
        holderName: '',
        expiry: '',
        cvv: '',
        installments: 1,
        email: '',
      },
      mode: 'onChange',
    });

    const numberValue = watch('number');
    const holderNameValue = watch('holderName');
    const expiryValue = watch('expiry');
    const cvvValue = watch('cvv');
    const installmentsValue = watch('installments');
    const brand = detectCardBrand(numberValue);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.45}
          pressBehavior="close"
        />
      ),
      [],
    );

    const onSubmit = (values: CardFormValues) => {
      const digits = onlyDigits(values.number);
      const detected = detectCardBrand(digits);
      if (!detected) {
        return;
      }

      const [expMonth, expYear] = values.expiry.split('/');
      const card: SavedCard = {
        id: `card-${detected}-${digits.slice(-4)}-${Date.now()}`,
        brand: detected,
        label: brandLabel(detected),
        last4: digits.slice(-4),
        expMonth,
        expYear,
      };

      dispatch(
        addSavedCard({
          card,
          email: values.email.trim(),
          installments: values.installments,
          chargeable: {
            number: digits,
            holderName: values.holderName.trim(),
            expMonth,
            expYear,
            cvv: values.cvv,
            installments: values.installments,
          },
        }),
      );
      onCompleted();
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheet}
        onDismiss={onDismiss}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Datos de tarjeta</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            onPress={onRequestClose}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={22} color={colors.onSurface} />
          </Pressable>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={[
            styles.form,
            { paddingBottom: 100 + Math.max(insets.bottom, spacing.md) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <CardPreview
            number={numberValue}
            holderName={holderNameValue}
            expiry={expiryValue}
            cvv={cvvValue}
            brand={brand}
            showBack={cvvFocused}
          />

          <FieldLabel>Número de tarjeta</FieldLabel>
          <Controller
            control={control}
            name="number"
            rules={{
              required: 'Número de tarjeta requerido',
              validate: (value) =>
                luhnCheck(value) || 'Número de tarjeta inválido',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View
                  style={[
                    styles.inputWrap,
                    errors.number && styles.inputError,
                  ]}
                >
                  <TextInput
                    value={value}
                    onBlur={onBlur}
                    onFocus={() => setCvvFocused(false)}
                    onChangeText={(text) => onChange(formatCardNumber(text))}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor={colors.onSurfaceVariant}
                    keyboardType="number-pad"
                    style={styles.input}
                    maxLength={23}
                  />
                  {brand ? (
                    <View style={styles.brandSlot}>
                      <CardBrandBadge brand={brand} size="sm" />
                    </View>
                  ) : null}
                </View>
                {errors.number ? (
                  <ErrorText message={errors.number.message} />
                ) : null}
              </View>
            )}
          />

          <FieldLabel>Nombre en la tarjeta</FieldLabel>
          <Controller
            control={control}
            name="holderName"
            rules={{
              required: 'Nombre requerido',
              minLength: { value: 3, message: 'Nombre demasiado corto' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onFocus={() => setCvvFocused(false)}
                  onChangeText={(text) => onChange(text.toUpperCase())}
                  placeholder="Nombre del titular"
                  placeholderTextColor={colors.onSurfaceVariant}
                  autoCapitalize="characters"
                  style={[
                    styles.input,
                    styles.inputSolo,
                    errors.holderName && styles.inputError,
                  ]}
                />
                {errors.holderName ? (
                  <ErrorText message={errors.holderName.message} />
                ) : null}
              </View>
            )}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <FieldLabel>Fecha (MM/AA)</FieldLabel>
              <Controller
                control={control}
                name="expiry"
                rules={{
                  required: 'Fecha requerida',
                  validate: (value) =>
                    isExpiryValid(value) || 'Fecha inválida o vencida',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      value={value}
                      onBlur={onBlur}
                      onFocus={() => setCvvFocused(false)}
                      onChangeText={(text) => onChange(formatExpiry(text))}
                      placeholder="08/28"
                      placeholderTextColor={colors.onSurfaceVariant}
                      keyboardType="number-pad"
                      maxLength={5}
                      style={[
                        styles.input,
                        styles.inputSolo,
                        errors.expiry && styles.inputError,
                      ]}
                    />
                    {errors.expiry ? (
                      <ErrorText message={errors.expiry.message} />
                    ) : null}
                  </View>
                )}
              />
            </View>

            <View style={styles.half}>
              <FieldLabel>CVV ⓘ</FieldLabel>
              <Controller
                control={control}
                name="cvv"
                rules={{
                  required: 'CVV requerido',
                  validate: (value) =>
                    isCvvValid(value, brand) || 'CVV inválido',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      value={value}
                      onFocus={() => setCvvFocused(true)}
                      onBlur={() => {
                        setCvvFocused(false);
                        onBlur();
                      }}
                      onChangeText={(text) =>
                        onChange(onlyDigits(text).slice(0, 4))
                      }
                      placeholder="***"
                      placeholderTextColor={colors.onSurfaceVariant}
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={4}
                      style={[
                        styles.input,
                        styles.inputSolo,
                        errors.cvv && styles.inputError,
                      ]}
                    />
                    {errors.cvv ? (
                      <ErrorText message={errors.cvv.message} />
                    ) : null}
                  </View>
                )}
              />
            </View>
          </View>

          <FieldLabel>Número de cuotas</FieldLabel>
          <Pressable
            onPress={() => setInstallmentsOpen((open) => !open)}
            style={styles.select}
          >
            <Text style={styles.selectText}>
              {installmentsValue}{' '}
              {installmentsValue === 1 ? 'cuota' : 'cuotas'} (
              {formatCop(Math.ceil(total / installmentsValue))})
            </Text>
            <Ionicons
              name={installmentsOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
          {installmentsOpen ? (
            <View style={styles.options}>
              {INSTALLMENT_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    setValue('installments', option, { shouldValidate: true });
                    setInstallmentsOpen(false);
                  }}
                  style={styles.optionRow}
                >
                  <Text style={styles.optionText}>
                    {option} {option === 1 ? 'cuota' : 'cuotas'} (
                    {formatCop(Math.ceil(total / option))})
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <FieldLabel>Correo electrónico</FieldLabel>
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email requerido',
              validate: (value) => isEmailValid(value) || 'Email inválido',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="usuario@ejemplo.com"
                  placeholderTextColor={colors.onSurfaceVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[
                    styles.input,
                    styles.inputSolo,
                    errors.email && styles.inputError,
                  ]}
                />
                {errors.email ? (
                  <ErrorText message={errors.email.message} />
                ) : null}
              </View>
            )}
          />
        </BottomSheetScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, spacing.md) },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continuePressed,
            ]}
          >
            <Text style={styles.continueText}>Continuar</Text>
            <Text style={styles.continueArrow}>→</Text>
          </Pressable>
        </View>
      </BottomSheetModal>
    );
  },
);

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

function ErrorText({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <Text style={styles.errorText}>
      ⚠ {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
  },
  handle: {
    width: 40,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.onSurface,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.sm,
  },
  label: {
    marginTop: spacing.sm,
    marginLeft: 4,
    marginBottom: spacing.xs,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  inputWrap: {
    height: 56,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  inputSolo: {
    height: 56,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurface,
    paddingVertical: 0,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  brandSlot: {
    marginLeft: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  select: {
    height: 56,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurface,
  },
  options: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  optionRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  optionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.onSurface,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.error,
  },
  footer: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  continueButton: {
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  continuePressed: {
    transform: [{ scale: 0.97 }],
  },
  continueText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    fontWeight: '700',
  },
  continueArrow: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
});
