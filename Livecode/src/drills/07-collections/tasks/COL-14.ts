import { todo } from '../../../shared/kit'
import { fibonacci } from './COL-18'

// #region COL-14 | Взять N из итератора | ★★☆
/**
 * Первые n значений любой итерируемой сущности. Обязан работать с бесконечной:
 * никакого разворачивания в массив внутри.
 *
 *   take(fibonacci(), 5) → [0, 1, 1, 2, 3]
 */
export const take = <T>(iterable: Iterable<T>, n: number): T[] => todo()
// #endregion
