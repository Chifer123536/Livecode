import { todo } from '../../../shared/kit'

// #region FUN-09 | Поменять аргументы местами | ★★☆
/**
 * Развернуть первые два аргумента.
 *
 *   const divide = (a, b) => a / b
 *
 * Примеры:
 *   flip(divide)(2, 10) → 5
 */
export const flip = <R>(fn: (...args: never[]) => R): ((...args: unknown[]) => R) => todo()
// #endregion
