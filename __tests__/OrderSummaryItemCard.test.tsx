import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { OrderSummaryItemCard } from '../src/components/OrderSummaryItemCard';
import type { CartItem } from '../src/store/slices/cartSlice';

const item: CartItem = {
  product: {
    id: 'prod-1',
    name: 'Taza Artesanal',
    description: 'Cerámica',
    price: 32500,
    stock: 5,
    imageUrl: 'https://example.com/mug.jpg',
  },
  quantity: 2,
};

test('renders product name, quantity and computed line total', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<OrderSummaryItemCard item={item} />);
  });

  const texts = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);
  expect(texts).toContain('Taza Artesanal');
  expect(texts).toContain(2);

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
