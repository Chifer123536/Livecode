import { todo } from '../../../shared/kit'

// #region FUN-10 | Инвертировать предикат | ★☆☆
/**
 *   const isOdd = negate((n: number) => n % 2 === 0)
 *   isOdd(3) → true
 */
export const negate = <A extends unknown[]>(
	predicate: (...args: A) => boolean
): ((...args: A) => boolean) => todo()
// #endregion
