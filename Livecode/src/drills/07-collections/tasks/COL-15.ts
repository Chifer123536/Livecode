import { todo } from '../../../shared/kit'
import { range } from './COL-13'
import { take } from './COL-14'

// #region COL-15 | Ленивые map и filter | ★★★
/**
 * Генераторы, которые не материализуют промежуточный массив.
 * take(lazyMap(range(0, 1e9), n => n * 2), 3) обязан вернуться мгновенно.
 */
export function* lazyMap<T, R>(iterable: Iterable<T>, fn: (item: T) => R): Generator<R> {
	todo()
}
export function* lazyFilter<T>(iterable: Iterable<T>, predicate: (item: T) => boolean): Generator<T> {
	todo()
}
// #endregion
