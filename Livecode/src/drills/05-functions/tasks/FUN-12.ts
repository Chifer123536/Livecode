import { todo } from '../../../shared/kit'

// #region FUN-12 | Ограничить арность | ★★☆
/**
 * Обрезать функцию до n аргументов, лишние отбросить.
 *
 * Практика: ['1','2','3'].map(parseInt) даёт [1, NaN, NaN],
 * потому что map передаёт индекс вторым аргументом. arity(parseInt, 1) это чинит.
 */
export const arity = <R>(fn: (...args: never[]) => R, n: number): ((...args: unknown[]) => R) => todo()
// #endregion
