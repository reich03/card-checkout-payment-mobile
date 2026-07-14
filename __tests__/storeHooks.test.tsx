import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { createTestStore } from '../testUtils';
import { selectCartCount } from '../src/store/slices/cartSlice';

function Probe({ onRender }: { onRender: (count: number) => void }) {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCartCount);
  onRender(count);
  expect(typeof dispatch).toBe('function');
  return null;
}

test('useAppDispatch and useAppSelector read from the typed store', async () => {
  const store = createTestStore();
  const onRender = jest.fn();

  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(
      <Provider store={store}>
        <Probe onRender={onRender} />
      </Provider>,
    );
  });

  expect(onRender).toHaveBeenCalledWith(0);
});
