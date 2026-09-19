import { todo } from '../../../shared/kit'

// #region ARR-16 | Разделить надвое | ★★☆
/**
 * Разложить на [подошедшие, не подошедшие] за ОДИН проход.
 *
 *   partition([1, 2, 3, 4], n => n % 2 === 0) → [[2, 4], [1, 3]]
 */
export const partition = <T>(list: T[], predicate: (item: T) => boolean): [T[], T[]] => todo()
// #endregion
