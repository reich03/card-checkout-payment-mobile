import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchProducts } from '../../services/productsApi';
import type { Product } from '../../types/product';

export interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const loadProducts = createAsyncThunk(
  'products/loadProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchProducts();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los productos';
      return rejectWithValue(message);
    }
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (typeof action.payload === 'string' ? action.payload : null) ??
          action.error.message ??
          'No se pudieron cargar los productos';
      });
  },
});

export default productsSlice.reducer;
