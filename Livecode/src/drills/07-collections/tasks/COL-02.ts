import { todo } from '../../../shared/kit'

// #region COL-02 | Группировка в Map | ★★☆
/**
 * Примеры:
 * Ключ → массив элементов. Порядок элементов внутри группы сохраняется.
 *
 *   groupToMap([1, 2, 3, 4], n => n % 2) → Map { 1 => [1, 3], 0 => [2, 4] }
 */
export const groupToMap = <T, K>(items: Iterable<T>, keyFn: (item: T) => K): Map<K, T[]> => todo()
// #endregion
