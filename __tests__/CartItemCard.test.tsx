import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { CartItemCard } from '../src/components/CartItemCard';
import type { CartItem } from '../src/store/slices/cartSlice';

const item: CartItem = {
  product: {
    id: 'prod-1',
    name: 'Café Especial',
    description: 'Tueste medio',
    price: 45000,
    stock: 2,
    imageUrl: 'https://example.com/coffee.jpg',
  },
  quantity: 1,
};

test('increments, decrements and removes an item', async () => {
  const onIncrement = jest.fn();
  const onDecrement = jest.fn();
  const onRemove = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <CartItemCard
        item={item}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        onRemove={onRemove}
      />,
    );
  });

  await ReactTestRenderer.act(() => {
    tree!.root
      .findByProps({ accessibilityLabel: 'Aumentar cantidad' })
      .props.onPress();
  });
  expect(onIncrement).toHaveBeenCalledWith('prod-1');

  await ReactTestRenderer.act(() => {
    tree!.root
      .findByProps({ accessibilityLabel: 'Disminuir cantidad' })
      .props.onPress();
  });
  expect(onDecrement).toHaveBeenCalledWith('prod-1');

  await ReactTestRenderer.act(() => {
    tree!.root
      .findByProps({ accessibilityLabel: 'Eliminar Café Especial' })
      .props.onPress();
  });
  expect(onRemove).toHaveBeenCalledWith('prod-1');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('disables the increment button once quantity reaches stock', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <CartItemCard
        item={{ ...item, quantity: 2 }}
        onIncrement={jest.fn()}
        onDecrement={jest.fn()}
        onRemove={jest.fn()}
      />,
    );
  });

  const incrementButton = tree!.root.findByProps({
    accessibilityLabel: 'Aumentar cantidad',
  });
  expect(incrementButton.props.disabled).toBe(true);
  expect(incrementButton.props.accessibilityState).toEqual({ disabled: true });

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
