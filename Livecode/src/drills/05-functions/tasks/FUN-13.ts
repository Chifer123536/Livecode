import { todo } from '../../../shared/kit'

// #region FUN-13 | Шпион | ★★☆
/**
 * Обёртка, которая помнит все вызовы и результаты.
 * Возвращает саму функцию и доступ к истории.
 *
 *   const { fn, calls, results } = createSpy((n: number) => n * 2)
 */
export type Spy<A extends unknown[], R> = { fn: (...args: A) => R; calls: () => A[]; results: () => R[] }
export const createSpy = <A extends unknown[], R>(target: (...args: A) => R): Spy<A, R> => todo()
// #endregion
