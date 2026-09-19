import { todo } from '../../../shared/kit'

// #region ASY-20 | Последовательная свёртка | ★★☆
/**
 * Применить асинхронную функцию к аккумулятору по очереди.
 * Это асинхронный reduce: каждый шаг ждёт предыдущего.
 *
 *   reduceAsync([1,2,3], async (acc, n) => acc + n, 0) → 6
 */
export const reduceAsync = <T, A>(
	items: T[],
	fn: (acc: A, item: T, index: number) => Promise<A>,
	initial: A
): Promise<A> => todo()
// #endregion
