import { todo } from '../../../shared/kit'

// #region FUN-22 | Своё каррирование с плейсхолдером | ★★★
/**
 * curry(fn) даёт функцию, которую можно звать по частям.
 * Дополнительно поддержать пропуск аргумента символом _ (экспортирован ниже).
 *
 *   const f = curry3((a, b, c) => `${a}${b}${c}`)
 *
 * Примеры:
 *   f('a', _, 'c')('b') → 'abc'
 */
export const _ = Symbol('placeholder')
export const curry3 = <R>(fn: (a: never, b: never, c: never) => R): ((...args: unknown[]) => unknown) => todo()
// #endregion
