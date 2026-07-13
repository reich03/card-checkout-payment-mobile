import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductsQuery } from '../api/hooks/useProductsQuery';
import { BottomNavBar } from '../components/BottomNavBar';
import { HomeHeader } from '../components/HomeHeader';
import { HomeSkeleton } from '../components/HomeSkeleton';
import { ProductCard } from '../components/ProductCard';
import { PromoBanner } from '../components/PromoBanner';
import { SearchBar } from '../components/SearchBar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addToCart,
  selectCartCount,
  syncCartWithCatalog,
} from '../store/slices/cartSlice';
import type { RootStackParamList } from '../types/navigation';
import type { Product } from '../types/product';
import { colors, spacing } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');

  const {
    data: items = [],
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    isSuccess,
  } = useProductsQuery();
  const cartCount = useAppSelector(selectCartCount);

  // F-03: when returning to Home after payment, pull fresh stock.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (isSuccess && items.length > 0) {
      dispatch(syncCartWithCatalog(items));
    }
  }, [dispatch, isSuccess, items]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items;
    }

    return items.filter(
      (product) =>
        product.name.toLowerCase().includes(normalized) ||
        product.description.toLowerCase().includes(normalized),
    );
  }, [items, query]);

  const cardWidth = (width - spacing.marginMobile * 2 - spacing.md) / 2;

  const goToCart = () => navigation.navigate('Cart');

  const handleAdd = (product: Product) => {
    if (product.stock <= 0) {
      return;
    }
    dispatch(addToCart(product));
  };

  const showSkeleton = isPending && items.length === 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <HomeHeader count={cartCount} onPressCart={goToCart} />

      {showSkeleton ? (
        <HomeSkeleton />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 96 + insets.bottom },
          ]}
          ListHeaderComponent={
            <View>
              <View style={styles.searchWrap}>
                <SearchBar value={query} onChangeText={setQuery} />
              </View>
              <View style={styles.bannerWrap}>
                <PromoBanner />
              </View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nuestros Productos</Text>
                <Text style={styles.tune}>⚙︎</Text>
              </View>
              {isError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    {error instanceof Error
                      ? error.message
                      : 'No se pudieron cargar los productos'}
                  </Text>
                  <Pressable
                    onPress={() => void refetch()}
                    style={styles.retry}
                    disabled={isRefetching}
                  >
                    <Text style={styles.retryText}>
                      {isRefetching ? 'Cargando…' : 'Reintentar'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            !isError ? (
              <Text style={styles.empty}>No hay productos para “{query}”.</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <ProductCard product={item} onAdd={handleAdd} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomNavBar active="home" onHome={() => undefined} onCart={goToCart} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
  },
  searchWrap: {
    marginBottom: spacing.lg,
  },
  bannerWrap: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.onSurface,
  },
  tune: {
    fontSize: 18,
    color: colors.outline,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  empty: {
    textAlign: 'center',
    color: colors.onSurfaceVariant,
    marginTop: spacing.lg,
    fontFamily: 'Inter_400Regular',
  },
  errorBox: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
  },
  errorText: {
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  retry: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '700',
  },
});
