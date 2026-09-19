import { todo } from '../../../shared/kit'

// #region UTL-14 | curry | ★★★
/**
 * Каррирование функции фиксированной арности: вызывать можно по одному аргументу
 * или пачками, пока не наберётся нужное количество.
 *
 *   const add = curry((a, b, c) => a + b + c)
 *   add(1)(2)(3) === add(1, 2)(3) === add(1, 2, 3) === 6
 */
export const curry = (fn: (...args: never[]) => unknown): ((...args: unknown[]) => unknown) => todo()
// #endregion
