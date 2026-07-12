import { createSlice } from '@reduxjs/toolkit';

export interface CartState {
  items: unknown[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
});

export default cartSlice.reducer;
