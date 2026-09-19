import { todo } from '../../../shared/kit'

// #region COL-03 | Индекс по ключу | ★☆☆
/**
 * Ключ → сам элемент. При дубле ключа побеждает последний.
 * Так из списка с сервера делают справочник за O(1) вместо find по массиву.
 */
export const indexBy = <T, K>(items: Iterable<T>, keyFn: (item: T) => K): Map<K, T> => todo()
// #endregion
