import { todo } from '../../../shared/kit'

// #region COL-09 | Пересечение и разность | ★★☆
/**
 *   intersection(new Set([1, 2, 3]), new Set([2, 3, 4])) → Set { 2, 3 }
 *   difference(new Set([1, 2, 3]), new Set([2]))         → Set { 1, 3 }
 *
 * Разность несимметрична: difference(a, b) — это «что есть в a и нет в b».
 */
export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => todo()
export const difference = <T>(a: Set<T>, b: Set<T>): Set<T> => todo()
// #endregion
