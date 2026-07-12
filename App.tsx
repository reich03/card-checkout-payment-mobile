import { useEffect, useState } from 'react';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { RootNavigator } from './src/navigation/RootNavigator';
import { store } from './src/store';
import {
  hydrateStoreFromSecureStorage,
  subscribeSecurePersistence,
} from './src/store/persist';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};

    void hydrateStoreFromSecureStorage(store.dispatch).finally(() => {
      unsubscribe = store.subscribe(subscribeSecurePersistence(store.getState));
      setHydrated(true);
    });

    return () => unsubscribe();
  }, []);

  if (!fontsLoaded || !hydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.brand} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
