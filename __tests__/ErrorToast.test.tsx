import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { ErrorToast } from '../src/components/ErrorToast';

test('renders nothing when not visible and there is no message', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<ErrorToast visible={false} message="" />);
  });

  expect(tree!.toJSON()).toBeNull();
});

test('renders the message text when visible', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <ErrorToast visible message="Algo salió mal" />,
    );
  });

  const text = tree!.root.findByType(Text).props.children;
  expect(Array.isArray(text) ? text.join('') : text).toContain(
    'Algo salió mal',
  );
});

test('re-renders the hide animation when visibility toggles off with a message', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <ErrorToast visible message="Error persistente" />,
    );
  });

  await ReactTestRenderer.act(() => {
    tree!.update(<ErrorToast visible={false} message="Error persistente" />);
  });

  expect(tree!.toJSON()).not.toBeNull();
});
