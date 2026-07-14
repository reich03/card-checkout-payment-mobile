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

function clampQuantity(quantity: number, stock: number): number {
  if (stock <= 0) {
    return 0;
  }
  return Math.min(quantity, stock);
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const product = action.payload;
      if (product.stock <= 0) {
        return;
      }

      const existing = state.items.find(
        (item) => item.product.id === product.id,
      );

      if (existing) {
        if (existing.quantity < existing.product.stock) {
          existing.quantity += 1;
          existing.product = product;
        }
        return;
      }

      state.items.push({ product, quantity: 1 });
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
    /** Refresh product snapshots from catalog and clamp qty to live stock. */
    syncCartWithCatalog(state, action: PayloadAction<Product[]>) {
      const byId = new Map(action.payload.map((product) => [product.id, product]));

      state.items = state.items
        .map((item) => {
          const fresh = byId.get(item.product.id);
          if (!fresh) {
            return item;
          }

          const quantity = clampQuantity(item.quantity, fresh.stock);
          return {
            product: fresh,
            quantity,
          };
        })
        .filter((item) => item.quantity > 0);
    },
    hydrateCart(state, action: PayloadAction<{ items: CartItem[] }>) {
      state.items = (action.payload.items ?? [])
        .map((item) => ({
          ...item,
          quantity: clampQuantity(item.quantity, item.product.stock),
        }))
        .filter((item) => item.quantity > 0);
    },
  },
});

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  syncCartWithCatalog,
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
