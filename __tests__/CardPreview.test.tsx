import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { CardPreview } from '../src/components/CardPreview';

test('renders placeholder copy when there is no data yet', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <CardPreview number="" holderName="" expiry="" cvv="" brand={null} />,
    );
  });

  const texts = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);
  expect(texts).toContain('CARD');
  expect(texts).toContain('NOMBRE APELLIDO');
  expect(texts).toContain('MM/AA');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('renders the entered card details, brand logo and flips to the back', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <CardPreview
        number="4242424242424242"
        holderName="jane doe"
        expiry="08/28"
        cvv="123"
        brand="visa"
        showBack
      />,
    );
  });

  const texts = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);
  expect(texts).toContain('JANE DOE');
  expect(texts).toContain('08/28');
  expect(texts).toContain('123');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('renders a Mastercard preview without the back logo hint missing', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <CardPreview
        number="5555555555554444"
        holderName="John Smith"
        expiry="12/29"
        cvv=""
        brand="mastercard"
      />,
    );
  });

  const texts = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);
  expect(texts).toContain('•••');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
