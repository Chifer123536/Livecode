import { todo } from '../../../shared/kit'

// #region UTL-16 | Свой bind | ★★★
/**
 * Реализовать аналог Function.prototype.bind: привязать this и часть аргументов.
 * Остальные аргументы дописываются при вызове.
 */
export const myBind = <T, A extends unknown[], R>(
	fn: (this: T, ...args: A) => R,
	context: T,
	...bound: unknown[]
): ((...args: unknown[]) => R) => todo()
// #endregion
