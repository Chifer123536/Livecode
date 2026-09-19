import { todo } from '../../../shared/kit'

// #region UTL-15 | pipe и compose | ★★☆
/**
 * pipe применяет функции СЛЕВА НАПРАВО, compose — справа налево.
 *
 *   pipe(a, b, c)(x) === c(b(a(x)))
 *   compose(a, b, c)(x) === a(b(c(x)))
 */
export const pipe = (...fns: Array<(value: never) => unknown>): ((value: unknown) => unknown) => todo()
export const compose = (...fns: Array<(value: never) => unknown>): ((value: unknown) => unknown) => todo()
// #endregion
