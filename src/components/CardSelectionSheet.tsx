import { forwardRef, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CardBrandBadge } from './CardBrandBadge';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  confirmPaymentMethod,
  selectDraftCard,
  selectDraftSelectedCardId,
  selectSavedCards,
} from '../store/slices/paymentSlice';
import type { SavedCard } from '../types/payment';
import { colors, radii, spacing } from '../theme/colors';

type Props = {
  onConfirmed: () => void;
  onAddNew: () => void;
  onDismiss?: () => void;
};

export const CardSelectionSheet = forwardRef<BottomSheetModal, Props>(
  function CardSelectionSheet({ onConfirmed, onAddNew, onDismiss }, ref) {
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets();
    const cards = useAppSelector(selectSavedCards);
    const draftId = useAppSelector(selectDraftSelectedCardId);
    const snapPoints = useMemo(() => ['52%'], []);

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

    const handleConfirm = () => {
      dispatch(confirmPaymentMethod());
      onConfirmed();
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheet}
        onDismiss={onDismiss}
      >
        <BottomSheetView
          style={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Selecciona tarjeta</Text>
            <Pressable onPress={onAddNew} style={styles.addButton}>
              <Text style={styles.addIcon}>＋</Text>
              <Text style={styles.addText}>Añadir nueva</Text>
            </Pressable>
          </View>

          <View style={styles.list}>
            {cards.map((card) => (
              <CardOption
                key={card.id}
                card={card}
                selected={card.id === draftId}
                onPress={() => dispatch(selectDraftCard(card.id))}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleConfirm}
            style={({ pressed }) => [
              styles.confirmButton,
              pressed && styles.confirmPressed,
            ]}
          >
            <Text style={styles.confirmText}>Confirmar método</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

type CardOptionProps = {
  card: SavedCard;
  selected: boolean;
  onPress: () => void;
};

function CardOption({ card, selected, onPress }: CardOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.cardOption,
        selected ? styles.cardSelected : styles.cardUnselected,
      ]}
    >
      <View style={styles.logoBox}>
        <CardBrandBadge brand={card.brand} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardLabel}>
          {card.label} •••• {card.last4}
        </Text>
        <Text style={styles.cardExp}>
          Expira {card.expMonth}/{card.expYear}
        </Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <Text style={styles.check}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
  },
  handle: {
    width: 32,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.outlineVariant,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.onSurface,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addIcon: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: '700',
  },
  addText: {
    color: colors.brand,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  cardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.brand,
    backgroundColor: 'rgba(97, 249, 187, 0.08)',
  },
  cardUnselected: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
    opacity: 0.65,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: {
    flex: 1,
  },
  cardLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.onSurface,
  },
  cardExp: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: colors.onSurfaceVariant,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  check: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmButton: {
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPressed: {
    transform: [{ scale: 0.97 }],
  },
  confirmText: {
    color: colors.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    fontWeight: '700',
  },
});
