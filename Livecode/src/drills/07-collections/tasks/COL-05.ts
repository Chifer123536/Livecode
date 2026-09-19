import { todo } from '../../../shared/kit'

// #region COL-05 | Инвертировать Map | ★★☆
/**
 * Значения становятся ключами. Одинаковые значения схлопываются — побеждает последнее.
 *
 * Примеры:
 *   invert(new Map([['a', 1], ['b', 2]])) → Map { 1 => 'a', 2 => 'b' }
 */
export const invert = <K, V>(map: Map<K, V>): Map<V, K> => todo()
// #endregion
