import { todo } from '../../../shared/kit'

// #region FUN-06 | Ограничить число вызовов | ★★☆
/**
 * После max вызовов функция больше не выполняется, а возвращает последний результат.
 *
 *   const limited = limitCalls(fn, 2)
 */
export const limitCalls = <A extends unknown[], R>(fn: (...args: A) => R, max: number): ((...args: A) => R) => todo()
// #endregion
