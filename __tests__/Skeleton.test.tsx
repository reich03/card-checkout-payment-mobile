import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Skeleton } from '../src/components/Skeleton';

test('renders with default border radius', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<Skeleton width={100} height={20} />);
  });

  expect(tree!.toJSON()).not.toBeNull();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('renders with a percentage width and custom border radius', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Skeleton width="80%" height={40} borderRadius={4} />,
    );
  });

  expect(tree!.toJSON()).not.toBeNull();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
