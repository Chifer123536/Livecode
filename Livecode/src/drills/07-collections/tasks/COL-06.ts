import { todo } from '../../../shared/kit'

// #region COL-06 | Слить с суммированием | ★★☆
/**
 * Несколько счётчиков в один. Ключи, которых не было, добавляются.
 *
 *   mergeSum(new Map([['a', 1]]), new Map([['a', 2], ['b', 5]]))
 *
 * Примеры:
 *     → Map { 'a' => 3, 'b' => 5 }
 */
export const mergeSum = <K>(...maps: Map<K, number>[]): Map<K, number> => todo()
// #endregion
