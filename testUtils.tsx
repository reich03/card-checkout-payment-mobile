import { configureStore } from '@reduxjs/toolkit';
import type ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import cartReducer, { type CartState } from './src/store/slices/cartSlice';
import paymentReducer, {
  type PaymentState,
} from './src/store/slices/paymentSlice';

export function createTestStore(preloadedState?: {
  cart?: Partial<CartState>;
  payment?: Partial<PaymentState>;
}) {
  return configureStore({
    reducer: { cart: cartReducer, payment: paymentReducer },
    preloadedState: preloadedState as never,
  });
}

function flattenText(children: unknown): string {
  if (children == null) {
    return '';
  }
  if (Array.isArray(children)) {
    return children.map(flattenText).join('');
  }
  return String(children);
}

/** Finds every <Text> node whose flattened content includes `text`. */
export function findTextNodes(
  root: ReactTestRenderer.ReactTestInstance,
  text: string,
) {
  return root
    .findAllByType(Text)
    .filter((node) => flattenText(node.props.children).includes(text));
}

/**
 * Walks up from the Nth <Text> node containing `text` (0-indexed, in tree
 * order) until it finds an ancestor exposing an `onPress` handler (i.e. the
 * enclosing Pressable), then invokes it. Throws if no matching text or
 * pressable is found. Useful when the same copy renders in more than one
 * place (e.g. a CTA that's duplicated inside a bottom sheet).
 */
export function pressByText(
  root: ReactTestRenderer.ReactTestInstance,
  text: string,
  occurrence = 0,
) {
  const textNode = findTextNodes(root, text)[occurrence];
  if (!textNode) {
    throw new Error(`No text node found for "${text}" at index ${occurrence}`);
  }
  let node: ReactTestRenderer.ReactTestInstance | null = textNode;
  while (node && typeof node.props.onPress !== 'function') {
    node = node.parent;
  }
  if (!node) {
    throw new Error(`No pressable ancestor found for "${text}"`);
  }
  node.props.onPress();
}

export function flushMicrotasks() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
