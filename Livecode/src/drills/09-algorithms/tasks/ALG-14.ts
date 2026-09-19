import { todo } from '../../../shared/kit'

// #region ALG-14 | Слить пересекающиеся интервалы | ★★★
/**
 * Отсортировать по началу, потом склеивать, пока следующий начинается не позже конца текущего.
 * Касание считается пересечением.
 *
 *   mergeIntervals([[1, 3], [2, 6], [8, 10]]) → [[1, 6], [8, 10]]
 */
export type Interval = [number, number]
export const mergeIntervals = (intervals: Interval[]): Interval[] => todo()
// #endregion
