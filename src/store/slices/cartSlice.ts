import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existing = state.items.find(
        (item) => item.product.id === action.payload.id,
      );

      if (existing) {
        existing.quantity += 1;
        return;
      }

      state.items.push({ product: action.payload, quantity: 1 });
    },
    incrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(
        (entry) => entry.product.id === action.payload,
      );
      if (!item) {
        return;
      }

      if (item.quantity < item.product.stock) {
        item.quantity += 1;
      }
    },
    decrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(
        (entry) => entry.product.id === action.payload,
      );
      if (!item) {
        return;
      }

      if (item.quantity <= 1) {
        state.items = state.items.filter(
          (entry) => entry.product.id !== action.payload,
        );
        return;
      }

      item.quantity -= 1;
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter(
        (entry) => entry.product.id !== action.payload,
      );
    },
    clearCart(state) {
      state.items = [];
    },
    hydrateCart(state, action: PayloadAction<{ items: CartItem[] }>) {
      state.items = action.payload.items ?? [];
    },
  },
});

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  hydrateCart,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

/** Shipping is free in the GreenPay checkout flow for now. */
export const selectCartShipping = (_state: { cart: CartState }) => 0;

export const selectCartTotal = (state: { cart: CartState }) =>
  selectCartSubtotal(state) + selectCartShipping(state);

export default cartSlice.reducer;
