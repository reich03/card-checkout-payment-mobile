import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CardInfoScreen,
  CartScreen,
  CheckoutScreen,
  HomeScreen,
  PaymentSummaryScreen,
  SplashScreen,
  TransactionResultScreen,
} from '../screens';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="CardInfo" component={CardInfoScreen} />
        <Stack.Screen name="PaymentSummary" component={PaymentSummaryScreen} />
        <Stack.Screen
          name="TransactionResult"
          component={TransactionResultScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
