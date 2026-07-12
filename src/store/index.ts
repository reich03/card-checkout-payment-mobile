import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import paymentReducer from './slices/paymentSlice';
import productsReducer from './slices/productsSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    payment: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
