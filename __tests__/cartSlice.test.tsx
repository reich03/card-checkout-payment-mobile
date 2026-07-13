import cartReducer, {
  addToCart,
  clearCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
  selectCartCount,
  selectCartSubtotal,
  selectCartTotal,
  syncCartWithCatalog,
} from '../src/store/slices/cartSlice';
import type { Product } from '../src/types/product';

const coffee: Product = {
  id: 'prod-1',
  name: 'Café Especial',
  description: 'Premium',
  price: 45000,
  stock: 10,
  imageUrl: 'https://example.com/coffee.jpg',
};

const mug: Product = {
  id: 'prod-2',
  name: 'Taza Artesanal',
  description: 'Cerámica',
  price: 32500,
  stock: 5,
  imageUrl: 'https://example.com/mug.jpg',
};

test('adds products and increments quantity via addToCart', () => {
  let state = cartReducer(undefined, { type: 'unknown' });
  state = cartReducer(state, addToCart(coffee));
  state = cartReducer(state, addToCart(coffee));

  expect(state.items).toHaveLength(1);
  expect(state.items[0].quantity).toBe(2);
  expect(selectCartCount({ cart: state })).toBe(2);
});

test('increments and decrements quantity and removes at zero', () => {
  let state = cartReducer(undefined, addToCart(coffee));
  state = cartReducer(state, incrementQuantity(coffee.id));
  expect(state.items[0].quantity).toBe(2);

  state = cartReducer(state, decrementQuantity(coffee.id));
  expect(state.items[0].quantity).toBe(1);

  state = cartReducer(state, decrementQuantity(coffee.id));
  expect(state.items).toHaveLength(0);
});

test('does not increment above stock', () => {
  const limited: Product = { ...coffee, stock: 1 };
  let state = cartReducer(undefined, addToCart(limited));
  state = cartReducer(state, incrementQuantity(limited.id));
  expect(state.items[0].quantity).toBe(1);
});

test('does not add when stock is zero', () => {
  const soldOut: Product = { ...coffee, stock: 0 };
  const state = cartReducer(undefined, addToCart(soldOut));
  expect(state.items).toHaveLength(0);
});

test('addToCart does not exceed stock when tapping repeatedly', () => {
  const limited: Product = { ...coffee, stock: 2 };
  let state = cartReducer(undefined, addToCart(limited));
  state = cartReducer(state, addToCart(limited));
  state = cartReducer(state, addToCart(limited));
  expect(state.items[0].quantity).toBe(2);
});

test('syncCartWithCatalog clamps quantity and drops out-of-stock lines', () => {
  let state = cartReducer(undefined, addToCart(coffee));
  state = cartReducer(state, addToCart(coffee));
  state = cartReducer(state, addToCart(coffee));

  state = cartReducer(
    state,
    syncCartWithCatalog([{ ...coffee, stock: 1 }]),
  );
  expect(state.items[0].quantity).toBe(1);
  expect(state.items[0].product.stock).toBe(1);

  state = cartReducer(
    state,
    syncCartWithCatalog([{ ...coffee, stock: 0 }]),
  );
  expect(state.items).toHaveLength(0);
});

test('removes an item and clears the cart', () => {
  let state = cartReducer(undefined, addToCart(coffee));
  state = cartReducer(state, addToCart(mug));
  state = cartReducer(state, removeFromCart(coffee.id));

  expect(state.items).toHaveLength(1);
  expect(state.items[0].product.id).toBe(mug.id);

  state = cartReducer(state, clearCart());
  expect(state.items).toHaveLength(0);
});

test('calculates subtotal and total with free shipping', () => {
  let state = cartReducer(undefined, addToCart(coffee));
  state = cartReducer(state, addToCart(coffee));
  state = cartReducer(state, addToCart(mug));

  // 45000*2 + 32500 = 122500
  expect(selectCartSubtotal({ cart: state })).toBe(122500);
  expect(selectCartTotal({ cart: state })).toBe(122500);
});
