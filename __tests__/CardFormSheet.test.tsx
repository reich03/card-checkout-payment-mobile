import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CardFormSheet } from '../src/components/CardFormSheet';
import { addToCart } from '../src/store/slices/cartSlice';
import { selectSavedCards } from '../src/store/slices/paymentSlice';
import { createTestStore, findTextNodes, pressByText } from '../testUtils';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 375, height: 667 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const coffee = {
  id: 'prod-1',
  name: 'Café Especial',
  description: 'Tueste medio',
  price: 45000,
  stock: 10,
  imageUrl: 'https://example.com/coffee.jpg',
};

function getInput(
  root: ReactTestRenderer.ReactTestInstance,
  placeholder: string,
) {
  return root.findByProps({ placeholder });
}

async function flush() {
  await ReactTestRenderer.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

test('validates required fields and shows inline errors on submit', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  const onCompleted = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <CardFormSheet onCompleted={onCompleted} onRequestClose={jest.fn()} />
        </SafeAreaProvider>
      </Provider>,
    );
  });

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Continuar');
  });
  await flush();

  expect(findTextNodes(tree!.root, 'requerido').length).toBeGreaterThan(0);
  expect(onCompleted).not.toHaveBeenCalled();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('adds a new saved card and dispatches addSavedCard on valid submit', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  const onCompleted = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <CardFormSheet onCompleted={onCompleted} onRequestClose={jest.fn()} />
        </SafeAreaProvider>
      </Provider>,
    );
  });

  await ReactTestRenderer.act(() => {
    getInput(tree!.root, '0000 0000 0000 0000').props.onChangeText(
      '4242424242424242',
    );
  });
  await ReactTestRenderer.act(() => {
    getInput(tree!.root, 'Nombre del titular').props.onChangeText(
      'Jane Doe',
    );
  });
  await ReactTestRenderer.act(() => {
    getInput(tree!.root, '08/28').props.onChangeText('0828');
  });

  const cvvInputs = tree!.root
    .findAllByType(TextInput)
    .filter((node) => node.props.placeholder === '***');
  await ReactTestRenderer.act(() => {
    cvvInputs[0].props.onChangeText('123');
  });

  await ReactTestRenderer.act(() => {
    getInput(tree!.root, 'usuario@ejemplo.com').props.onChangeText(
      'jane@example.com',
    );
  });

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, 'Continuar');
  });
  await flush();

  expect(onCompleted).toHaveBeenCalled();
  const savedCards = selectSavedCards({ payment: store.getState().payment });
  expect(savedCards.some((card) => card.last4 === '4242')).toBe(true);

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('toggles the installments picker and selects an option', async () => {
  const store = createTestStore();
  store.dispatch(addToCart(coffee));
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <CardFormSheet onCompleted={jest.fn()} onRequestClose={jest.fn()} />
        </SafeAreaProvider>
      </Provider>,
    );
  });

  expect(findTextNodes(tree!.root, '1 cuota').length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, '1 cuota');
  });
  expect(findTextNodes(tree!.root, '3 cuotas').length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    pressByText(tree!.root, '3 cuotas');
  });
  expect(findTextNodes(tree!.root, '3 cuotas').length).toBeGreaterThan(0);

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});

test('closes the sheet from the header close button', async () => {
  const store = createTestStore();
  const onRequestClose = jest.fn();
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <CardFormSheet onCompleted={jest.fn()} onRequestClose={onRequestClose} />
        </SafeAreaProvider>
      </Provider>,
    );
  });

  await ReactTestRenderer.act(() => {
    tree!.root.findByProps({ accessibilityLabel: 'Cerrar' }).props.onPress();
  });
  expect(onRequestClose).toHaveBeenCalled();

  await ReactTestRenderer.act(() => {
    tree!.unmount();
  });
});
