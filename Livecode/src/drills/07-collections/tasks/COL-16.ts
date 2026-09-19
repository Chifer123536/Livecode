import { todo } from '../../../shared/kit'

// #region COL-16 | zip двух итераторов | ★★☆
/**
 * Пары по позициям. Останавливается на КОРОТКОМ.
 *
 *   [...zip([1, 2, 3], 'ab')] → [[1, 'a'], [2, 'b']]
 */
export function* zip<A, B>(a: Iterable<A>, b: Iterable<B>): Generator<[A, B]> {
	todo()
}
// #endregion
