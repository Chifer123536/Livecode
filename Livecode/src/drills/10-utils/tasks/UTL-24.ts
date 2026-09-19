import { todo } from '../../../shared/kit'

// #region UTL-24 | Плоский объект | ★★★
/**
 * Развернуть вложенный объект в плоский с составными ключами через точку.
 * Массивы разворачиваются с индексами в квадратных скобках.
 *
 * Примеры:
 *   flattenObject({ a: { b: 1 }, c: [2] }) → { 'a.b': 1, 'c[0]': 2 }
 */
export const flattenObject = (obj: object): Record<string, unknown> => todo()
// #endregion
