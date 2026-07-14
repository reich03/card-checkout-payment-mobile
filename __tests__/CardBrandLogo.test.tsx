import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Image } from 'react-native';
import { CardBrandLogo } from '../src/components/CardBrandLogo';

test('renders the Visa logo with an accessible label', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<CardBrandLogo brand="visa" />);
  });

  const image = tree!.root.findByType(Image);
  expect(image.props.accessibilityLabel).toBe('Visa');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('renders the Mastercard logo sized from the given width', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <CardBrandLogo brand="mastercard" width={100} />,
    );
  });

  const image = tree!.root.findByType(Image);
  expect(image.props.accessibilityLabel).toBe('Mastercard');
  expect(image.props.style).toEqual({ width: 100, height: 71 });

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
