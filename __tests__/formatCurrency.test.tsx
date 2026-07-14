import { formatCop } from '../src/utils/formatCurrency';

test('formats whole COP amounts without decimals', () => {
  const formatted = formatCop(45000);
  expect(formatted).toContain('45');
  expect(formatted).not.toContain(',00');
});

test('formats zero', () => {
  expect(formatCop(0)).toMatch(/0/);
});
