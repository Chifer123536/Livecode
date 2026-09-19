import { todo } from '../../../shared/kit'

// #region ARR-06 | Последние N | ★★☆
/**
 * Последние n элементов. n === 0 → пустой массив (осторожно со slice(-0)).
 *
 *   lastN([1, 2, 3, 4], 2) → [3, 4]
 *   lastN([1, 2], 10)      → [1, 2]
 *   lastN([1, 2], 0)       → []
 */
export const lastN = <T>(list: T[], n: number): T[] => todo()
// #endregion
