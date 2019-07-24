import { Perudo } from '../src';

test('create new game instance', () => {
  const perudo = Perudo.Instance;
  expect(perudo).not.toBeNull();
  expect(perudo).not.toBeUndefined();
});
