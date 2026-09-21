import { todo } from '../../../shared/kit'

// #region TSB-10 | unknown вместо any | ★★☆
/**
 * Вернуть длину значения: у строки и массива — length, у всего остального 0.
 * Тип unknown требует сузить значение перед любым обращением.
 *
 * Примеры:
 *   lengthOf('абв')     → 3
 *   lengthOf([1, 2])    → 2
 *   lengthOf(42)        → 0
 */
export const lengthOf = (value: unknown): number => todo()
// #endregion
