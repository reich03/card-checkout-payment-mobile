import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ProductCard } from '../src/components/ProductCard';
import type { Product } from '../src/types/product';

jest.useFakeTimers();

const product: Product = {
  id: 'prod-1',
  name: 'Café Especial',
  description: 'Tueste medio con notas a cacao',
  price: 45000,
  stock: 10,
  imageUrl: 'https://example.com/coffee.jpg',
};

test('renders name, description, stock and add button', async () => {
  const onAdd = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <ProductCard product={product} onAdd={onAdd} />,
    );
  });

  const labels = tree!
    .root.findAll((node) => typeof node.props.children === 'string')
    .map((node) => node.props.children as string);

  expect(labels).toEqual(
    expect.arrayContaining([
      'Café Especial',
      'Tueste medio con notas a cacao',
      '10 disponibles',
      'Agregar',
    ]),
  );
  expect(labels.some((label) => label.includes('45'))).toBe(true);

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('calls onAdd when pressing Agregar', async () => {
  const onAdd = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <ProductCard product={product} onAdd={onAdd} />,
    );
  });

  const addButton = tree!.root.findByProps({
    accessibilityLabel: 'Agregar Café Especial',
  });

  await ReactTestRenderer.act(() => {
    addButton.props.onPress();
  });

  expect(onAdd).toHaveBeenCalledWith(product);

  await ReactTestRenderer.act(() => {
    jest.runOnlyPendingTimers();
    tree!.unmount();
  });
});

test('blocks add when stock is zero', async () => {
  const onAdd = jest.fn();
  const soldOut: Product = { ...product, stock: 0 };
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <ProductCard product={soldOut} onAdd={onAdd} />,
    );
  });

  const addButton = tree!.root.findByProps({
    accessibilityLabel: 'Café Especial agotado',
  });

  expect(addButton.props.disabled).toBe(true);

  await ReactTestRenderer.act(() => {
    addButton.props.onPress?.();
  });

  expect(onAdd).not.toHaveBeenCalled();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
