import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { HomeHeader } from '../src/components/HomeHeader';

test('hides the cart badge when the count is zero', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <HomeHeader count={0} onPressCart={jest.fn()} />,
    );
  });

  const texts = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);
  expect(texts).not.toContain('0');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('shows the numeric badge for small counts and calls onPressCart', async () => {
  const onPressCart = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <HomeHeader count={3} onPressCart={onPressCart} />,
    );
  });

  const texts = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);
  expect(texts).toContain(3);

  await ReactTestRenderer.act(() => {
    tree!.root
      .findByProps({ accessibilityLabel: 'Abrir carrito' })
      .props.onPress();
  });
  expect(onPressCart).toHaveBeenCalled();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('caps the badge label at 9+ for large counts', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <HomeHeader count={25} onPressCart={jest.fn()} />,
    );
  });

  const texts = tree!.root
    .findAllByType(Text)
    .map((node) => node.props.children);
  expect(texts).toContain('9+');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
