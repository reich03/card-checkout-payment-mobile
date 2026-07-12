import cartReducer, {
  addToCart,
  selectCartCount,
} from '../src/store/slices/cartSlice';
import type { Product } from '../src/types/product';

const product: Product = {
  id: 'prod-1',
  name: 'Café Especial',
  description: 'Premium',
  price: 45000,
  stock: 10,
  imageUrl: 'https://example.com/coffee.jpg',
};

test('adds products and increments quantity', () => {
  let state = cartReducer(undefined, { type: 'unknown' });
  state = cartReducer(state, addToCart(product));
  state = cartReducer(state, addToCart(product));

  expect(state.items).toHaveLength(1);
  expect(state.items[0].quantity).toBe(2);
  expect(selectCartCount({ cart: state })).toBe(2);
});
