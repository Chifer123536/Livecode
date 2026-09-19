import { todo } from '../../../shared/kit'

// #region VAL-01 | Пустое значение | ★★☆
/**
 * Пусто: null, undefined, '', строка из пробелов, пустой массив, объект без ключей.
 * НЕ пусто: 0, false, new Date().
 *
 *   isEmpty('   ') → true
 *   isEmpty(0)     → false
 */
export const isEmpty = (value: unknown): boolean => todo()
// #endregion
