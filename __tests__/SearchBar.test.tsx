import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { TextInput } from 'react-native';
import { SearchBar } from '../src/components/SearchBar';

test('forwards text changes to the caller', async () => {
  const onChangeText = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SearchBar value="" onChangeText={onChangeText} />,
    );
  });

  tree!.root.findByType(TextInput).props.onChangeText('café');
  expect(onChangeText).toHaveBeenCalledWith('café');

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
