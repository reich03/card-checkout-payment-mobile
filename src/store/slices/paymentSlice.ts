import { createSlice } from '@reduxjs/toolkit';

export interface PaymentState {
  card: unknown | null;
  transaction: unknown | null;
  status: 'idle' | 'processing' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PaymentState = {
  card: null,
  transaction: null,
  status: 'idle',
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
});

export default paymentSlice.reducer;
