import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { PromoBanner } from '../src/components/PromoBanner';

test('renders the promo copy', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<PromoBanner />);
  });

  const texts = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);
  expect(texts).toContain('Cosecha de Origen');
  expect(texts).toContain('Ver Más');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
