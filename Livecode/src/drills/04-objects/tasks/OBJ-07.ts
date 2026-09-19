import { todo } from '../../../shared/kit'

// #region OBJ-07 | Выкинуть по значению | ★★☆
/**
 * Примеры:
 *   omitBy({ a: 1, b: 0 }, n => n === 0) → { a: 1 }
 */
export const omitBy = <V>(obj: Record<string, V>, predicate: (value: V, key: string) => boolean): Record<string, V> =>
	todo()
// #endregion
