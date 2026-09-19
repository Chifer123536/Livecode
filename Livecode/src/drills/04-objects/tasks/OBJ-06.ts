import { todo } from '../../../shared/kit'

// #region OBJ-06 | Отфильтровать по значению | ★★☆
/**
 *   pickBy({ a: 1, b: 0, c: 3 }, n => n > 0) → { a: 1, c: 3 }
 */
export const pickBy = <V>(obj: Record<string, V>, predicate: (value: V, key: string) => boolean): Record<string, V> =>
	todo()
// #endregion
