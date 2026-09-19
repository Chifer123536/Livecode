import { todo } from '../../../shared/kit'

// #region VAL-06 | Число в диапазоне | ★★☆
/**
 * Строка из формы — тоже число, но '' и 'abc' числами не являются.
 * Границы включительно.
 *
 * Примеры:
 *   inRange('5', 1, 10) → true
 *   inRange('', 1, 10)  → false
 *   inRange(NaN, 1, 10) → false
 */
export const inRange = (value: string | number, min: number, max: number): boolean => todo()
// #endregion
