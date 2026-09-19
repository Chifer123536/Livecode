import { todo } from '../../../shared/kit'

// #region COL-01 | Подсчёт в Map | ★☆☆
/**
 * Сколько раз встретился каждый ключ.
 *
 * Примеры:
 *   countBy(['a', 'b', 'a'], x => x) → Map { 'a' => 2, 'b' => 1 }
 */
export const countBy = <T, K>(items: Iterable<T>, keyFn: (item: T) => K): Map<K, number> => todo()
// #endregion
