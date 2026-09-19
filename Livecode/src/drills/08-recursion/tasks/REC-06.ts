import { todo } from '../../../shared/kit'
import type { Nested } from './_pack'

// #region REC-06 | Выпрямить на N уровней | ★★☆
/**
 * Свой flat: depth по умолчанию — до конца.
 *
 * Примеры:
 *   flattenDeep([1, [2, [3, [4]]]])    → [1, 2, 3, 4]
 *   flattenDeep([1, [2, [3, [4]]]], 1) → [1, 2, [3, [4]]]
 */
export const flattenDeep = <T>(items: Nested<T>, depth?: number): Nested<T> => todo()
// #endregion
