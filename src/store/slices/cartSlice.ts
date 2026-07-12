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
  },
});

export const { addToCart } = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export default cartSlice.reducer;
