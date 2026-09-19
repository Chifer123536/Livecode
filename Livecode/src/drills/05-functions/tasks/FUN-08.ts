import { todo } from '../../../shared/kit'

// #region FUN-08 | Частичное применение | ★★☆
/**
 * Зафиксировать первые аргументы, остальные дописать при вызове.
 *
 *   const greetHi = partial(greet, 'Привет')
 *   greetHi('Аня') → 'Привет, Аня'
 *
 * Отличие от каррирования обязательно уметь объяснить.
 */
export const partial = <R>(
	fn: (...args: never[]) => R,
	...preset: unknown[]
): ((...rest: unknown[]) => R) => todo()
// #endregion
