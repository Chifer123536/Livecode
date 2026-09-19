import { todo } from '../../../shared/kit'

// #region DAT-11 | Соединение по ключу | ★★☆
/**
 * Левое соединение: к каждому элементу слева подставить совпадение справа или null.
 * Реализация через Map — O(n + m), через find внутри map — O(n·m).
 *
 *   leftJoin(orders, users, 'userId', 'id', 'user')
 */
export const leftJoin = <L extends object, R extends object, K extends string>(
	left: L[],
	right: R[],
	leftKey: keyof L,
	rightKey: keyof R,
	as: K
): Array<L & Record<K, R | null>> => todo()
// #endregion
