import { todo } from '../../../shared/kit'
import type { Product } from './_pack'

// #region DAT-10 | Распределение по диапазонам | ★★★
/**
 * Гистограмма цен. Границы заданы возрастающим списком, последний диапазон — открытый.
 * Верхняя граница НЕ включается.
 *
 *   priceBuckets(items, [0, 100, 500])
 *
 * Примеры:
 *     → [{ from: 0, to: 100, count: 2 }, { from: 100, to: 500, count: 1 }, { from: 500, to: null, count: 0 }]
 */
export type Bucket = { from: number; to: number | null; count: number }
export const priceBuckets = (items: Product[], bounds: number[]): Bucket[] => todo()
// #endregion
