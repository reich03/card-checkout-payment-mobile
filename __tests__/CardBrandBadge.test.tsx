import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Image } from 'react-native';
import { CardBrandBadge } from '../src/components/CardBrandBadge';

test('renders a small Visa badge', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<CardBrandBadge brand="visa" size="sm" />);
  });

  expect(tree!.root.findByType(Image).props.accessibilityLabel).toBe('Visa');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('renders a default-size Mastercard badge', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<CardBrandBadge brand="mastercard" />);
  });

  expect(tree!.root.findByType(Image).props.accessibilityLabel).toBe(
    'Mastercard',
  );

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
