import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { HomeSkeleton } from '../src/components/HomeSkeleton';

test('renders the skeleton grid', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<HomeSkeleton />);
  });

  expect(tree!.toJSON()).not.toBeNull();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
