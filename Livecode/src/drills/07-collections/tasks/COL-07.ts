import { todo } from '../../../shared/kit'

// #region COL-07 | Топ-N по значению | ★★☆
/**
 * Пары [ключ, значение] по убыванию значения. При равенстве — порядок вставки.
 *
 *   topN(new Map([['a', 1], ['b', 9]]), 1) → [['b', 9]]
 */
export const topN = <K>(map: Map<K, number>, n: number): Array<[K, number]> => todo()
// #endregion
