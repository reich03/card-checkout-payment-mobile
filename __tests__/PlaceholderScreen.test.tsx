import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { PlaceholderScreen } from '../src/screens/PlaceholderScreen';
import { CardInfoScreen } from '../src/screens/CardInfoScreen';
import { PaymentSummaryScreen } from '../src/screens/PaymentSummaryScreen';

test('renders the given title and subtitle', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <PlaceholderScreen title="Título" subtitle="Subtítulo" />,
    );
  });

  const texts = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);
  expect(texts).toContain('Título');
  expect(texts).toContain('Subtítulo');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('CardInfoScreen renders its static copy', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<CardInfoScreen />);
  });

  const texts = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);
  expect(texts).toContain('Datos de tarjeta');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('PaymentSummaryScreen renders the placeholder copy', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<PaymentSummaryScreen />);
  });

  const texts = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);
  expect(texts).toContain('Payment Summary');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
